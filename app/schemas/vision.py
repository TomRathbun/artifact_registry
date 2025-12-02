# app/schemas/vision.py
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VisionCreate(BaseModel):
    title: str
    description: str = Field(..., description="Supports Markdown formatting")
    area: Optional[str] = None
    project_id: str

class VisionOut(VisionCreate):
    aid: str
    created_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)