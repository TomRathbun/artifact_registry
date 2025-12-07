"""
API endpoints for artifact review comments.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.api import deps
from app.db.models.comment import Comment as CommentModel
from app.schemas import comment as schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Comment])
def list_comments(
    artifact_aid: str = Query(..., description="Artifact AID to get comments for"),
    resolved: Optional[bool] = Query(None, description="Filter by resolution status"),
    db: Session = Depends(deps.get_db)
):
    """
    List all comments for an artifact.
    Optionally filter by resolved status.
    """
    query = db.query(CommentModel).filter(CommentModel.artifact_aid == artifact_aid)
    
    if resolved is not None:
        query = query.filter(CommentModel.resolved == resolved)
    
    comments = query.order_by(CommentModel.created_at.desc()).all()
    return comments


@router.post("/", response_model=schemas.Comment)
def create_comment(
    comment_in: schemas.CommentCreate,
    db: Session = Depends(deps.get_db)
):
    """
    Create a new comment on an artifact field.
    """
    comment = CommentModel(
        artifact_aid=comment_in.artifact_aid,
        field_name=comment_in.field_name,
        comment_text=comment_in.comment_text,
        author=comment_in.author
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.patch("/{comment_id}/resolve", response_model=schemas.Comment)
def resolve_comment(
    comment_id: str,
    resolve_data: schemas.CommentResolve,
    db: Session = Depends(deps.get_db)
):
    """
    Mark a comment as resolved.
    """
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.resolved = True
    comment.resolved_at = datetime.utcnow()
    comment.resolved_by = resolve_data.resolved_by
    
    db.commit()
    db.refresh(comment)
    return comment


@router.patch("/{comment_id}/unresolve", response_model=schemas.Comment)
def unresolve_comment(
    comment_id: str,
    db: Session = Depends(deps.get_db)
):
    """
    Mark a comment as unresolved (reopen it).
    """
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.resolved = False
    comment.resolved_at = None
    comment.resolved_by = None
    
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: str,
    db: Session = Depends(deps.get_db)
):
    """
    Delete a comment.
    """
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}
