# app/db/models/use_case.py
from sqlalchemy import Column, String, JSON, Text, DateTime, func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    aid = Column(String, primary_key=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    is_active = Column(String, default=True, nullable=True)
    created_date = Column(DateTime, default=func.now(), nullable=True)