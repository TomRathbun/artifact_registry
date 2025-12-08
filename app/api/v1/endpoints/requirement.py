# app/api/v1/endpoints/requirement.py
from fastapi import APIRouter, Depends, HTTPException, Query, status as status_code
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, UTC
from uuid import uuid4

from app.db.session import get_db
from app.db.models.requirement import Requirement
from app.db.models.use_case import UseCase
from app.db.models.linkage import Linkage
from app.db.models.project import Project
from app.db.models.metadata import Area
from app.enums import ReqLevel, EarsType, Status, LinkType
from app.schemas.requirement import RequirementCreate, RequirementOut
from app.utils.id_generator import generate_artifact_id
from app.utils import ears_validator
from app.schemas.requirement import (
    RequirementCreate, 
    RequirementOut,
    EARSTemplateResponse,
    EARSValidationRequest,
    EARSValidationResponse
)
router = APIRouter(prefix="/requirements", tags=["Requirements"])


# -------------------------------------------------
#  EARS Grammar Support Endpoints
# -------------------------------------------------

@router.get("/ears/templates", response_model=EARSTemplateResponse)
def get_ears_templates():
    """
    Get all EARS pattern templates and descriptions.
    """
    templates = ears_validator.get_all_templates()
    descriptions = {
        pattern.value: ears_validator.get_pattern_description(pattern)
        for pattern in EarsType
    }
    
    return EARSTemplateResponse(
        templates=templates,
        descriptions=descriptions
    )


@router.post("/ears/validate", response_model=EARSValidationResponse)
def validate_ears_requirement(payload: EARSValidationRequest):
    """
    Validate a requirement text against an EARS pattern.
    Returns validation result with suggestions if invalid.
    """
    # Validate the requirement text
    validation = ears_validator.validate_pattern(payload.text, payload.pattern)
    
    # Detect what pattern it actually matches
    detected = ears_validator.detect_pattern(payload.text)
    
    # Extract components if valid
    components = None
    if validation['valid']:
        components = ears_validator.extract_components(payload.text, payload.pattern)
    
    return EARSValidationResponse(
        valid=validation['valid'],
        message=validation['message'],
        suggestions=validation['suggestions'],
        detected_pattern=detected.value if detected else None,
        components=components
    )

# -------------------------------------------------
#  GET – list (filterable)
# -------------------------------------------------
@router.get("/", response_model=List[RequirementOut])
def list_requirements(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    area: Optional[List[str]] = Query(None, description="Filter by area (e.g., MCK)"),
    status: Optional[List[str]] = Query(None, description="Filter by status (e.g., Draft)"),
    owner: Optional[str] = Query(None, description="Filter by owner"),
    level: Optional[List[str]] = Query(None, description="Filter by level (e.g., STK)"),
    ears_type: Optional[List[str]] = Query(None, description="Filter by EARS type (e.g., SYS)"),
    search: Optional[str] = Query(None, description="Keyword search in short_name/text"),
    select_all: bool = Query(False, description="Ignore all filters and return everything"),
    db: Session = Depends(get_db),
):
    """
    List all requirements with optional filtering.
    """
    from sqlalchemy import func
    
    query = db.query(Requirement)
    
    if not select_all:
        if project_id:
            query = query.filter(Requirement.project_id == project_id)
        if area:
            query = query.filter(Requirement.area.in_(area))
        if status:
            # Handle case-insensitive enum matching
            status_enums = []
            for s in status:
                try:
                    status_enums.append(Status[s.upper()].value)
                except (KeyError, AttributeError):
                    status_enums.append(s.lower())
            query = query.filter(Requirement.status.in_(status_enums))
        if owner:
            query = query.filter(func.lower(Requirement.owner) == func.lower(owner))
        if level:
            # Handle case-insensitive enum matching
            level_enums = []
            for lv in level:
                try:
                    level_enums.append(ReqLevel[lv.upper()].value)
                except (KeyError, AttributeError):
                    level_enums.append(lv.lower())
            query = query.filter(Requirement.level.in_(level_enums))
        if ears_type:
            # Handle case-insensitive enum matching
            ears_enums = []
            for et in ears_type:
                try:
                    ears_enums.append(EarsType[et.upper()].value)
                except (KeyError, AttributeError):
                    ears_enums.append(et.lower())
            query = query.filter(Requirement.ears_type.in_(ears_enums))
        if search:
            term = f"%{search}%"
            query = query.filter(
                (Requirement.short_name.ilike(term)) | (Requirement.text.ilike(term))
            )
    
    return query.order_by(Requirement.aid).all()


