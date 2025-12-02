# app/schemas/linkage.py
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LinkageCreate(BaseModel):
    source_artifact_type: Optional[str] = None
    source_id: Optional[str] = None
    target_artifact_type: Optional[str] = None
    target_id: Optional[str] = None
    relationship_type: str
    project_id: Optional[str] = None

class LinkageOut(LinkageCreate):
    aid: str
    project_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)  # Replaces class Config