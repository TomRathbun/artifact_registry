from typing import Generator
from app.db.session import SessionLocal
from fastapi import Header

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(x_user_id: str = Header("admin", alias="X-User-ID")):
    """
    Mock authentication dependency.
    In production, this would verify a JWT token.
    For now, it accepts a user ID from the header or defaults to 'admin'.
    """
    # Return a simple object mimicking a User model
    return type('User', (), {
        'username': x_user_id, 
        'full_name': 'Admin User',
        'id': x_user_id
    })
