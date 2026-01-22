# app/db/models/metadata.py
from sqlalchemy import Column, String, Text, ForeignKey, JSON
from app.db.base import Base
from uuid import uuid4

def generate_uuid():
    return str(uuid4())

class Area(Base):
    __tablename__ = "areas"

    code = Column(String, primary_key=True, index=True)  # e.g. "AI", "ZTN"
    name = Column(String, nullable=False)                # e.g. "Artificial Intelligence"
    description = Column(Text, nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)


class Person(Base):
    __tablename__ = "people"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)      # e.g. "Alice Smith"

    description = Column(Text, nullable=True)
    
    # New fields for unification
    project_id = Column(String, ForeignKey("projects.id"), nullable=True) # Nullable for global people if needed, or specific to project
    roles = Column(JSON, default=list) # List of strings: ["actor", "owner", "stakeholder"]
