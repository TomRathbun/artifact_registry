# app/api/v1/endpoints/projects.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models.project import Project
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(tags=["projects"])

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

@router.get("/{project_id}/export", response_model=None)
def export_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Import models
    from app.db.models.vision import Vision
    from app.db.models.need import Need, need_sites, need_components
    from app.db.models.use_case import UseCase, use_case_preconditions, use_case_postconditions, use_case_exceptions, use_case_stakeholders, Precondition, Postcondition, Exception as UCException
    from app.db.models.requirement import Requirement
    from app.db.models.component import Component
    from app.db.models.diagram import Diagram, DiagramComponent, DiagramEdge
    from app.db.models.linkage import Linkage
    from app.db.models.site import Site
    from app.db.models.metadata import Person
    # Fetch reusable components (project-specific)
    preconditions = db.query(Precondition).filter(Precondition.project_id == project_id).all()
    postconditions = db.query(Postcondition).filter(Postcondition.project_id == project_id).all()
    exceptions = db.query(UCException).filter(UCException.project_id == project_id).all()

    # Fetch all data
    visions = db.query(Vision).filter(Vision.project_id == project_id).all()
    needs = db.query(Need).filter(Need.project_id == project_id).all()
    use_cases = db.query(UseCase).filter(UseCase.project_id == project_id).all()
    requirements = db.query(Requirement).filter(Requirement.project_id == project_id).all()
    components = db.query(Component).all()
    diagrams = db.query(Diagram).filter(Diagram.project_id == project_id).all()
    linkages = db.query(Linkage).filter(Linkage.project_id == project_id).all()
    sites = db.query(Site).all()
    
    # For people, we need to filter by project_id if the column exists (it was added in migration)
    # Or we can just export all people associated with the project's artifacts?
    # The migration added project_id to people, so we can use that.
    people = db.query(Person).filter(Person.project_id == project_id).all()

    # Helper to convert SQLAlchemy objects to dicts
    def to_dict_list(objects):
        return [obj.as_dict() if hasattr(obj, 'as_dict') else {c.name: getattr(obj, c.name) for c in obj.__table__.columns} for obj in objects]

    # Fetch association tables
    # We need to fetch raw rows for these
    uc_ids = [uc.aid for uc in use_cases]
    need_ids = [n.aid for n in needs]
    diagram_ids = [d.id for d in diagrams]

    def get_association_rows(table, col_name, ids):
        if not ids:
            return []
        stmt = table.select().where(getattr(table.c, col_name).in_(ids))
        return [dict(row._mapping) for row in db.execute(stmt).fetchall()]

    use_case_preconditions_data = get_association_rows(use_case_preconditions, "use_case_id", uc_ids)
    use_case_postconditions_data = get_association_rows(use_case_postconditions, "use_case_id", uc_ids)
    use_case_exceptions_data = get_association_rows(use_case_exceptions, "use_case_id", uc_ids)
    use_case_stakeholders_data = get_association_rows(use_case_stakeholders, "use_case_id", uc_ids)
    
    need_sites_data = get_association_rows(need_sites, "need_id", need_ids)
    need_components_data = get_association_rows(need_components, "need_id", need_ids)

    # Diagram internals
    diagram_components = db.query(DiagramComponent).filter(DiagramComponent.diagram_id.in_(diagram_ids)).all() if diagram_ids else []
    diagram_edges = db.query(DiagramEdge).filter(DiagramEdge.diagram_id.in_(diagram_ids)).all() if diagram_ids else []

    # Fetch referenced Components and Sites (since they don't have project_id)
    # Components referenced in Needs and Diagrams
    # comp_ids_from_needs = {row['component_id'] for row in need_components_data}
    # comp_ids_from_diagrams = {dc.component_id for dc in diagram_components}
    # all_comp_ids = comp_ids_from_needs.union(comp_ids_from_diagrams)
    
    # components = db.query(Component).filter(Component.id.in_(all_comp_ids)).all() if all_comp_ids else []

    # Sites referenced in Needs
    # site_ids_from_needs = {row['site_id'] for row in need_sites_data}
    # sites = db.query(Site).filter(Site.id.in_(site_ids_from_needs)).all() if site_ids_from_needs else []


    export_data = {
        "project": {c.name: getattr(project, c.name) for c in project.__table__.columns},
        "visions": to_dict_list(visions),
        "needs": to_dict_list(needs),
        "use_cases": to_dict_list(use_cases),
        "requirements": to_dict_list(requirements),
        "components": to_dict_list(components), # Global components referenced
        "diagrams": to_dict_list(diagrams),
        "linkages": to_dict_list(linkages),
        "sites": to_dict_list(sites),
        "people": to_dict_list(people),
        "preconditions": to_dict_list(preconditions),
        "postconditions": to_dict_list(postconditions),
        "exceptions": to_dict_list(exceptions),
        "use_case_preconditions": use_case_preconditions_data,
        "use_case_postconditions": use_case_postconditions_data,
        "use_case_exceptions": use_case_exceptions_data,
        "use_case_stakeholders": use_case_stakeholders_data,
        "need_sites": need_sites_data,
        "need_components": need_components_data,
        "diagram_components": to_dict_list(diagram_components),
        "diagram_edges": to_dict_list(diagram_edges)
    }
    
    return export_data

