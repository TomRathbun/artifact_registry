# app/crud/user.py
from sqlalchemy.orm import Session
from app.db.models.user import User  # Assume User model in db/models.py
from app.schemas.user import UserCreate

from app.core.security import get_password_hash

def get_user_by_id(db: Session, aid: str):
    return db.query(User).filter(User.aid == aid).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    # Hash the password before saving
    hashed_password = get_password_hash(user.password)
    
    # We use username or a unique string for aid if not provided
    # For now, let's use the username as aid
    db_user = User(
        aid=user.username,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        roles=user.roles if user.roles else ["viewer"],
        hashed_password=hashed_password,
        password_expired=True  # Force password change on first login
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user