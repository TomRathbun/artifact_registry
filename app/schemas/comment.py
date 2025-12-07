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
    pass


class CommentResolve(BaseModel):
    resolved_by: str


class Comment(CommentBase):
    id: str
    created_at: datetime
    resolved: bool
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Config:
        from_attributes = True
