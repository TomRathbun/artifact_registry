from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles  # Import StaticFiles
from app.api.v1.router import api_router
from app.core.config import settings

import os

app = FastAPI(title=settings.PROJECT_NAME, version="0.1.0")

# Get absolute path to the project root (one level up from app/)
# main.py is in /app/main.py
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
UPLOAD_DIR = os.path.join(root_dir, "uploads")

# Verify it exists
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

print(f"Mounting /uploads to: {UPLOAD_DIR}")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix="/api/v1")