from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class DiagramComponentUpdate(BaseModel):
    x: int
    y: int

class DiagramComponentOut(BaseModel):
    diagram_id: str
    component_id: str
    x: int
    y: int

    model_config = ConfigDict(from_attributes=True)

class DiagramCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = 'component'
    content: Optional[str] = None
    filter_data: Optional[dict] = None

class DiagramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    filter_data: Optional[dict] = None

class DiagramEdgeUpdate(BaseModel):
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None

class DiagramEdgeOut(BaseModel):
    diagram_id: str
    source_id: str
    target_id: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DiagramOut(BaseModel):
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    type: str
    content: Optional[str] = None
    filter_data: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    components: List[DiagramComponentOut] = []
    edges: List[DiagramEdgeOut] = []

    model_config = ConfigDict(from_attributes=True)
