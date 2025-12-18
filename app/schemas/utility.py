from pydantic import BaseModel

class AIDRename(BaseModel):
    artifact_type: str  # vision, need, use_case, requirement, document
    old_aid: str
    new_aid: str
