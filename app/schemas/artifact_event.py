from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from app.enums import Status

class StatusTransition(BaseModel):
    from_status: Status
    to_status: Status
    rationale: str = Field(..., min_length=1)
    comment: Optional[str] = None

class ArtifactEventCreate(BaseModel):
    artifact_type: str
    artifact_id: str
    event_type: str
    event_data: Dict[str, Any]
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    comment: Optional[str] = None

class ArtifactEventOut(BaseModel):
    id: int
    artifact_type: str
    artifact_id: str
    event_type: str
    event_data: Dict[str, Any]
    timestamp: datetime
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
