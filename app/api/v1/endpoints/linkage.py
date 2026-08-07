import importlib
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models.linkage import Linkage
from app.db.session import get_db
from app.schemas.linkage import LinkageCreate, LinkageOut

router = APIRouter(tags=["Linkages"])


def _get_artifact(db: Session, typ: str, aid: str):
    """Return artifact model instance or None. External types always 'exist'."""
    if typ in ["url", "external", "file"]:
        return object()  # truthy sentinel

    model_map = {
        "vision": ("app.db.models.vision", "Vision", "aid"),
        "need": ("app.db.models.need", "Need", "aid"),
        "use_case": ("app.db.models.use_case", "UseCase", "aid"),
        "requirement": ("app.db.models.requirement", "Requirement", "aid"),
        "diagram": ("app.db.models.diagram", "Diagram", "id"),
        "component": ("app.db.models.component", "Component", "id"),
        "document": ("app.db.models.document", "Document", "aid"),
    }
    entry = model_map.get(typ)
    if not entry:
        return None
    mod_path, model_name, id_field = entry
    mod = importlib.import_module(mod_path)
    model = getattr(mod, model_name)
    return db.query(model).filter(getattr(model, id_field) == aid).first()


def _artifact_project_id(artifact, typ: str) -> Optional[str]:
    if typ in ["url", "external", "file"]:
        return None
    return getattr(artifact, "project_id", None)


def _validate_linkage_payload(db: Session, payload: LinkageCreate) -> None:
    source = _get_artifact(db, payload.source_artifact_type, payload.source_id)
    if not source:
        raise HTTPException(400, "Source artifact not found")
    target = _get_artifact(db, payload.target_artifact_type, payload.target_id)
    if not target:
        raise HTTPException(400, "Target artifact not found")

    source_project = _artifact_project_id(source, payload.source_artifact_type)
    target_project = _artifact_project_id(target, payload.target_artifact_type)

    for label, art_project in (
        ("Source", source_project),
        ("Target", target_project),
    ):
        if art_project is not None and art_project != payload.project_id:
            raise HTTPException(
                400,
                f"{label} artifact belongs to a different project than the linkage",
            )


@router.get("/", response_model=List[LinkageOut])
def list_linkages(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _user=Depends(deps.get_current_user),
):
    query = db.query(Linkage)
    if project_id:
        query = query.filter(Linkage.project_id == project_id)
    return query.all()


@router.get("/{aid}", response_model=LinkageOut)
def get_linkage(
    aid: str,
    db: Session = Depends(get_db),
    _user=Depends(deps.get_current_user),
):
    obj = db.query(Linkage).filter(Linkage.aid == aid).first()
    if not obj:
        raise HTTPException(404, "Linkage not found")
    return obj


@router.post("/", response_model=LinkageOut, status_code=status.HTTP_201_CREATED)
def create_linkage(
    payload: LinkageCreate,
    db: Session = Depends(get_db),
    _user=Depends(deps.get_current_user),
):
    _validate_linkage_payload(db, payload)
    db_obj = Linkage(aid=str(uuid4()), **payload.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.put("/{aid}", response_model=LinkageOut)
def update_linkage(
    aid: str,
    payload: LinkageCreate,
    db: Session = Depends(get_db),
    _user=Depends(deps.get_current_user),
):
    db_obj = db.query(Linkage).filter(Linkage.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Linkage not found")
    _validate_linkage_payload(db, payload)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.delete("/{aid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_linkage(
    aid: str,
    db: Session = Depends(get_db),
    _user=Depends(deps.get_current_user),
):
    db_obj = db.query(Linkage).filter(Linkage.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Linkage not found")
    db.delete(db_obj)
    db.commit()
    return None


@router.get("/from/{source_aid}", response_model=List[LinkageOut])
def get_outgoing_linkages(
    source_aid: str,
    db: Session = Depends(get_db),
    _user=Depends(deps.get_current_user),
):
    return db.query(Linkage).filter(Linkage.source_id == source_aid).all()
