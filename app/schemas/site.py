from typing import Optional
from pydantic import BaseModel, ConfigDict

class SiteCreate(BaseModel):
    name: str
    security_domain: Optional[str] = None

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    security_domain: Optional[str] = None

class SiteOut(BaseModel):
    id: str
    name: str
    security_domain: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
