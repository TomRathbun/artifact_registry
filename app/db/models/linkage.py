# app/db/models/linkage.py
from sqlalchemy import Column, String, Enum as SQLEnum
from app.db.base import Base
from app.enums import LinkType


class Linkage(Base):
    __tablename__ = "linkages"

    aid                   = Column(String, primary_key=True, index=True)
    source_artifact_type  = Column(String, nullable=False)
    source_id             = Column(String, nullable=False)
    target_artifact_type  = Column(String, nullable=False)
    target_id             = Column(String, nullable=False)
    relationship_type     = Column(SQLEnum(LinkType), nullable=False)  # e.g., derives_from, satisfies, refines
    project_id            = Column(String, nullable=False, index=True)