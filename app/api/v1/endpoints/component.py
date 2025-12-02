from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models.component import Component, ComponentRelationship
from app.schemas.component import ComponentCreate, ComponentUpdate, ComponentOut, ComponentRelationshipCreate

router = APIRouter()

@router.post("/", response_model=ComponentOut)
def create_component(component_in: ComponentCreate, db: Session = Depends(get_db)):
    component = Component(
        id=str(uuid4()),
        name=component_in.name,
        type=component_in.type,
        description=component_in.description
    )
    db.add(component)
    db.commit()
    db.refresh(component)
    return component

@router.get("/", response_model=List[ComponentOut])
def read_components(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    components = db.query(Component).offset(skip).limit(limit).all()
    
    # Transform for output
    results = []
    for c in components:
        children = []
        for rel in c.children_relationships:
            child = db.query(Component).filter(Component.id == rel.child_id).first()
            if child:
                children.append({
                    "child_id": child.id,
                    "child_name": child.name,
                    "child_type": child.type,
                    "cardinality": rel.cardinality,
                    "type": rel.type,
                    "protocol": rel.protocol,
                    "data_items": rel.data_items
                })
        results.append(ComponentOut(
            id=c.id,
            name=c.name,
            type=c.type,
            description=c.description,
            x=c.x,
            y=c.y,
            children=children
        ))
        
    return results

@router.get("/{component_id}", response_model=ComponentOut)
def read_component(component_id: str, db: Session = Depends(get_db)):
    component = db.query(Component).filter(Component.id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
        
    children = []
    for rel in component.children_relationships:
        child = db.query(Component).filter(Component.id == rel.child_id).first()
        if child:
            children.append({
                "child_id": child.id,
                "child_name": child.name,
                "child_type": child.type,
                "cardinality": rel.cardinality,
                "type": rel.type,
                "protocol": rel.protocol,
                "data_items": rel.data_items
            })
            
    return ComponentOut(
        id=component.id,
        name=component.name,
        type=component.type,
        description=component.description,
        x=component.x,
        y=component.y,
        children=children
    )

@router.put("/{component_id}", response_model=ComponentOut)
def update_component(component_id: str, component_in: ComponentUpdate, db: Session = Depends(get_db)):
    component = db.query(Component).filter(Component.id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    if component_in.name is not None:
        component.name = component_in.name
    if component_in.type is not None:
        component.type = component_in.type
    if component_in.description is not None:
        component.description = component_in.description
    if component_in.x is not None:
        component.x = component_in.x
    if component_in.y is not None:
        component.y = component_in.y
        
    db.commit()
    db.refresh(component)
    
    # Re-fetch for children
    children = []
    for rel in component.children_relationships:
        child = db.query(Component).filter(Component.id == rel.child_id).first()
        if child:
            children.append({
                "child_id": child.id,
                "child_name": child.name,
                "child_type": child.type,
                "cardinality": rel.cardinality,
                "type": rel.type,
                "protocol": rel.protocol,
                "data_items": rel.data_items
            })
            
    return ComponentOut(
        id=component.id,
        name=component.name,
        type=component.type,
        description=component.description,
        children=children
    )

@router.delete("/{component_id}")
def delete_component(component_id: str, db: Session = Depends(get_db)):
    component = db.query(Component).filter(Component.id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db.delete(component)
    db.commit()
    return {"ok": True}

@router.post("/{component_id}/link")
def link_component(component_id: str, link_in: ComponentRelationshipCreate, db: Session = Depends(get_db)):
    # Check parent exists
    parent = db.query(Component).filter(Component.id == component_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent component not found")
    
    # Check if link already exists
    existing = db.query(ComponentRelationship).filter(
        ComponentRelationship.parent_id == component_id,
        ComponentRelationship.child_id == link_in.child_id
    ).first()
    
    if existing:
        existing.cardinality = link_in.cardinality
        existing.type = link_in.type
        existing.protocol = link_in.protocol
        existing.data_items = link_in.data_items
    else:
        new_link = ComponentRelationship(
            parent_id=component_id,
            child_id=link_in.child_id,
            cardinality=link_in.cardinality,
            type=link_in.type,
            protocol=link_in.protocol,
            data_items=link_in.data_items
        )
        db.add(new_link)
    db.commit()
    return {"ok": True}

@router.delete("/{component_id}/link/{child_id}")
def unlink_component(component_id: str, child_id: str, db: Session = Depends(get_db)):
    link = db.query(ComponentRelationship).filter(
        ComponentRelationship.parent_id == component_id,
        ComponentRelationship.child_id == child_id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
        
    db.delete(link)
    db.commit()
    return {"ok": True}
