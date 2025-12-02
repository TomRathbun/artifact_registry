# app/db/models/requirement.py
from sqlalchemy import Column, String, JSON, Text, Enum as SQLEnum
from app.db.base import Base, BaseArtifact
from app.enums import ReqLevel, EarsType


class Requirement(BaseArtifact):
    __tablename__ = "requirements"

    # Core requirement content
    short_name  = Column(String, nullable=False)   # e.g., "SYS-REQ-001"
    text        = Column(Text, nullable=False)     # Full "The system shall …" statement

    # Classification
    level       = Column(SQLEnum(ReqLevel), nullable=False, default=ReqLevel.STK)  # SYS, STK, SUBSYSTEM, etc.
    ears_type   = Column(SQLEnum(EarsType), nullable=False, default=EarsType.UBIQUITOUS)  # UBIQUITOUS, EVENT, UNWANTED, STATE
    area        = Column(String, nullable=True)  # Area/domain (e.g., "AI", "Zero-Trust")

    # EARS-specific fields for pattern components
    ears_trigger = Column(Text, nullable=True)  # For EVENT_DRIVEN: the trigger event (WHEN...)
    ears_state   = Column(Text, nullable=True)  # For STATE_DRIVEN: the system state (WHILE...)
    ears_condition = Column(Text, nullable=True)  # For UNWANTED_BEHAVIOR: the condition (IF...)
    ears_feature = Column(Text, nullable=True)  # For OPTIONAL_FEATURE: the feature name (WHERE...)

    # Optional but HIGHLY valuable for workshops
    rationale   = Column(Text, nullable=True)      # Why this requirement exists
    owner       = Column(String, nullable=True)    # Who is accountable for verification