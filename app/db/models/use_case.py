# app/db/models/use_case.py
from sqlalchemy import Column, String, JSON, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseArtifact

# ============================================================================
# Association Tables
# ============================================================================

# UseCase <-> Precondition (existing)
use_case_preconditions = Table(
    "use_case_preconditions",
    Base.metadata,
    Column("use_case_id", String, ForeignKey("use_cases.aid"), primary_key=True),
    Column("precondition_id", String, ForeignKey("preconditions.id"), primary_key=True),
    extend_existing=True,
)

# UseCase <-> Stakeholder (Actor)
use_case_stakeholders = Table(
    "use_case_stakeholders",
    Base.metadata,
    Column("use_case_id", String, ForeignKey("use_cases.aid"), primary_key=True),
    Column("person_id", String, ForeignKey("people.id"), primary_key=True),
    extend_existing=True,
)

# UseCase <-> Postcondition
use_case_postconditions = Table(
    "use_case_postconditions",
    Base.metadata,
    Column("use_case_id", String, ForeignKey("use_cases.aid"), primary_key=True),
    Column("postcondition_id", String, ForeignKey("postconditions.id"), primary_key=True),
    extend_existing=True,
)

# UseCase <-> Exception
use_case_exceptions = Table(
    "use_case_exceptions",
    Base.metadata,
    Column("use_case_id", String, ForeignKey("use_cases.aid"), primary_key=True),
    Column("exception_id", String, ForeignKey("exceptions.id"), primary_key=True),
    extend_existing=True,
)

# ============================================================================
# Reusable Component Models
# ============================================================================

class Precondition(Base):
    """Reusable preconditions (existing model)"""
    __tablename__ = "preconditions"
    
    id = Column(String, primary_key=True, index=True)
    text = Column(String, nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)


class Postcondition(Base):
    """Reusable postconditions"""
    __tablename__ = "postconditions"
    
    id = Column(String, primary_key=True, index=True)
    text = Column(String, nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)


class Exception(Base):
    """Reusable exception scenarios with trigger and handling"""
    __tablename__ = "exceptions"
    
    id = Column(String, primary_key=True, index=True)
    trigger = Column(String, nullable=False)  # e.g., "Sensor/data link failure"
    handling = Column(Text, nullable=False)  # e.g., "Fall back to last known good data..."
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)


# ============================================================================
# Use Case Model
# ============================================================================

class UseCase(BaseArtifact):
    __tablename__ = "use_cases"
    
    # Core identification
    title = Column(String, nullable=False)  # e.g., "Real-Time AI-Augmented Threat Response"
    description = Column(Text, nullable=True)  # Brief overview (optional)
    area = Column(String, nullable=True)  # Inherited from linked Need, stored for easy querying

    
    # NEW: Trigger - what initiates this use case
    trigger = Column(Text, nullable=True)  # e.g., "New or escalating threat data appears on COP"
    
    # Actors & Scope
    # Primary actor - foreign key to Person table
    primary_actor_id = Column(String, ForeignKey("people.id"), nullable=True)
    primary_actor = relationship("Person", foreign_keys=[primary_actor_id])
    
    # Stakeholders - many-to-many with Person table
    stakeholders = relationship("Person", secondary=use_case_stakeholders, backref="stakeholder_use_cases")
    
    # Use Case Metadata
    # scope and level removed

    
    # Preconditions (Many-to-Many) - existing
    preconditions = relationship("Precondition", secondary=use_case_preconditions, backref="use_cases")
    
    # Postconditions (Many-to-Many) - NEW
    postconditions = relationship("Postcondition", secondary=use_case_postconditions, backref="use_cases")
    
    # Main Success Scenario (list of steps)
    # Structure: [{"step_num": 1, "actor": "System", "description": "Ingests data"}, ...]
    mss = Column(JSON, default=list)
    
    # Extensions (alternative flows)
    # Structure: [{"step": "3a", "condition": "Confidence < 70%", "handling": "Flag..."}, ...]
    extensions = Column(JSON, default=list)
    
    # Exceptions (Many-to-Many) - NEW
    exceptions = relationship("Exception", secondary=use_case_exceptions, backref="use_cases")
    
    # Traceability
    # req_references removed