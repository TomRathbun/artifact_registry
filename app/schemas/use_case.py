# app/schemas/use_case.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# ============================================================================
# Actor Schemas
# ============================================================================

class ActorBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

class ActorCreate(ActorBase):
    project_id: str

class ActorOut(ActorBase):
    id: str
    project_id: str
    
    model_config = ConfigDict(from_attributes=True)

# ============================================================================
# Person Schemas (for stakeholders)
# ============================================================================

class PersonOut(BaseModel):
    id: str
    name: str
    role: Optional[str] = None
    email: Optional[str] = None
    person_type: str = "both"
    
    model_config = ConfigDict(from_attributes=True)

# ============================================================================
# Precondition Schemas (existing)
# ============================================================================

class PreconditionBase(BaseModel):
    text: str = Field(..., min_length=1)

class PreconditionCreate(PreconditionBase):
    project_id: str

class PreconditionOut(PreconditionBase):
    id: str
    project_id: str
    
    model_config = ConfigDict(from_attributes=True)

# ============================================================================
# Postcondition Schemas
# ============================================================================

class PostconditionBase(BaseModel):
    text: str = Field(..., min_length=1)

class PostconditionCreate(PostconditionBase):
    project_id: str

class PostconditionOut(PostconditionBase):
    id: str
    project_id: str
    
    model_config = ConfigDict(from_attributes=True)

# ============================================================================
# Exception Schemas
# ============================================================================

class ExceptionBase(BaseModel):
    trigger: str = Field(..., min_length=1)
    handling: str = Field(..., min_length=1)

class ExceptionCreate(ExceptionBase):
    project_id: str

class ExceptionOut(ExceptionBase):
    id: str
    project_id: str
    
    model_config = ConfigDict(from_attributes=True)

# ============================================================================
# Use Case Component Schemas
# ============================================================================

class MssStep(BaseModel):
    """Main Success Scenario Step: Step Number, Actor, Action"""
    step_num: int = Field(..., gt=0)
    actor: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

class ExtensionStep(BaseModel):
    """Extension: Step Number, Condition, Handling"""
    step: str = Field(..., min_length=1)  # e.g., "3a", "4a"
    condition: str = Field(..., min_length=1)
    handling: str = Field(..., min_length=1)

# ============================================================================
# Use Case Schemas
# ============================================================================

class UseCaseCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    trigger: Optional[str] = None  # NEW: What initiates this use case
    
    # Actor references (IDs)
    primary_actor_id: Optional[str] = None  # Reference to Actor.id
    stakeholder_ids: List[str] = Field(default_factory=list)  # List of Actor IDs
    
    # Metadata
    area: Optional[str] = None
    status: Optional[str] = None
    # scope and level removed
    
    # Reusable component IDs
    precondition_ids: List[str] = Field(default_factory=list)
    postcondition_ids: List[str] = Field(default_factory=list)  # NEW
    exception_ids: List[str] = Field(default_factory=list)  # NEW
    
    # Main Success Scenario
    mss: List[MssStep] = Field(default_factory=list)
    
    # Extensions - enhanced structure (list instead of dict)
    extensions: List[ExtensionStep] = Field(default_factory=list)
    
    # Traceability
    # req_references removed
    
    # Required relationships
    project_id: str

class UseCaseOut(BaseModel):
    aid: str
    title: str
    description: Optional[str] = None
    trigger: Optional[str] = None
    
    # Return full objects instead of IDs
    primary_actor: Optional[ActorOut] = None
    stakeholders: List[PersonOut] = Field(default_factory=list)    

    # Metadata
    area: Optional[str] = None
    status: Optional[str] = None
    # scope and level removed
    
    # Return full objects for reusable components
    preconditions: List[PreconditionOut] = Field(default_factory=list)
    postconditions: List[PostconditionOut] = Field(default_factory=list)
    exceptions: List[ExceptionOut] = Field(default_factory=list)
    
    # Scenarios
    mss: List[MssStep] = Field(default_factory=list)
    extensions: List[ExtensionStep] = Field(default_factory=list)
    
    # Traceability
    # req_references removed
    
    # Metadata
    project_id: str
    created_date: Optional[datetime] = None
    last_updated: Optional[datetime] = None

    # Computed fields (from Linkages)
    source_need_id: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)