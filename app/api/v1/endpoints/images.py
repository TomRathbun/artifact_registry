import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.db.models.image import Image as ImageModel
from app.utils.paths import safe_join, sanitize_filename

router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    db: Session = Depends(deps.get_db),
    _user=Depends(deps.get_current_user),
):
    try:
        filename = sanitize_filename(file.filename)
        file_path = safe_join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        existing = (
            db.query(ImageModel).filter(ImageModel.filename == filename).first()
        )
        if not existing:
            db.add(ImageModel(filename=filename, project_id=project_id))
            db.commit()

        return {"filename": filename, "url": f"/uploads/{filename}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/{filename}")
def delete_image(
    filename: str,
    db: Session = Depends(deps.get_db),
    _user=Depends(deps.get_current_user),
):
    safe_name = sanitize_filename(filename)
    file_path = safe_join(UPLOAD_DIR, safe_name)

    db_image = (
        db.query(ImageModel).filter(ImageModel.filename == safe_name).first()
    )
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
        raise HTTPException(
            status_code=500, detail=f"Failed to delete image: {str(e)}"
        )


@router.get("/")
def list_images(
    project_id: str = None,
    db: Session = Depends(deps.get_db),
    _user=Depends(deps.get_current_user),
):
    query = db.query(ImageModel)
    if project_id:
        query = query.filter(
            or_(
                ImageModel.project_id == project_id,
                ImageModel.project_id == None,  # noqa: E711
            )
        )

    results = []
    for img in query.all():
        path = safe_join(UPLOAD_DIR, sanitize_filename(img.filename))
        size = path.stat().st_size if path.exists() else 0
        results.append(
            {
                "filename": img.filename,
                "url": f"/uploads/{img.filename}",
                "size": size,
                "created": img.created_at,
                "project_id": img.project_id,
            }
        )
    return results


class RenameRequest(BaseModel):
    new_filename: str


@router.put("/{filename}/rename")
def rename_image(
    filename: str,
    request: RenameRequest,
    db: Session = Depends(deps.get_db),
    _user=Depends(deps.get_current_user),
):
    old_name = sanitize_filename(filename)
    new_name = sanitize_filename(request.new_filename)
    old_path = safe_join(UPLOAD_DIR, old_name)
    new_path = safe_join(UPLOAD_DIR, new_name)

    if not old_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    if new_path.exists():
        raise HTTPException(
            status_code=400, detail="A file with that name already exists"
        )

    try:
        old_path.rename(new_path)
        db_image = (
            db.query(ImageModel).filter(ImageModel.filename == old_name).first()
        )
        if db_image:
            db_image.filename = new_name
            db.commit()
        return {"filename": new_name, "url": f"/uploads/{new_name}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to rename image: {str(e)}"
        )
