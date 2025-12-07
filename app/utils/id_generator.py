# app/utils/id_generator.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Type, Dict
from app.db.models.vision import Vision
from app.db.models.need import Need
from app.db.models.use_case import UseCase
from app.db.models.requirement import Requirement
from app.db.models.project import Project
from app.db.models.document import Document

# ----------------------------------------------------------------------
# Mapping: artifact class → short type code used in the ID
# ----------------------------------------------------------------------
TYPE_CODE: Dict[Type, str] = {
    Vision: "VISION",
    Need:            "NEED",
    UseCase:         "UC",
    Requirement:     "REQ",
    Document:        "DOC",
}

def generate_artifact_id(db: Session, model, area: str, project_id: str) -> str:
    """
    Generate unique AID for the artifact type and area within a project.
    Format: {PROJECT}-{area}-{TYPE}-{NNN} (e.g., TR2-MCK-NEED-001)
    """
    # Get Project Name
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        # Fallback if project not found (shouldn't happen due to prior validation)
        project_name = "UNK"
    else:
        project_name = project.name.upper().replace(" ", "_")

    # Base prefix - use TYPE_CODE mapping for consistent naming
    model_abbr = TYPE_CODE.get(model, model.__tablename__.upper())
    prefix = f"{project_name}-{area}-{model_abbr}"

    # Query max AID for this area (only) - we might want to filter by project too if AIDs are unique per project?
    # Currently AID is primary key, so it must be unique globally.
    # If we use Project Name in prefix, it is unique globally implicitly.
    
    # We need to find the max AID that starts with this prefix
    # filter(model.aid.like(f"{prefix}%"))
    
    max_aid = db.query(func.max(model.aid)).filter(model.aid.like(f"{prefix}%")).scalar()

    if not max_aid:
        # No existing records for this prefix — start at 001
        num = 1
    else:
        try:
            # Parse the numeric suffix from max_aid (assume last part after last '-')
            parts = max_aid.split('-')
            num = int(parts[-1]) + 1
        except (ValueError, IndexError):
            # Invalid format — fallback to 001
            num = 1

    # Format with leading zeros
    new_id = f"{prefix}-{num:03d}"
    return new_id