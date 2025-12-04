from fastapi import APIRouter, Depends, HTTPException, Query, status as status_code
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import uuid4

from app.db.session import get_db
from app.db.models.use_case import UseCase, Precondition, Postcondition, Exception as UseCaseException
from app.db.models.metadata import Person

from app.db.models.need import Need
from app.db.models.linkage import Linkage
from app.db.models.project import Project
from app.enums import LinkType
from app.schemas.use_case import (
    UseCaseCreate, UseCaseOut, 
    PreconditionCreate, PreconditionOut,
    PostconditionCreate, PostconditionOut,
    ExceptionCreate, ExceptionOut
)
from app.utils.id_generator import generate_artifact_id

router = APIRouter(prefix="/use-cases", tags=["Use Cases"])

# --- Precondition Endpoints ---

@router.get("/preconditions", response_model=List[PreconditionOut])
def list_preconditions(
    project_id: str = Query(..., description="Project ID"),
    db: Session = Depends(get_db)
):
    return db.query(Precondition).filter(Precondition.project_id == project_id).all()

@router.post("/preconditions", response_model=PreconditionOut, status_code=status_code.HTTP_201_CREATED)
def create_precondition(payload: PreconditionCreate, db: Session = Depends(get_db)):
    db_obj = Precondition(
        id=str(uuid4()),
        text=payload.text,
        project_id=payload.project_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/preconditions/{id}", status_code=status_code.HTTP_204_NO_CONTENT)
def delete_precondition(id: str, db: Session = Depends(get_db)):
    db_obj = db.query(Precondition).filter(Precondition.id == id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Precondition not found")
    db.delete(db_obj)
    db.commit()
    return None

# --- Postcondition Endpoints ---

@router.get("/postconditions", response_model=List[PostconditionOut])
def list_postconditions(
    project_id: str = Query(..., description="Project ID"),
    db: Session = Depends(get_db)
):
    return db.query(Postcondition).filter(Postcondition.project_id == project_id).all()

@router.post("/postconditions", response_model=PostconditionOut, status_code=status_code.HTTP_201_CREATED)
def create_postcondition(payload: PostconditionCreate, db: Session = Depends(get_db)):
    db_obj = Postcondition(
        id=str(uuid4()),
        text=payload.text,
        project_id=payload.project_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/postconditions/{id}", status_code=status_code.HTTP_204_NO_CONTENT)
def delete_postcondition(id: str, db: Session = Depends(get_db)):
    db_obj = db.query(Postcondition).filter(Postcondition.id == id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Postcondition not found")
    db.delete(db_obj)
    db.commit()
    return None

# --- Exception Endpoints ---

@router.get("/exceptions", response_model=List[ExceptionOut])
def list_exceptions(
    project_id: str = Query(..., description="Project ID"),
    db: Session = Depends(get_db)
):
    return db.query(UseCaseException).filter(UseCaseException.project_id == project_id).all()

@router.post("/exceptions", response_model=ExceptionOut, status_code=status_code.HTTP_201_CREATED)
def create_exception(payload: ExceptionCreate, db: Session = Depends(get_db)):
    db_obj = UseCaseException(
        id=str(uuid4()),
        trigger=payload.trigger,
        handling=payload.handling,
        project_id=payload.project_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/exceptions/{id}", status_code=status_code.HTTP_204_NO_CONTENT)
def delete_exception(id: str, db: Session = Depends(get_db)):
    db_obj = db.query(UseCaseException).filter(UseCaseException.id == id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Exception not found")
    db.delete(db_obj)
    db.commit()
    return None

# --- Use Case Endpoints ---

@router.get("/", response_model=List[UseCaseOut])
def list_use_cases(
        project_id: str = Query(None, description="Project ID"),
        area: Optional[List[str]] = Query(None, description="Filter by area (e.g., MCK)"),
        status: Optional[List[str]] = Query(None, description="Filter by status (e.g., Draft)"),
        primary_actor: Optional[str] = Query(None, description="Filter by primary_actor"),
        select_all: bool = Query(False, description="Select all requirements (ignore filters)"),
        db: Session = Depends(get_db),
):
    query = db.query(UseCase)
    if project_id:
        query = query.filter(UseCase.project_id == project_id)
        if area:
            query = query.filter(UseCase.area.in_(area))
        if status:
            query = query.filter(UseCase.status.in_(status))
        if primary_actor:
            query = query.filter(UseCase.primary_actor_id == primary_actor)
    return query.all()

@router.get("/{aid}", response_model=UseCaseOut)
def get_use_case(aid: str, db: Session = Depends(get_db)):
    obj = db.query(UseCase).filter(UseCase.aid == aid).first()
    if not obj:
        raise HTTPException(404, "Use Case not found")
    
    # Populate source_need_id from Linkage
    link = db.query(Linkage).filter(
        Linkage.source_id == aid,
        Linkage.source_artifact_type == "use_case",
        Linkage.target_artifact_type == "need",
        Linkage.relationship_type == LinkType.SATISFIES
    ).first()
    
    if link:
        obj.source_need_id = link.target_id
        
    return obj

@router.post("/", response_model=UseCaseOut, status_code=status_code.HTTP_201_CREATED)
def create_use_case(payload: UseCaseCreate, db: Session = Depends(get_db)):
    # 1. Validate Project
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=400, detail="Project not found")

    # 2. Validate Parent (Need) - only if provided
    parent_need = None
    if payload.source_need_id:
        parent_need = db.query(Need).filter(Need.aid == payload.source_need_id).first()
        if not parent_need:
            raise HTTPException(status_code=400, detail="Source Need not found")
    
    # 3. Validate and fetch reusable components
    preconditions = []
    if payload.precondition_ids:
        preconditions = db.query(Precondition).filter(Precondition.id.in_(payload.precondition_ids)).all()
        if len(preconditions) != len(payload.precondition_ids):
            raise HTTPException(status_code=400, detail="One or more preconditions not found")
    
    postconditions = []
    if payload.postcondition_ids:
        postconditions = db.query(Postcondition).filter(Postcondition.id.in_(payload.postcondition_ids)).all()
        if len(postconditions) != len(payload.postcondition_ids):
            raise HTTPException(status_code=400, detail="One or more postconditions not found")
    
    exceptions = []
    if payload.exception_ids:
        exceptions = db.query(UseCaseException).filter(UseCaseException.id.in_(payload.exception_ids)).all()
        if len(exceptions) != len(payload.exception_ids):
            raise HTTPException(status_code=400, detail="One or more exceptions not found")
    
    stakeholders = []
    if payload.stakeholder_ids:
        stakeholders = db.query(Person).filter(Person.id.in_(payload.stakeholder_ids)).all()
        if len(stakeholders) != len(payload.stakeholder_ids):
            raise HTTPException(status_code=400, detail="One or more stakeholders not found")

    # 4. Create Use Case
    area_code = parent_need.area if (payload.source_need_id and parent_need and parent_need.area) else "GLOBAL"
    aid = generate_artifact_id(db, UseCase, area_code, payload.project_id)    

    db_obj = UseCase(
        aid=aid,
        title=payload.title,
        area=area_code,  # Store the inherited area code
        description=payload.description,
        trigger=payload.trigger,
        primary_actor_id=payload.primary_actor_id,
        status=payload.status,
        scope=payload.scope,
        level=payload.level,
        preconditions=preconditions,
        postconditions=postconditions,
        exceptions=exceptions,
        stakeholders=stakeholders,
        mss=[step.model_dump() for step in payload.mss],
        extensions=[ext.model_dump() for ext in payload.extensions],
        req_references=payload.req_references,
        project_id=payload.project_id
    )
    db.add(db_obj)
    
    # 5. Create Linkage (UseCase -> satisfies -> Need) - only if source_need_id provided
    if payload.source_need_id:
        link = Linkage(
            aid=str(uuid4()),
            source_artifact_type="use_case",
            source_id=aid,
            target_artifact_type="need",
            target_id=payload.source_need_id,
            relationship_type=LinkType.SATISFIES,
            project_id=payload.project_id
        )
        db.add(link)
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{aid}", response_model=UseCaseOut)
def update_use_case(aid: str, payload: UseCaseCreate, db: Session = Depends(get_db)):
    db_obj = db.query(UseCase).filter(UseCase.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Use Case not found")
    
    # Handle relationships separately
    if payload.precondition_ids is not None:
        preconditions = db.query(Precondition).filter(Precondition.id.in_(payload.precondition_ids)).all()
        db_obj.preconditions = preconditions
    
    if payload.postcondition_ids is not None:
        postconditions = db.query(Postcondition).filter(Postcondition.id.in_(payload.postcondition_ids)).all()
        db_obj.postconditions = postconditions
    
    if payload.exception_ids is not None:
        exceptions = db.query(UseCaseException).filter(UseCaseException.id.in_(payload.exception_ids)).all()
        db_obj.exceptions = exceptions
    
    if payload.stakeholder_ids is not None:
        stakeholders = db.query(Person).filter(Person.id.in_(payload.stakeholder_ids)).all()
        db_obj.stakeholders = stakeholders

    # Update other fields
    exclude_fields = {'precondition_ids', 'postcondition_ids', 'exception_ids', 'stakeholder_ids'}
    for k, v in payload.model_dump(exclude_unset=True, exclude=exclude_fields).items():
        if k == 'mss':
            setattr(db_obj, k, v)
        elif k == 'extensions':
            setattr(db_obj, k, v)
        else:
            setattr(db_obj, k, v)
    
    # Handle linkage updates if source_need_id changed
    if 'source_need_id' in payload.model_dump(exclude_unset=True):
        # Delete old linkage(s) from this Use Case to any Need
        old_linkages = db.query(Linkage).filter(
            Linkage.source_id == aid,
            Linkage.source_artifact_type == "use_case",
            Linkage.target_artifact_type == "need",
            Linkage.relationship_type == LinkType.SATISFIES
        ).all()
        for old_link in old_linkages:
            db.delete(old_link)
        
        # Create new linkage to the new Need
        if payload.source_need_id:
            new_link = Linkage(
                aid=str(uuid4()),
                source_artifact_type="use_case",
                source_id=aid,
                target_artifact_type="need",
                target_id=payload.source_need_id,
                relationship_type=LinkType.SATISFIES,
                project_id=payload.project_id
            )
            db.add(new_link)
        
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.delete("/{aid}", status_code=status_code.HTTP_204_NO_CONTENT)
def delete_use_case(aid: str, db: Session = Depends(get_db)):
    db_obj = db.query(UseCase).filter(UseCase.aid == aid).first()
    if not db_obj:
        raise HTTPException(404, "Use Case not found")

    # Delete all associated linkages (both where this is source or target)
    linkages = db.query(Linkage).filter(
        (Linkage.source_id == aid) | (Linkage.target_id == aid)
    ).all()
    for linkage in linkages:
        db.delete(linkage)

    # Delete the use case
    db.delete(db_obj)
    db.commit()
    return None