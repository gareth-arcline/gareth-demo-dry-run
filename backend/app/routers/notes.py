import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
from typing import List

from ..core.security import get_current_user
from ..core.config import settings
from ..core.file_manager import file_manager
from ..models.user import CurrentUser
from ..models.notes import (
    FileMetadata, UploadResponse,
    GenerateOutlineRequest, GenerateOutlineResponse,
    UpdateOutlineRequest, UpdateOutlineResponse,
    GenerateContentRequest, GenerateContentResponse,
)
from ..services.mock_generator import generate_mock_outline, generate_mock_content
from ..services.docx_generator import create_document

router = APIRouter()

ALLOWED_EXTENSIONS = {'.docx', '.doc', '.pptx', '.ppt', '.eml', '.msg', '.txt', '.pdf', '.md'}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

# In-memory session state keyed by user OID
sessions: dict = {}


def get_session(user_oid: str) -> dict:
    if user_oid not in sessions:
        sessions[user_oid] = {
            "files": {},
            "outline": None,
            "generated_content": None,
        }
    return sessions[user_oid]


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    if not files:
        raise HTTPException(status_code=400, detail="At least one file is required")

    session = get_session(current_user.oid)
    uploaded = []

    for upload_file in files:
        ext = os.path.splitext(upload_file.filename)[1].lower() if '.' in upload_file.filename else ''
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        contents = await upload_file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File '{upload_file.filename}' exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        file_id, filepath = file_manager.save_upload(contents, upload_file.filename, current_user.oid)

        meta = FileMetadata(
            file_id=file_id,
            file_name=upload_file.filename,
            file_size=len(contents),
            file_type=ext,
        )
        session["files"][file_id] = {
            "metadata": meta,
            "path": str(filepath),
        }
        uploaded.append(meta)

    return UploadResponse(files=uploaded)


@router.post("/generate-outline", response_model=GenerateOutlineResponse)
async def generate_outline(
    request: GenerateOutlineRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    session = get_session(current_user.oid)

    for fid in request.file_ids:
        if fid not in session["files"]:
            raise HTTPException(status_code=404, detail=f"File with ID '{fid}' not found")

    outline = generate_mock_outline(request.prompt, len(request.file_ids))
    session["outline"] = outline

    return GenerateOutlineResponse(outline=outline)


@router.put("/outline", response_model=UpdateOutlineResponse)
async def update_outline(
    request: UpdateOutlineRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    session = get_session(current_user.oid)
    session["outline"] = request.outline

    return UpdateOutlineResponse(outline=request.outline)


@router.post("/generate", response_model=GenerateContentResponse)
async def generate_notes(
    request: GenerateContentRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    session = get_session(current_user.oid)

    for fid in request.file_ids:
        if fid not in session["files"]:
            raise HTTPException(status_code=404, detail=f"File with ID '{fid}' not found")

    notes = generate_mock_content(request.outline)
    session["generated_content"] = notes

    return GenerateContentResponse(notes=notes)


@router.get("/download")
async def download_notes(
    current_user: CurrentUser = Depends(get_current_user),
):
    session = get_session(current_user.oid)

    if not session.get("generated_content"):
        raise HTTPException(status_code=404, detail="No generated notes found. Generate notes first.")

    filepath = create_document(session["generated_content"], current_user.oid)

    return FileResponse(
        path=str(filepath),
        filename="Notes_Summary.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    session = get_session(current_user.oid)

    if file_id not in session["files"]:
        raise HTTPException(status_code=404, detail=f"File with ID '{file_id}' not found")

    from pathlib import Path
    file_manager.delete_file(Path(session["files"][file_id]["path"]))
    del session["files"][file_id]

    return None
