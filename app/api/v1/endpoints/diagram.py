from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.db.models.diagram import Diagram, DiagramComponent, DiagramEdge
from app.schemas.diagram import DiagramCreate, DiagramUpdate, DiagramOut, DiagramComponentUpdate, DiagramEdgeUpdate

router = APIRouter()

@router.get("/projects/{project_id}/diagrams", response_model=List[DiagramOut])
def list_diagrams(project_id: str, db: Session = Depends(get_db)):
    diagrams = db.query(Diagram).filter(Diagram.project_id == project_id).all()
    return diagrams

@router.post("/projects/{project_id}/diagrams", response_model=DiagramOut)
def create_diagram(project_id: str, diagram_in: DiagramCreate, db: Session = Depends(get_db)):
    diagram = Diagram(
        project_id=project_id,
        name=diagram_in.name,
        description=diagram_in.description,
        type=diagram_in.type,
        filter_data=diagram_in.filter_data
    )
    db.add(diagram)
    db.commit()
    db.refresh(diagram)
    return diagram

@router.get("/diagrams/{diagram_id}", response_model=DiagramOut)
def get_diagram(diagram_id: str, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

@router.put("/diagrams/{diagram_id}", response_model=DiagramOut)
def update_diagram(diagram_id: str, diagram_in: DiagramUpdate, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    if diagram_in.name is not None:
        diagram.name = diagram_in.name
    if diagram_in.description is not None:
        diagram.description = diagram_in.description
    if diagram_in.filter_data is not None:
        diagram.filter_data = diagram_in.filter_data
        
    db.commit()
    db.refresh(diagram)
    return diagram

@router.delete("/diagrams/{diagram_id}")
def delete_diagram(diagram_id: str, db: Session = Depends(get_db)):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
        
    # Delete associated diagram components first (though cascade might handle this, explicit is safer)
    db.query(DiagramComponent).filter(DiagramComponent.diagram_id == diagram_id).delete()
    
    db.delete(diagram)
    db.commit()
    return {"ok": True}

@router.put("/diagrams/{diagram_id}/components/{component_id}", response_model=DiagramOut)
def update_diagram_component(
    diagram_id: str, 
    component_id: str, 
    comp_in: DiagramComponentUpdate, 
    db: Session = Depends(get_db)
):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
        
    # Check if component exists in diagram
    diagram_comp = db.query(DiagramComponent).filter(
        DiagramComponent.diagram_id == diagram_id,
        DiagramComponent.component_id == component_id
    ).first()
    
    if diagram_comp:
        diagram_comp.x = comp_in.x
        diagram_comp.y = comp_in.y
    else:
        # Add new component to diagram
        diagram_comp = DiagramComponent(
            diagram_id=diagram_id,
            component_id=component_id,
            x=comp_in.x,
            y=comp_in.y
        )
        db.add(diagram_comp)
        
    db.commit()
    db.refresh(diagram)
    return diagram

@router.delete("/diagrams/{diagram_id}/components/{component_id}")
def remove_component_from_diagram(diagram_id: str, component_id: str, db: Session = Depends(get_db)):
    diagram_comp = db.query(DiagramComponent).filter(
        DiagramComponent.diagram_id == diagram_id,
        DiagramComponent.component_id == component_id
    ).first()
    
    if not diagram_comp:
        raise HTTPException(status_code=404, detail="Component not found in diagram")
        
    db.delete(diagram_comp)
    db.commit()
    return {"ok": True}

@router.put("/diagrams/{diagram_id}/edges", response_model=DiagramOut)
def update_diagram_edge(
    diagram_id: str,
    source_id: str,
    target_id: str,
    edge_in: DiagramEdgeUpdate,
    db: Session = Depends(get_db)
):
    diagram = db.query(Diagram).filter(Diagram.id == diagram_id).first()
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")

    # Check if edge exists
    edge = db.query(DiagramEdge).filter(
        DiagramEdge.diagram_id == diagram_id,
        DiagramEdge.source_id == source_id,
        DiagramEdge.target_id == target_id
    ).first()

    if edge:
        if edge_in.source_handle is not None:
            edge.source_handle = edge_in.source_handle
        if edge_in.target_handle is not None:
            edge.target_handle = edge_in.target_handle
    else:
        # Create new edge entry
        edge = DiagramEdge(
            diagram_id=diagram_id,
            source_id=source_id,
            target_id=target_id,
            source_handle=edge_in.source_handle,
            target_handle=edge_in.target_handle
        )
        db.add(edge)

    db.commit()
    db.refresh(diagram)
    return diagram
