from typing import Optional, List, Any
import json
from pydantic import BaseModel, ConfigDict, field_validator

class SiteCreate(BaseModel):
    name: str
    security_domain: Optional[str] = None
    tags: Optional[List[str]] = []
    project_id: Optional[str] = None

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    security_domain: Optional[str] = None
    tags: Optional[List[str]] = None
    # project_id usually not updatable via this separate update model unless intended

class SiteOut(BaseModel):
    id: str
    name: str
    security_domain: Optional[str] = None
    tags: Optional[List[str]] = []
    project_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


    @field_validator('tags', mode='before')
    @classmethod
    def parse_tags(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v if v is not None else []
