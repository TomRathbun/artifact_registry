from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.schemas.utility import AIDRename
from app.db.models.need import Need
from app.db.models.use_case import UseCase
from app.db.models.requirement import Requirement
from app.db.models.vision import Vision
from app.db.models.document import Document

router = APIRouter()

@router.post("/rename-aid")
def rename_aid(data: AIDRename, db: Session = Depends(deps.get_db)):
    artifact_type_map = {
        "need": {"model": Need, "table": "needs", "link_type": "need"},
        "use_case": {"model": UseCase, "table": "use_cases", "link_type": "use_case"},
        "requirement": {"model": Requirement, "table": "requirements", "link_type": "requirement"},
        "vision": {"model": Vision, "table": "visions", "link_type": "vision"},
        "document": {"model": Document, "table": "documents", "link_type": "document"},
    }
    
    mapping = artifact_type_map.get(data.artifact_type.lower())
    if not mapping:
        raise HTTPException(status_code=400, detail=f"Unsupported artifact type: {data.artifact_type}")
    
    # Check if old exists
    model = mapping["model"]
    old_artifact = db.query(model).filter(model.aid == data.old_aid).first()
    if not old_artifact:
        raise HTTPException(status_code=404, detail=f"Artifact {data.old_aid} not found")
    
    # Check if new exists
    new_exists = db.query(model).filter(model.aid == data.new_aid).first()
    if new_exists:
        raise HTTPException(status_code=400, detail=f"New AID {data.new_aid} already exists")

    try:
        # 1. Create a clone with the new ID
        # Fetching column names to ensure we copy everything
        column_names = [c.name for c in model.__table__.columns]
        data_dict = {name: getattr(old_artifact, name) for name in column_names}
        data_dict['aid'] = data.new_aid
        
        new_artifact = model(**data_dict)
        db.add(new_artifact)
        
        # Flush to ensure the new row exists for child updates
        db.flush()

        # 2. Update linkages (Source)
        db.execute(
            text("UPDATE linkages SET source_id = :new WHERE source_id = :old AND source_artifact_type = :type"),
            {"new": data.new_aid, "old": data.old_aid, "type": mapping["link_type"]}
        )
        
        # 3. Update linkages (Target)
        db.execute(
            text("UPDATE linkages SET target_id = :new WHERE target_id = :old AND target_artifact_type = :type"),
            {"new": data.new_aid, "old": data.old_aid, "type": mapping["link_type"]}
        )
        
        # 4. Update comments
        db.execute(
            text("UPDATE comments SET artifact_aid = :new WHERE artifact_aid = :old"),
            {"new": data.new_aid, "old": data.old_aid}
        )
        
        # 5. Update events
        db.execute(
            text("UPDATE artifact_events SET artifact_id = :new WHERE artifact_id = :old AND artifact_type = :type"),
            {"new": data.new_aid, "old": data.old_aid, "type": data.artifact_type.lower()}
        )
        
        # 6. Update Association tables (These have hard FKs)
        if data.artifact_type.lower() == "need":
            db.execute(text("UPDATE need_sites SET need_id = :new WHERE need_id = :old"), {"new": data.new_aid, "old": data.old_aid})
            db.execute(text("UPDATE need_components SET need_id = :new WHERE need_id = :old"), {"new": data.new_aid, "old": data.old_aid})
        elif data.artifact_type.lower() == "use_case":
            db.execute(text("UPDATE use_case_preconditions SET use_case_id = :new WHERE use_case_id = :old"), {"new": data.new_aid, "old": data.old_aid})
            db.execute(text("UPDATE use_case_postconditions SET use_case_id = :new WHERE use_case_id = :old"), {"new": data.new_aid, "old": data.old_aid})
            db.execute(text("UPDATE use_case_stakeholders SET use_case_id = :new WHERE use_case_id = :old"), {"new": data.new_aid, "old": data.old_aid})
        
        # 7. Delete the old artifact
        db.delete(old_artifact)
        
        db.commit()
        return {"status": "success", "old_aid": data.old_aid, "new_aid": data.new_aid}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Rename failed: {str(e)}")
