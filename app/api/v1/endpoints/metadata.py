from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from typing import List

from app.db.session import get_db
from app.db.models.metadata import Area, Person
from app.schemas.metadata import AreaCreate, AreaOut, PersonCreate, PersonOut
import uuid

router = APIRouter(prefix="/metadata", tags=["Metadata"])

# -------------------------------------------------
# Areas
# -------------------------------------------------
@router.get("/areas", response_model=List[AreaOut])
def list_areas(db: Session = Depends(get_db)):
    return db.query(Area).all()

@router.post("/areas", response_model=AreaOut, status_code=status.HTTP_201_CREATED)
def create_area(payload: AreaCreate, db: Session = Depends(get_db)):
    if db.query(Area).filter(Area.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Area code already exists")
    
    area = Area(**payload.dict())
    db.add(area)
    db.commit()
    db.refresh(area)
    return area

@router.put("/areas/{code}", response_model=AreaOut)
def update_area(code: str, payload: AreaCreate, db: Session = Depends(get_db)):
    area = db.query(Area).filter(Area.code == code).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    
    for key, value in payload.dict().items():
        if key != 'code': # Don't update PK
            setattr(area, key, value)
            
    db.commit()
    db.refresh(area)
    return area

@router.delete("/areas/{code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_area(code: str, db: Session = Depends(get_db)):
    area = db.query(Area).filter(Area.code == code).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    db.delete(area)
    db.commit()
    return None

# -------------------------------------------------
# People
# -------------------------------------------------
@router.get("/people", response_model=List[PersonOut])
def list_people(
    project_id: str = None, 
    role: str = None, 
    db: Session = Depends(get_db)
):
    query = db.query(Person)
    
    if project_id:
        # Filter by project_id OR global (null project_id)
        # For now, let's strict filter if provided, or maybe allow global?
        # Let's say if project_id is provided, we get project specific people + global people?
        # Or just simple filter for now.
        query = query.filter((Person.project_id == project_id) | (Person.project_id == None))
        
    if role:
        # Filter by role in roles JSON list
        # For Postgres, we need to cast to String to use LIKE on a JSON column
        # OR use specific JSON operators. Casting is a safe portable bet for now.
        term = f'%"{role}"%'
        query = query.filter(cast(Person.roles, String).like(term))
        
    return query.all()

@router.get("/people/{person_id}", response_model=PersonOut)
def get_person(person_id: str, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@router.post("/people", response_model=PersonOut, status_code=status.HTTP_201_CREATED)
def create_person(payload: PersonCreate, db: Session = Depends(get_db)):
    person = Person(**payload.dict())
    db.add(person)
    db.commit()
    db.refresh(person)
    return person

@router.put("/people/{person_id}", response_model=PersonOut)
def update_person(person_id: str, payload: PersonCreate, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    for key, value in payload.dict().items():
        if key != 'id':
            setattr(person, key, value)
            
    db.commit()
    db.refresh(person)
    return person

@router.delete("/people/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(person_id: str, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    db.delete(person)
    db.commit()
    return None


