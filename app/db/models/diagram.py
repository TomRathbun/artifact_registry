from sqlalchemy import Column, String, ForeignKey, Integer, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from uuid import uuid4

def generate_uuid():
    return str(uuid4())

class Diagram(Base):
    __tablename__ = "diagrams"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, default="component")
    content = Column(Text, nullable=True) # For Sequence Diagrams (Mermaid)
    filter_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    components = relationship("DiagramComponent", back_populates="diagram", cascade="all, delete-orphan")
    edges = relationship("DiagramEdge", back_populates="diagram", cascade="all, delete-orphan")

class DiagramComponent(Base):
    __tablename__ = "diagram_components"

    diagram_id = Column(String, ForeignKey("diagrams.id"), primary_key=True)
    component_id = Column(String, ForeignKey("components.id"), primary_key=True)
    x = Column(Integer, default=0)
    y = Column(Integer, default=0)

    # Relationships
    diagram = relationship("Diagram", back_populates="components")
    component = relationship("Component")

class DiagramEdge(Base):
    __tablename__ = "diagram_edges"

    diagram_id = Column(String, ForeignKey("diagrams.id"), primary_key=True)
    source_id = Column(String, ForeignKey("components.id"), primary_key=True)
    target_id = Column(String, ForeignKey("components.id"), primary_key=True)
    source_handle = Column(String, nullable=True)
    target_handle = Column(String, nullable=True)

    # Relationships
    diagram = relationship("Diagram", back_populates="edges")

