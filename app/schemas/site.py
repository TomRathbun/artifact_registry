from typing import Optional, List, Any
import json
from pydantic import BaseModel, ConfigDict, field_validator

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

    @field_validator('tags', mode='before')
    @classmethod
    def parse_tags(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v if v is not None else []
