from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.api import deps
from app.db.models.artifact_event import ArtifactEvent
from app.schemas.artifact_event import ArtifactEventOut, StatusTransition
from app.enums import Status
from app.db.base import BaseArtifact
# Import specific models to update their status column (as a cache)
from app.db.models.need import Need
from app.db.models.use_case import UseCase
from app.db.models.requirement import Requirement
from app.db.models.vision import Vision

router = APIRouter()

# Valid transitions map
VALID_TRANSITIONS = {
    Status.DRAFT: [Status.READY_FOR_REVIEW],
    Status.READY_FOR_REVIEW: [Status.IN_REVIEW, Status.DRAFT],
    Status.IN_REVIEW: [Status.APPROVED, Status.REJECTED, Status.DEFERRED, Status.DRAFT],
    Status.APPROVED: [Status.SUPERSEDED, Status.RETIRED], # Can also go back to Draft via "new version" logic which is effectively a new artifact, but sometimes "re-open" is needed. Plan says "One-click re-open (Approved -> Draft)"
    Status.DEFERRED: [Status.IN_REVIEW, Status.DRAFT],
    Status.REJECTED: [Status.DRAFT], # Can be re-opened
    Status.SUPERSEDED: [],
    Status.RETIRED: []
}

# Add Approved -> Draft as per plan "One-click re-open"
VALID_TRANSITIONS[Status.APPROVED].append(Status.DRAFT)

def get_artifact_model(artifact_type: str):
    if artifact_type.lower() == "need": return Need
    if artifact_type.lower() == "use_case": return UseCase
    if artifact_type.lower() == "requirement": return Requirement
    if artifact_type.lower() == "vision": return Vision
    return None

@router.post("/{artifact_type}/{artifact_id}/transition", response_model=ArtifactEventOut)
def transition_artifact(
    artifact_type: str,
    artifact_id: str,
    transition: StatusTransition,
    db: Session = Depends(deps.get_db),
    user=Depends(deps.get_current_user)
):
    # Validate transition
    if transition.to_status not in VALID_TRANSITIONS.get(transition.from_status, []):
        raise HTTPException(status_code=400, detail=f"Invalid transition from {transition.from_status} to {transition.to_status}")

    # Create event
    event = ArtifactEvent(
        artifact_type=artifact_type,
        artifact_id=artifact_id,
        event_type="StatusChanged",
        event_data={
            "from": transition.from_status,
            "to": transition.to_status,
            "rationale": transition.rationale
        },
        user_id=user.username,
        user_name=user.full_name,
        comment=transition.comment
    )
    db.add(event)
    
    # Update artifact status column (cache)
    model = get_artifact_model(artifact_type)
    if model:
        artifact = db.query(model).filter(model.aid == artifact_id).first()
        if artifact:
            artifact.status = transition.to_status
            db.add(artifact)
    
    db.commit()
    db.refresh(event)
    return event

@router.get("/{artifact_type}/{artifact_id}/history", response_model=List[ArtifactEventOut])
def get_artifact_history(
    artifact_type: str,
    artifact_id: str,
    db: Session = Depends(deps.get_db)
):
    events = db.query(ArtifactEvent).filter(
        ArtifactEvent.artifact_type == artifact_type,
        ArtifactEvent.artifact_id == artifact_id
    ).order_by(ArtifactEvent.timestamp.desc()).all()
    return events
