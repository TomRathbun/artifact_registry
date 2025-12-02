# app/schemas/project.py
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None

class ProjectOut(ProjectBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
