# app/api/v1/endpoints/projects.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models.project import Project
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

from uuid import UUID

def is_valid_uuid(val):
    try:
        UUID(str(val))
        return True
    except ValueError:
        return False

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    if is_valid_uuid(project_id):
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        project = db.query(Project).filter(Project.name == project_id).first()
        
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    if db.query(Project).filter(Project.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Project with this name already exists")
    
    db_obj = Project(**payload.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Import models here to avoid circular imports if any, or just for clarity
    from app.db.models.vision import Vision
    from app.db.models.need import Need
    from app.db.models.use_case import UseCase
    from app.db.models.requirement import Requirement
    from app.db.models.linkage import Linkage
    
    # Delete Linkages first (referencing artifacts)
    db.query(Linkage).filter(Linkage.project_id == project_id).delete()
    
    # Delete Artifacts
    db.query(Requirement).filter(Requirement.project_id == project_id).delete()
    db.query(UseCase).filter(UseCase.project_id == project_id).delete()
    db.query(Need).filter(Need.project_id == project_id).delete()
    db.query(Vision).filter(Vision.project_id == project_id).delete()
    
    # Delete Project
    db.delete(project)
    db.commit()
    return None
