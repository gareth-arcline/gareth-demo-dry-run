from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import health, auth, notes

app = FastAPI(title="Notes Summarizer API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])

@app.get("/")
async def root():
    return {"message": "Arcline App API"}
