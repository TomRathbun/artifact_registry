from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict
from app.enums import Status, NeedLevel
from app.schemas.site import SiteOut
from app.schemas.component import ComponentOut

class NeedCreate(BaseModel):
    title: str
    description: str
    area: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None
    rationale: Optional[str] = None
    stakeholder: Optional[str] = None
    
    owner_id: Optional[str] = None
    stakeholder_id: Optional[str] = None
    
    project_id: str
    
    level: Optional[NeedLevel] = None
    site_ids: Optional[List[str]] = []
    component_ids: Optional[List[str]] = []

class NeedOut(BaseModel):
    aid: str
    title: str
    description: str
    area: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None
    rationale: Optional[str] = None
    stakeholder: Optional[str] = None
    
    owner_id: Optional[str] = None
    stakeholder_id: Optional[str] = None
    
    project_id: str
    source_vision_id: Optional[str] = None
    created_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    
    level: Optional[NeedLevel] = None
    sites: List[SiteOut] = []
    components: List[ComponentOut] = []

    model_config = ConfigDict(from_attributes=True)