from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.models.vision import Vision
from app.db.session import get_db
from app.schemas.vision import VisionCreate, VisionOut
from app.utils.id_generator import generate_artifact_id

router = APIRouter(prefix="/vision-statements", tags=["Vision Statements"])

# -------------------------------------------------
# GET – list (filterable)
# -------------------------------------------------
@router.get("/", response_model=List[VisionOut])
def list_vision_statements(
    project_id: str = Query(..., description="Filter by project ID"),
    search: Optional[str] = Query(None, description="Keyword search in title/description"),
    db: Session = Depends(get_db),
):
    query = db.query(Vision).filter(Vision.project_id == project_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Vision.title.ilike(search_term)) | (Vision.description.ilike(search_term))
        )
    return query.all()

# -------------------------------------------------
# POST – create
# -------------------------------------------------
@router.post("/", response_model=VisionOut, status_code=status.HTTP_201_CREATED)
def create_vision_statement(payload: VisionCreate, db: Session = Depends(get_db)):
    vision = Vision(
        aid=generate_artifact_id(db, Vision, "GLOBAL", payload.project_id),
        **payload.model_dump()
    )
    db.add(vision)
    db.commit()
    db.refresh(vision)
    return vision

# -------------------------------------------------
# GET – by id
# -------------------------------------------------
@router.get("/{aid}", response_model=VisionOut)
def get_vision_statement(aid: str, db: Session = Depends(get_db)):
    obj = db.query(Vision).filter(Vision.aid == aid).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Vision Statement not found")
    return obj

# -------------------------------------------------
# PUT – update (partial)
# -------------------------------------------------
@router.put("/{aid}", response_model=VisionOut)
def update_vision_statement(
    aid: str,
    payload: VisionCreate,
    db: Session = Depends(get_db),
):
    db_obj = db.query(Vision).filter(Vision.aid == aid).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Vision Statement not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db_obj.last_updated = datetime.now()
    db.commit()
    db.refresh(db_obj)
    return db_obj

# -------------------------------------------------
# DELETE
# -------------------------------------------------
@router.delete("/{aid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vision_statement(aid: str, db: Session = Depends(get_db)):
    from app.db.models.linkage import Linkage
    
    db_obj = db.query(Vision).filter(Vision.aid == aid).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Vision Statement not found")
    
    # Delete all associated linkages (both where this is source or target)
    linkages = db.query(Linkage).filter(
        (Linkage.source_id == aid) | (Linkage.target_id == aid)
    ).all()
    for linkage in linkages:
        db.delete(linkage)
    
    # Delete the vision
    db.delete(db_obj)
    db.commit()
    return None