@router.get("/{aid}")
def get_requirement(aid: str, db: Session = Depends(get_db)):
    """
    Retrieve a single requirement by its artifact identifier (aid).
    Includes source_use_case_id from linkage.
    """
    obj = db.query(Requirement).filter(Requirement.aid == aid).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Get the source use case from linkage
    linkage = db.query(Linkage).filter(
        Linkage.source_id == aid,
        Linkage.relationship_type == LinkType.SATISFIES
    ).first()
    
    # Convert to dict and add source_use_case_id
    result = RequirementOut.model_validate(obj).model_dump()
    if linkage:
        result['source_use_case_id'] = linkage.target_id
    
    return result


# -------------------------------------------------
#  POST – create requirement
# -------------------------------------------------
@router.post("/", response_model=RequirementOut, status_code=201)
def create_requirement(payload: RequirementCreate, db: Session = Depends(get_db)):
    print(db)
    print(payload.model_dump())
    # 1. Validate Project
    if not db.query(Project).filter(Project.id == payload.project_id).first():
        raise HTTPException(status_code=400, detail="Project not found")

    # 2. Linkages are now managed separately via LinkageManager

    # 3. Derive area code
    area_code = "GLOBAL"  # Default fallback
    if payload.area:
        # Frontend sends area code (e.g., "AIC2"), use it directly
        area_code = payload.area

    # 4. Create Requirement - use area code for both AID and storage
    aid = generate_artifact_id(db, Requirement, area_code, payload.project_id)
    req = Requirement(
        aid=aid,
        short_name=payload.short_name,
        text=payload.text,
        area=area_code,  # Store the area code, not the name
        level=payload.level or ReqLevel.STK,
        ears_type=payload.ears_type or EarsType.UBIQUITOUS,
        status=payload.status or Status.DRAFT,
        rationale=payload.rationale,
        owner=payload.owner,
        project_id=payload.project_id
    )
    db.add(req)
    
    # 5. Linkages are now created separately via LinkageManager

    db.commit()
    db.refresh(req)
    return req


# -------------------------------------------------
#  PUT – update requirement (partial)
# -------------------------------------------------
@router.put("/{aid}", response_model=RequirementOut)
def update_requirement(
    aid: str,
    payload: RequirementCreate,
    db: Session = Depends(get_db),
):
    """
    Partial update of an existing requirement. Only fields present in the payload
    are changed; `last_updated` is refreshed automatically.
    """
    db_req = db.query(Requirement).filter(Requirement.aid == aid).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_req, field, value)
        print(f'setting field {field} to {value}')

    db_req.last_updated = datetime.now(UTC)
    db.commit()
    db.refresh(db_req)
    return db_req


# -------------------------------------------------
#  DELETE – remove requirement
# -------------------------------------------------
@router.delete("/{aid}", status_code=status_code.HTTP_204_NO_CONTENT)
def delete_requirement(aid: str, db: Session = Depends(get_db)):
    """
    Permanently delete a requirement and all associated linkages.
    """
    from app.db.models.linkage import Linkage
    
    db_req = db.query(Requirement).filter(Requirement.aid == aid).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    # Delete all associated linkages (both where this is source or target)
    linkages = db.query(Linkage).filter(
        (Linkage.source_id == aid) | (Linkage.target_id == aid)
    ).all()
    for linkage in linkages:
        db.delete(linkage)

    # Delete the requirement
    db.delete(db_req)
    db.commit()
    return None