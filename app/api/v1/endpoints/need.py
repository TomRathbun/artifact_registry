from datetime import datetime, UTC
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status as status_code
from sqlalchemy import func
from sqlalchemy.orm import Session
from uuid import uuid4

from app.db.session import get_db
from app.db.models.need import Need
from app.db.models.vision import Vision
from app.db.models.linkage import Linkage
from app.db.models.project import Project
from app.db.models.metadata import Area
from app.db.models.site import Site
from app.db.models.component import Component
from app.enums import Status, LinkType
from app.schemas.need import NeedCreate, NeedOut
from app.utils.id_generator import generate_artifact_id

router = APIRouter(prefix="/needs", tags=["Needs"])

# -------------------------------------------------
# GET – list (filterable)
# -------------------------------------------------
@router.get("/", response_model=List[NeedOut])
def list_needs(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    area: Optional[List[str]] = Query(None, description="Filter by area (e.g., MCK)"),
    status: Optional[List[str]] = Query(None, description="Filter by status (e.g., Draft)"),
    owner: Optional[str] = Query(None, description="Filter by owner"),
    search: Optional[str] = Query(None, description="Keyword search in title/description"),
    select_all: bool = Query(False, description="Ignore filters and return all"),
    db: Session = Depends(get_db),
):
    query = db.query(Need)

    if not select_all:
        if project_id:
            query = query.filter(Need.project_id == project_id)
        if area:
            query = query.filter(Need.area.in_(area))
        if status:
            # Handle case-insensitive enum matching for list
            status_enums = []
            for s in status:
                try:
                    status_enums.append(Status[s.upper()].value)
                except (KeyError, AttributeError):
                    status_enums.append(s.lower())
            query = query.filter(Need.status.in_(status_enums))
        if owner:
            query = query.filter(func.lower(Need.owner_id) == func.lower(owner))
        if search:
            term = f"%{search}%"
            query = query.filter(
                (Need.title.ilike(term)) | (Need.description.ilike(term))
            )
    return query.all()

# -------------------------------------------------
# GET – by id
# -------------------------------------------------
@router.get("/{aid}", response_model=NeedOut)
def get_need(aid: str, db: Session = Depends(get_db)):
    obj = db.query(Need).filter(Need.aid == aid).first()
    if not obj:
        raise HTTPException(404, "Need not found")
    
    # Fetch source vision linkage
    link = db.query(Linkage).filter(
        Linkage.source_id == aid,
        Linkage.relationship_type == LinkType.DERIVES_FROM,
        Linkage.target_artifact_type == 'vision'
    ).first()
    
    result = NeedOut.model_validate(obj)
    if link:
        result.source_vision_id = link.target_id
        
    return result

# -------------------------------------------------
# POST – create
# -------------------------------------------------
@router.post("/", response_model=NeedOut, status_code=status_code.HTTP_201_CREATED)
def create_need(payload: NeedCreate, db: Session = Depends(get_db)):
    # Validate Project
    if not db.query(Project).filter(Project.id == payload.project_id).first():
        raise HTTPException(status_code=400, detail="Project not found")
    
    # Validate Parent Vision - only if provided
    if payload.source_vision_id:
        parent_vision = db.query(Vision).filter(Vision.aid == payload.source_vision_id).first()
        if not parent_vision:
            raise HTTPException(status_code=400, detail="Source Vision not found")
    
    # Look up area code from area name for AID generation
    area_code = payload.area  # Default to area name if not found
    if payload.area:
        area_obj = db.query(Area).filter(Area.name == payload.area).first()
        if area_obj:
            area_code = area_obj.code
    
    # Create Need - use area code for both AID and storage
    aid = generate_artifact_id(db, Need, area_code, payload.project_id)
    db_obj = Need(
        aid=aid,
        title=payload.title,
        description=payload.description,
        area=area_code,  # Store the area code, not the name
        status=payload.status,
        rationale=payload.rationale,
        owner_id=payload.owner_id,
        stakeholder_id=payload.stakeholder_id,
        project_id=payload.project_id,
        level=payload.level,
    )
    
    if payload.site_ids:
        sites = db.query(Site).filter(Site.id.in_(payload.site_ids)).all()
        db_obj.sites = sites
        
    if payload.component_ids:
        components = db.query(Component).filter(Component.id.in_(payload.component_ids)).all()
        db_obj.components = components
        
    db.add(db_obj)
    
    # Create Linkage (Need -> Vision) - only if source_vision_id provided
    if payload.source_vision_id:
        link = Linkage(
            aid=str(uuid4()),
            source_artifact_type="need",
            source_id=aid,
            target_artifact_type="vision",
            target_id=payload.source_vision_id,
            relationship_type=LinkType.DERIVES_FROM,
            project_id=payload.project_id,
        )
        db.add(link)
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

