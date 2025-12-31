from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api import deps
from app.db.models.document import Document, DocumentType
from app.schemas import document as schemas
from app.utils.id_generator import generate_artifact_id
from app.core.config import settings
import shutil
import os
from pathlib import Path
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR

@router.get("/", response_model=List[schemas.Document])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    project_id: str = None
):
    query = db.query(Document)
    if project_id:
        query = query.filter(Document.project_id == project_id)
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Document)
def create_document(
    doc_in: schemas.DocumentCreate,
    db: Session = Depends(deps.get_db)
):
    # Use centralized ID generator
    aid = generate_artifact_id(db, Document, doc_in.area or "GEN", doc_in.project_id)
    
    db_obj = Document(
        aid=aid,
        title=doc_in.title,
        description=doc_in.description,
        document_type=doc_in.document_type,
        content_url=doc_in.content_url,
        content_text=doc_in.content_text,
        mime_type=doc_in.mime_type,
        area=doc_in.area,
        project_id=doc_in.project_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    return db_obj

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file and return the local path.
    """
    try:
        file_id = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        file_path = UPLOAD_DIR / file_id
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "url": f"/api/v1/documents/files/{file_id}",  # Return URL instead of file path
            "filename": file.filename,
            "content_type": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

@router.get("/files/{filename}")
async def serve_file(filename: str):
    """
    Serve an uploaded file.
    """
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.get("/{aid}", response_model=schemas.Document)
def read_document(
    aid: str,
    db: Session = Depends(deps.get_db)
):
    document = db.query(Document).filter(Document.aid == aid).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.put("/{aid}", response_model=schemas.Document)
def update_document(
    aid: str,
    doc_in: schemas.DocumentUpdate,
    db: Session = Depends(deps.get_db)
):
    document = db.query(Document).filter(Document.aid == aid).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    update_data = doc_in.dict(exclude_unset=True)
    # Ensure invalid fields aren't processed if Pydantic didn't catch them (extra safety)
    valid_fields = ['title', 'description', 'content_url', 'content_text', 'mime_type', 'document_type', 'status', 'area']
    for field, value in update_data.items():
        if field in valid_fields:
            setattr(document, field, value)
        
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.delete("/{aid}", response_model=schemas.Document)
def delete_document(
    aid: str,
    db: Session = Depends(deps.get_db)
):
    document = db.query(Document).filter(Document.aid == aid).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    db.delete(document)
    db.commit()
    return document
