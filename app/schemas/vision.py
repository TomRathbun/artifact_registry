# app/schemas/vision.py
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from app.enums import Status


class VisionCreate(BaseModel):
    title: str
    description: str = Field(..., description="Supports Markdown formatting")
    area: Optional[str] = None
    project_id: str

class VisionOut(VisionCreate):
    aid: str
    status: Optional[Status] = None
    created_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)