@router.post("/{project_id}/import", status_code=status.HTTP_200_OK)
def import_project(project_id: str, data: dict, db: Session = Depends(get_db)):
    # Verify project exists (or we are creating it)
    # The user wants to OVERWRITE.
    # So we should delete the existing project content first.
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        # Delete everything using the delete_project logic
        # We can call the delete_project function directly if we refactor it, 
        # or just copy the logic.
        # Let's copy/reuse logic to ensure clean slate.
        
        # Import models
        from app.db.models.vision import Vision
        from app.db.models.need import Need, need_sites, need_components
        from app.db.models.use_case import UseCase, use_case_preconditions, use_case_postconditions, use_case_exceptions, use_case_stakeholders, Precondition, Postcondition, Exception as UCException
        from app.db.models.requirement import Requirement
        from app.db.models.linkage import Linkage
        from app.db.models.diagram import Diagram, DiagramComponent, DiagramEdge
        from app.db.models.metadata import Person
        
        # Delete Linkages
        db.query(Linkage).filter(Linkage.project_id == project_id).delete()
        
        # Delete Diagram internals
        # DiagramComponent/Edge cascade delete with Diagram? Yes.
        
        # Delete Association Table Rows (Manually, as cascade might not be set)
        # We need to fetch IDs of artifacts to be deleted first
        uc_ids_to_del = [uc.aid for uc in db.query(UseCase).filter(UseCase.project_id == project_id).all()]
        need_ids_to_del = [n.aid for n in db.query(Need).filter(Need.project_id == project_id).all()]
        
        if uc_ids_to_del:
            db.execute(use_case_preconditions.delete().where(use_case_preconditions.c.use_case_id.in_(uc_ids_to_del)))
            db.execute(use_case_postconditions.delete().where(use_case_postconditions.c.use_case_id.in_(uc_ids_to_del)))
            db.execute(use_case_exceptions.delete().where(use_case_exceptions.c.use_case_id.in_(uc_ids_to_del)))
            db.execute(use_case_stakeholders.delete().where(use_case_stakeholders.c.use_case_id.in_(uc_ids_to_del)))
            
        if need_ids_to_del:
            db.execute(need_sites.delete().where(need_sites.c.need_id.in_(need_ids_to_del)))
            db.execute(need_components.delete().where(need_components.c.need_id.in_(need_ids_to_del)))

        # Delete Artifacts
        db.query(Requirement).filter(Requirement.project_id == project_id).delete()
        
        db.query(UseCase).filter(UseCase.project_id == project_id).delete()
        db.query(Need).filter(Need.project_id == project_id).delete()
        db.query(Vision).filter(Vision.project_id == project_id).delete()
        
        # Delete Reusables
        db.query(Precondition).filter(Precondition.project_id == project_id).delete()
        db.query(Postcondition).filter(Postcondition.project_id == project_id).delete()
        db.query(UCException).filter(UCException.project_id == project_id).delete()
        
        # Delete Diagrams
        db.query(Diagram).filter(Diagram.project_id == project_id).delete()
        
        # Delete People (Project specific)
        db.query(Person).filter(Person.project_id == project_id).delete()
        
        # We DO NOT delete the Project row itself, so we keep the ID and Name (unless updated from JSON).
        # Actually, we should update the project details from JSON.
        if "project" in data:
            p_data = data["project"]
            project.name = p_data.get("name", project.name)
            project.description = p_data.get("description", project.description)
            # Don't change ID
            
    else:
        # Create project if it doesn't exist (e.g. importing into a new ID)
        # But the URL implies we are importing INTO this ID.
        # If it doesn't exist, we create it.
        if "project" in data:
            p_data = data["project"]
            project = Project(id=project_id, name=p_data.get("name", "Imported Project"), description=p_data.get("description"))
            db.add(project)
        else:
             raise HTTPException(status_code=404, detail="Project not found and no project data in import")

    db.flush() # Ensure project exists
    
    # Helper to insert
    from datetime import datetime
    
    def parse_dates(row):
        date_fields = ['created_date', 'last_updated', 'created_at', 'updated_at']
        for field in date_fields:
            if field in row and row[field]:
                try:
                    # Try parsing ISO format
                    if isinstance(row[field], str):
                        row[field] = datetime.fromisoformat(row[field])
                except ValueError:
                    pass # Keep as string if parsing fails (or handle error)
        return row

    def insert_rows(model, rows):
        if not rows: return
        for row in rows:
            # Filter out unknown columns if necessary, or trust export
            # We assume the export matches the model
            # Handle dates? Pydantic/SQLAlchemy might need help if strings.
            # But `db.add` expects objects.
            # We need to convert dict to object.
            # And handle date parsing if needed.
            
            row = parse_dates(row)
            
            # If `row` contains keys not in model, it will crash.
            valid_keys = {c.name for c in model.__table__.columns}
            clean_row = {k: v for k, v in row.items() if k in valid_keys}
            db.add(model(**clean_row))

    # Import models
    from app.db.models.vision import Vision
    from app.db.models.need import Need
    from app.db.models.use_case import UseCase, Precondition, Postcondition, Exception as UCException
    from app.db.models.requirement import Requirement
    from app.db.models.component import Component
    from app.db.models.diagram import Diagram, DiagramComponent, DiagramEdge
    from app.db.models.linkage import Linkage
    from app.db.models.site import Site
    from app.db.models.metadata import Person
    
    # Insert Data
    # 1. Global/Shared entities (Components, Sites)
    # We should check if they exist.
    if "components" in data:
        for comp in data["components"]:
            if not db.query(Component).filter(Component.id == comp["id"]).first():
                db.add(Component(**comp))
    
    if "sites" in data:
        for site in data["sites"]:
            if not db.query(Site).filter(Site.id == site["id"]).first():
                db.add(Site(**site))
                
    db.flush()
    
    # 2. Project Specific Entities
    insert_rows(Person, data.get("people", []))
    insert_rows(Precondition, data.get("preconditions", []))
    insert_rows(Postcondition, data.get("postconditions", []))
    insert_rows(UCException, data.get("exceptions", []))
    
    insert_rows(Vision, data.get("visions", []))
    insert_rows(Need, data.get("needs", []))
    insert_rows(UseCase, data.get("use_cases", []))
    insert_rows(Requirement, data.get("requirements", []))
    
    insert_rows(Diagram, data.get("diagrams", []))
    insert_rows(Linkage, data.get("linkages", []))
    
    db.flush()
    
    # 3. Association Tables (Raw Insert)
    def insert_association(table, rows):
        if not rows: return
        # table.insert().values(rows) ?
        # Yes, Core insert
        db.execute(table.insert(), rows)

    insert_association(use_case_preconditions, data.get("use_case_preconditions", []))
    insert_association(use_case_postconditions, data.get("use_case_postconditions", []))
    insert_association(use_case_exceptions, data.get("use_case_exceptions", []))
    insert_association(use_case_stakeholders, data.get("use_case_stakeholders", []))
    
    insert_association(need_sites, data.get("need_sites", []))
    insert_association(need_components, data.get("need_components", []))
    
    # 4. Diagram Internals
    insert_rows(DiagramComponent, data.get("diagram_components", []))
    insert_rows(DiagramEdge, data.get("diagram_edges", []))

    db.commit()
    return {"status": "success", "message": "Project imported successfully"}

