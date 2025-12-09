from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class SiteCreate(BaseModel):
    name: str
    security_domain: Optional[str] = None
    tags: Optional[List[str]] = []

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    security_domain: Optional[str] = None
    tags: Optional[List[str]] = None

class SiteOut(BaseModel):
    id: str
    name: str
    security_domain: Optional[str] = None
    tags: Optional[List[str]] = []

    model_config = ConfigDict(from_attributes=True)
