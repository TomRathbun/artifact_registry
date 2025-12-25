from pydantic import BaseModel, ConfigDict
from typing import Optional, List

# Area Schemas
class AreaBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class AreaOut(AreaBase):
    model_config = ConfigDict(from_attributes=True)

# Person Schemas
class PersonBase(BaseModel):
    name: str
    roles: List[str] = [] # "actor", "owner", "stakeholder"

    description: Optional[str] = None
    project_id: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonOut(PersonBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
