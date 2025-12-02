# app/db/models/vision.py
from sqlalchemy import Column, String, Text, JSON, DateTime, Enum as SQLEnum, func
from app.db.base import Base, BaseArtifact


class Vision(BaseArtifact):
    __tablename__ = "visions"
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
