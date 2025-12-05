from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ComponentRelationshipCreate(BaseModel):
    child_id: str
    cardinality: Optional[str] = None
    type: Optional[str] = 'composition'
    protocol: Optional[str] = None
    data_items: Optional[str] = None

class ComponentRelationshipOut(BaseModel):
    child_id: str
    child_name: str
    child_type: str
    cardinality: Optional[str] = None
    type: Optional[str] = 'composition'
    protocol: Optional[str] = None
    data_items: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ComponentCreate(BaseModel):
    name: str
    type: str # Hardware or Software
    description: Optional[str] = None
    tags: Optional[List[str]] = []  # List of tags
    lifecycle: Optional[str] = 'Active'  # Active, Legacy, Planned, Deprecated
    project_id: Optional[str] = None  # Optional project association

class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    x: Optional[int] = None
    y: Optional[int] = None
    tags: Optional[List[str]] = None
    lifecycle: Optional[str] = None
    project_id: Optional[str] = None

class ComponentOut(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    x: Optional[int] = None
    y: Optional[int] = None
    tags: Optional[List[str]] = []
    lifecycle: Optional[str] = 'Active'
    project_id: Optional[str] = None
    children: List[ComponentRelationshipOut] = []
    
    model_config = ConfigDict(from_attributes=True)
