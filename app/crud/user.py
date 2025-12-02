# app/crud/user.py
from sqlalchemy.orm import Session
from app.db.models.user import User  # Assume User model in db/models.py
from app.schemas.user import UserCreate

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user