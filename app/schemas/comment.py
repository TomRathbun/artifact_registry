"""
Pydantic schemas for Comment model.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommentBase(BaseModel):
    artifact_aid: str
    field_name: str
    comment_text: str
    author: str


class CommentCreate(CommentBase):
    selected_text: Optional[str] = None


class CommentResolve(BaseModel):
    resolved_by: str
    resolution_action: Optional[str] = None


class Comment(CommentBase):
    id: str
    created_at: datetime
    resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    selected_text: Optional[str] = None
    resolution_action: Optional[str] = None

    class Config:
        from_attributes = True
