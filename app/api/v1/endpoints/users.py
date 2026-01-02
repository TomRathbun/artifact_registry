from fastapi import APIRouter, Depends, HTTPException, status, Form
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.crud import user as crud_user
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.core import security

from app.api import deps

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_me(current_user: crud_user.User = Depends(deps.get_current_user)):
    return current_user

@router.get("/", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _permission = Depends(deps.check_permissions(["admin"]))
):
    """List all users (admin only)"""
    users = db.query(crud_user.User).all()
    return users

@router.post("/change-password")
def change_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db),
    current_user: crud_user.User = Depends(deps.get_current_user)
):
    # Verify current password
    if not security.verify_password(current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # Get the user from the current session
    user = db.query(crud_user.User).filter(crud_user.User.aid == current_user.aid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update to new password
    user.hashed_password = security.get_password_hash(new_password)
    user.password_expired = False
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/{aid}/reset-password")
def reset_password(
    aid: str,
    db: Session = Depends(get_db),
    _permission = Depends(deps.check_permissions(["admin"]))
):
    user = db.query(crud_user.User).filter(crud_user.User.aid == aid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Use default password for easier management
    new_password = "changeme"
    
    user.hashed_password = security.get_password_hash(new_password)
    user.password_expired = True
    db.commit()
    return {"new_password": new_password}

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate, 
    db=Depends(get_db),
    _permission=Depends(deps.check_permissions(["admin"]))
):
    db_user = crud_user.get_user_by_username(db, username=payload.username)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    
    # Check email too
    db_email = db.query(crud_user.User).filter(crud_user.User.email == payload.email).first()
    if db_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
    return crud_user.create_user(db, user=payload)

@router.patch("/{aid}", response_model=UserOut)
def update_user(
    aid: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _permission = Depends(deps.check_permissions(["admin"]))
):
    """Update user details (admin only)"""
    user = db.query(crud_user.User).filter(crud_user.User.aid == aid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if provided
    if payload.email is not None:
        # Check if email is already taken by another user
        existing = db.query(crud_user.User).filter(
            crud_user.User.email == payload.email,
            crud_user.User.aid != aid
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = payload.email
    
    if payload.full_name is not None:
        user.full_name = payload.full_name
    
    if payload.roles is not None:
        user.roles = payload.roles
    
    if payload.is_active is not None:
        user.is_active = payload.is_active
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{aid}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    aid: str,
    db: Session = Depends(get_db),
    _permission = Depends(deps.check_permissions(["admin"]))
):
    """Delete a user (admin only)"""
    user = db.query(crud_user.User).filter(crud_user.User.aid == aid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return None