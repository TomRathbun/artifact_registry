"""
Comment model for artifact review system.
Allows reviewers to add field-specific comments during artifact review.
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
import uuid


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    artifact_aid = Column(String, nullable=False, index=True)
    field_name = Column(String, nullable=False)  # e.g., "title", "description", "rationale"
    comment_text = Column(Text, nullable=False)
    author = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)
    selected_text = Column(String, nullable=True)
    resolution_action = Column(String, nullable=True)
