# app/db/models/user.py
from sqlalchemy import Column, String, JSON, Text, DateTime, func, Boolean
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    aid = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=True) # Legacy single role
    roles = Column(JSON, default=list)  # New multiple roles
    hashed_password = Column(String, nullable=False)
    password_expired = Column(Boolean, default=False) # For forcing password change
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime, default=func.now())