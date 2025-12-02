# app/db/models/project.py
from sqlalchemy import Column, String, Text
from app.db.base import Base
from uuid import uuid4

def generate_uuid():
    return str(uuid4())

class Project(Base):
    __tablename__ = "projects"

    id          = Column(String, primary_key=True, default=generate_uuid, index=True)
    name        = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
