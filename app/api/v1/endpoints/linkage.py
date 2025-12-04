from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4

from app.db.session import get_db
from app.db.models.linkage import Linkage
from app.schemas.linkage import LinkageCreate, LinkageOut

router = APIRouter(prefix="/linkages", tags=["Linkages"])

def _artifact_exists(db: Session, typ: str, aid: str) -> bool:
    # Skip check for external links
    if typ in ["url", "external", "file"]:
        return True
    # from app.db.models import __all__ as all_models
    model_map = {
        "vision": "Vision",
        "need": "Need",
        "use_case": "UseCase",
        "requirement": "Requirement",
        "diagram": "Diagram",
        "component": "Component",
    }
    model_name = model_map.get(typ)

    if not model_name:
        return False
    # dynamic import – safe because we control the map
    import importlib
    if typ == "component":
         mod = importlib.import_module("app.db.models.component")
    elif typ == "diagram":
         mod = importlib.import_module("app.db.models.diagram")
    else:
         mod = importlib.import_module(f"app.db.models.{typ}")
    model = getattr(mod, model_name)
    # print(model) # Debug print removed
    # Component and Diagram use 'id' not 'aid'
    if typ == "component" or typ == "diagram":
        return db.query(model).filter(model.id == aid).first() is not None
    return db.query(model).filter(model.aid == aid).first() is not None

@router.get("/", response_model=List[LinkageOut])
def list_linkages(project_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Linkage)
    if project_id:
        query = query.filter(Linkage.project_id == project_id)
    return query.all()

@router.get("/{aid}", response_model=LinkageOut)
def get_linkage(aid: str, db: Session = Depends(get_db)):
    obj = db.query(Linkage).filter(Linkage.aid == aid).first()
    if not obj:
        raise HTTPException(404, "Linkage not found")
    return obj

@router.post("/", response_model=LinkageOut, status_code=status.HTTP_201_CREATED)
def create_linkage(payload: LinkageCreate, db: Session = Depends(get_db)):
    if not _artifact_exists(db, payload.source_artifact_type, payload.source_id):
        raise HTTPException(400, "Source artifact not found")
    if not _artifact_exists(db, payload.target_artifact_type, payload.target_id):
        raise HTTPException(400, "Target artifact not found")
    db_obj = Linkage(aid=str(uuid4()), **payload.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{aid}", response_model=LinkageOut)
def update_linkage(aid: str, payload: LinkageCreate, db: Session = Depends(get_db)):
    db_obj = db.query(Linkage).filter(Linkage.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Linkage not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{aid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_linkage(aid: str, db: Session = Depends(get_db)):
    db_obj = db.query(Linkage).filter(Linkage.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Linkage not found")
    db.delete(db_obj)
    db.commit()
    return None

@router.get("/from/{source_aid}", response_model=List[LinkageOut])
def get_outgoing_linkages(source_aid: str, db: Session = Depends(get_db)):
    return db.query(Linkage).filter(Linkage.source_id == source_aid).all()