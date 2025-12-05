# app/schemas/requirement.py
from datetime import datetime
from typing import Optional, Dict, List, Any

from pydantic import BaseModel, ConfigDict, Field
from app.enums import ReqLevel, EarsType

class RequirementCreate(BaseModel):
    short_name: str                     # required on create
    text: str                           # full "The system shall..." statement
    area: Optional[str] = None
    level: Optional[ReqLevel] = None    # defaults to STK in endpoint if omitted
    ears_type: Optional[EarsType] = EarsType.UBIQUITOUS
    
    # EARS-specific fields
    ears_trigger: Optional[str] = None   # For EVENT_DRIVEN
    ears_state: Optional[str] = None     # For STATE_DRIVEN
    ears_condition: Optional[str] = None # For UNWANTED_BEHAVIOR
    ears_feature: Optional[str] = None   # For OPTIONAL_FEATURE
    
    status: Optional[str] = None
    rationale: Optional[str] = None
    owner: Optional[str] = None
    
    project_id: str
    
    model_config = ConfigDict(extra='ignore')  # Ignore deprecated fields

class RequirementOut(BaseModel):
    aid: str
    short_name: str
    text: str
    area: Optional[str] = None
    level: Optional[ReqLevel] = None
    ears_type: Optional[EarsType] = None
    
    # EARS-specific fields
    ears_trigger: Optional[str] = None
    ears_state: Optional[str] = None
    ears_condition: Optional[str] = None
    ears_feature: Optional[str] = None
    
    # EARS validation result (computed, not stored)
    ears_validation: Optional[Dict[str, Any]] = Field(default=None, exclude=True)
    
    status: Optional[str] = None
    rationale: Optional[str] = None
    owner: Optional[str] = None
    project_id: str
    created_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class EARSTemplateResponse(BaseModel):
    """Response model for EARS templates"""
    templates: Dict[str, str]
    descriptions: Dict[str, str]

class EARSValidationRequest(BaseModel):
    """Request model for EARS validation"""
    text: str
    pattern: EarsType

class EARSValidationResponse(BaseModel):
    """Response model for EARS validation"""
    valid: bool
    message: str
    suggestions: List[str]
    detected_pattern: Optional[str] = None
    components: Optional[Dict[str, str]] = None