import os
import uuid
import re
from pathlib import Path
from .config import settings


class FileManager:
    def __init__(self):
        self.base_dir = Path(settings.UPLOAD_FOLDER)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def get_user_directory(self, user_oid: str) -> Path:
        safe_oid = re.sub(r'[^a-zA-Z0-9_-]', '', user_oid)
        user_dir = self.base_dir / safe_oid
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir

    def generate_file_id(self) -> str:
        return str(uuid.uuid4())[:8]

    def sanitize_filename(self, filename: str) -> str:
        name = re.sub(r'[^\w\s\-.]', '', filename)
        name = re.sub(r'\s+', '_', name)
        return name

    def save_upload(self, file_content: bytes, original_filename: str, user_oid: str) -> tuple[str, Path]:
        file_id = self.generate_file_id()
        safe_name = self.sanitize_filename(original_filename)
        filename = f"{file_id}_{safe_name}"
        user_dir = self.get_user_directory(user_oid)
        filepath = user_dir / filename
        filepath.write_bytes(file_content)
        return file_id, filepath

    def delete_file(self, filepath: Path) -> None:
        if filepath.exists():
            filepath.unlink()

    def cleanup_user_files(self, user_oid: str) -> None:
        user_dir = self.get_user_directory(user_oid)
        if user_dir.exists():
            for f in user_dir.iterdir():
                if f.is_file() and f.name != '.gitkeep':
                    f.unlink()


file_manager = FileManager()
