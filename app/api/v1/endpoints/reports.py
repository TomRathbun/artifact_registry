from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List, Any

from app.api import deps
from app.db.models.vision import Vision
from app.db.models.need import Need
from app.db.models.use_case import UseCase
from app.db.models.requirement import Requirement
from app.db.models.document import Document

from uuid import UUID
from app.db.models.project import Project

def is_valid_uuid(val):
    try:
        UUID(str(val))
        return True
    except ValueError:
        return False

router = APIRouter()

@router.get("/statistics/{project_id}")
def get_project_statistics(
    project_id: str,
    db: Session = Depends(deps.get_db)
):
    # Resolve project_id to UUID if name was provided
    if not is_valid_uuid(project_id):
        project = db.query(Project).filter(Project.name == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        project_id = project.id
    """
    Consolidated statistics for a project, showing counts by status and area.
    """
    models = {
        "vision": Vision,
        "need": Need,
        "use_case": UseCase,
        "requirement": Requirement,
        "document": Document
    }

    stats = {
        "total_count": 0,
        "by_type": {},
        "by_status": {},
        "by_area": {},
        "matrix": [] # Detailed list of {type, status, area, count}
    }

    for type_name, model in models.items():
        # Get counts for this type grouped by area and status
        results = (
            db.query(model.area, model.status, func.count().label("count"))
            .filter(model.project_id == project_id)
            .group_by(model.area, model.status)
            .all()
        )

        type_total = 0
        for area, status, count in results:
            area_key = area or "Unassigned"
            status_key = status.value if hasattr(status, 'value') else str(status)
            
            type_total += count
            
            # Aggregate by status
            stats["by_status"][status_key] = stats["by_status"].get(status_key, 0) + count
            
            # Aggregate by area
            stats["by_area"][area_key] = stats["by_area"].get(area_key, 0) + count
            
            # Add to detailed matrix
            stats["matrix"].append({
                "artifact_type": type_name,
                "area": area_key,
                "status": status_key,
                "count": count
            })

        stats["by_type"][type_name] = type_total
        stats["total_count"] += type_total

    return stats
