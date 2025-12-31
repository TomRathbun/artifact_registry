from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router
from app.core.config import settings
import os

app = FastAPI(title=settings.PROJECT_NAME, version="0.1.0")

# EXTREMELY EXPLICIT MOUNTING UNIT
upload_path = str(settings.UPLOAD_DIR.resolve())
print(f"!!! MOUNTING START !!!")
print(f"MOUNTING /uploads TO: {upload_path}")
print(f"PATH EXISTS? {os.path.exists(upload_path)}")
print(f"!!!!!!!!!!!!!!!!!!!!!!!")

app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")

app.include_router(api_router, prefix="/api/v1")