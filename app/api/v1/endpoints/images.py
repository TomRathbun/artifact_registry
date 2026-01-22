from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import shutil
import os
from pathlib import Path
from typing import List
from pydantic import BaseModel
from app.core.config import settings
from sqlalchemy.orm import Session
from app.api.deps import get_db

router = APIRouter()


UPLOAD_DIR = settings.UPLOAD_DIR

from app.db.models.image import Image as ImageModel
from fastapi import Form, Query
from sqlalchemy import or_

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...), 
    project_id: str = Form(None),
    db: Session = Depends(get_db) # Need to inject db session here, requires import update? No, existing import 'get_db' is in site.py not here. Need to check imports.
):
    try:
        # Check if file exists in DB? Or just overwrite?
        # For simplicity, we save file and create DB entry.
        
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create DB record
        # Check if exists
        existing = db.query(ImageModel).filter(ImageModel.filename == file.filename).first()
        if not existing:
            new_image = ImageModel(
                filename=file.filename,
                project_id=project_id
            )
            db.add(new_image)
            db.commit()
            
        return {"filename": file.filename, "url": f"/uploads/{file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@router.delete("/{filename}")
def delete_image(filename: str, db: Session = Depends(get_db)): # Add db dependency
    file_path = UPLOAD_DIR / filename
    
    # Delete from DB
    db_image = db.query(ImageModel).filter(ImageModel.filename == filename).first()
    if db_image:
        db.delete(db_image)
        db.commit()
        
    if not file_path.exists() and not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    try:
        if file_path.exists():
            os.remove(file_path)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

@router.get("/")
def list_images(project_id: str = None, db: Session = Depends(get_db)): # Add db dependency
    query = db.query(ImageModel)
    
    # Sync filesystem with DB? 
    # For now, let's just return what's in DB, plus maybe what's on disk if we want to be robust?
    # Let's trust DB for scoping.
    
    if project_id:
        query = query.filter(or_(ImageModel.project_id == project_id, ImageModel.project_id == None))
        
    db_images = query.all()
    
    results = []
    for img in db_images:
        path = UPLOAD_DIR / img.filename
        size = path.stat().st_size if path.exists() else 0
        results.append({
            "filename": img.filename,
            "url": f"/uploads/{img.filename}",
            "size": size,
            "created": img.created_at,
            "project_id": img.project_id
        })
        
    return results

class RenameRequest(BaseModel):
    new_filename: str

@router.put("/{filename}/rename")
def rename_image(filename: str, request: RenameRequest):
    old_path = UPLOAD_DIR / filename
    if not old_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
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
