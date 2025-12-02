# app/schemas/base.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class LinkType(str, Enum):
    DERIVED_FROM = "derived_from"
    SATISFIES = "satisfies"
    IMPLEMENTS = "implements"
    PARENT = "parent"
    ELABORATES = "elaborates"

class Status(str, Enum):
    PROPOSED = "proposed"
    VERIFIED = "verified"
    REJECTED = "rejected"
    BASE_LINED = "base_lined"

class ArtifactBase(BaseModel):
    aid: str = Field(..., min_length=1)
    area: str = Field(..., min_length=1, max_length=50)
    status: Status = Status.PROPOSED
    rationale: Optional[str] = None
    owner: Optional[str] = None
    links: Dict[LinkType, List[str]] = Field(default_factory=lambda: {lt: [] for lt in LinkType})

    model_config = ConfigDict(from_attributes=True)  # Replaces class Config