# -------------------------------------------------
# PUT – update (partial)
# -------------------------------------------------
@router.put("/{aid}", response_model=NeedOut)
def update_need(aid: str, payload: NeedCreate, db: Session = Depends(get_db)):
    db_obj = db.query(Need).filter(Need.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Need not found")
    update_data = payload.model_dump(exclude_unset=True)
    
    # Handle source_vision_id separately (not a column)
    source_vision_id_update = update_data.pop('source_vision_id', None)
    source_vision_id_present = 'source_vision_id' in payload.model_dump(exclude_unset=True)
    
    # Handle relationships
    site_ids = update_data.pop('site_ids', None)
    component_ids = update_data.pop('component_ids', None)
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    if site_ids is not None:
        sites = db.query(Site).filter(Site.id.in_(site_ids)).all()
        db_obj.sites = sites
        
    if component_ids is not None:
        components = db.query(Component).filter(Component.id.in_(component_ids)).all()
        db_obj.components = components
    
    # Sync Linkage if source_vision_id was in payload
    if source_vision_id_present:
        new_vision_id = source_vision_id_update
        # Find existing linkage
        existing_link = db.query(Linkage).filter(
            Linkage.source_id == aid,
            Linkage.relationship_type == LinkType.DERIVES_FROM,
            Linkage.target_artifact_type == 'vision'
        ).first()
        
        if existing_link:
            if new_vision_id:
                existing_link.target_id = new_vision_id
            else:
                db.delete(existing_link)
        elif new_vision_id:
            # Create new linkage
            new_link = Linkage(
                aid=str(uuid4()),
                source_artifact_type="need",
                source_id=aid,
                target_artifact_type="vision",
                target_id=new_vision_id,
                relationship_type=LinkType.DERIVES_FROM,
                project_id=db_obj.project_id,
            )
            db.add(new_link)

    db_obj.last_updated = datetime.now(UTC)
    db.commit()
    db.refresh(db_obj)
    
    # Re-fetch to ensure we have the latest state, though for source_vision_id we need to manually attach it if we want it in response
    # But NeedOut will just ignore it if it's not on db_obj. 
    # We should probably return the Pydantic model with the field set.
    result = NeedOut.model_validate(db_obj)
    if source_vision_id_present:
        result.source_vision_id = new_vision_id
    elif existing_link := db.query(Linkage).filter(
            Linkage.source_id == aid,
            Linkage.relationship_type == LinkType.DERIVES_FROM,
            Linkage.target_artifact_type == 'vision'
        ).first():
        result.source_vision_id = existing_link.target_id
        
    return result

# -------------------------------------------------
# DELETE
# -------------------------------------------------
@router.delete("/{aid}", status_code=status_code.HTTP_204_NO_CONTENT)
def delete_need(aid: str, db: Session = Depends(get_db)):
    db_obj = db.query(Need).filter(Need.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Need not found")
    # Delete associated linkages
    db.query(Linkage).filter(
        (Linkage.source_id == aid) | (Linkage.target_id == aid)
    ).delete(synchronize_session=False)
    
    db.delete(db_obj)
    db.commit()
    return None
