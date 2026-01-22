from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
from uuid import uuid4

def generate_uuid():
    return str(uuid4())

class Image(Base):
    __tablename__ = "images"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    filename = Column(String, nullable=False, unique=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True) # Nullable for legacy/global
    created_at = Column(DateTime(timezone=True), server_default=func.now())
