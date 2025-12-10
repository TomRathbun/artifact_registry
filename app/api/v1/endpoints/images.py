from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

router = APIRouter()

# Use absolute path relative to project root (assuming this file is in app/api/v1/endpoints)
# Project root is ../../../../
BASE_DIR = Path(__file__).resolve().parents[4]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True) # Ensure it exists

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Basic sanitization could be added here
        file_path = UPLOAD_DIR / file.filename
        
        # If file exists, overwrite or rename? Overwrite for now as per simple req.
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"filename": file.filename, "url": f"/uploads/{file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.delete("/{filename}")
def delete_image(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    try:
        os.remove(file_path)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@router.get("/")
def list_images():
    images = []
    if UPLOAD_DIR.exists():
        # Get all files, sorted by modified time (newest first)
        files = sorted(UPLOAD_DIR.glob("*"), key=os.path.getmtime, reverse=True)
        
        for f in files:
            if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']:
                images.append({
                    "filename": f.name, 
                    "url": f"/uploads/{f.name}",
                    "size": f.stat().st_size,
                    "created": f.stat().st_ctime
                })
    return images

class RenameRequest(BaseModel):
    new_filename: str

@router.put("/{filename}/rename")
def rename_image(filename: str, request: RenameRequest):
    old_path = UPLOAD_DIR / filename
    if not old_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Sanitize new filename lightly (prevent directory traversal)
    new_filename = Path(request.new_filename).name
    new_path = UPLOAD_DIR / new_filename
    
    if new_path.exists():
        raise HTTPException(status_code=400, detail="A file with that name already exists")
    
    try:
        old_path.rename(new_path)
        return {
            "filename": new_filename,
            "url": f"/uploads/{new_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rename image: {str(e)}")
