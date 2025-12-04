# app/schemas/base.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional
from datetime import datetime
from app.enums import Status, LinkType

class ArtifactBase(BaseModel):
    aid: str = Field(..., min_length=1)
    area: str = Field(..., min_length=1, max_length=50)
    status: Status = Status.DRAFT
    rationale: Optional[str] = None
    owner: Optional[str] = None
    links: Dict[LinkType, List[str]] = Field(default_factory=lambda: {lt: [] for lt in LinkType})

    model_config = ConfigDict(from_attributes=True)  # Replaces class Config