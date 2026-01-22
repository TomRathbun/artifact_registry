# app/db/base.py
# Engine + SessionLocal + Base class (imported by models and session)
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine, Column, String, Text, JSON, DateTime, Enum as SQLEnum, func, ForeignKey
from app.enums import Status

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class BaseArtifact(Base):
    __abstract__ = True

    aid           = Column(String, primary_key=True, index=True)
    status        = Column(SQLEnum(Status), default=Status.DRAFT)
    area          = Column(String, index=True, nullable=True)
    created_date  = Column(DateTime, default=func.now())
    last_updated  = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Multi-project support
    project_id    = Column(String, ForeignKey("projects.id"), nullable=False, index=True)


# CRITICAL: Import ALL models to register tables with Base.metadata
# (Enables create_all() in tests to build needs, visions, etc.)
from app.db.models.project import Project
from app.db.models.user import User
from app.db.models.vision import Vision
from app.db.models.need import Need
from app.db.models.use_case import UseCase, Precondition, Postcondition, Exception as UseCaseException
from app.db.models.component import Component, ComponentRelationship
from app.db.models.diagram import Diagram, DiagramComponent

from app.db.models.requirement import Requirement
from app.db.models.linkage import Linkage
from app.db.models.metadata import Area, Person
from app.db.models.site import Site
from app.db.models.artifact_event import ArtifactEvent
from app.db.models.document import Document
from app.db.models.comment import Comment
from app.db.models.image import Image