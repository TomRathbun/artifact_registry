# app/db/session.py
# SQLAlchemy session factory for the FastAPI dependency system
# SECL MBSE Team – Phase 2

from sqlalchemy.orm import Session
from app.db.base import SessionLocal  # <-- creates the engine in base.py

def get_db() -> Session:
    """
    FastAPI dependency – yields a DB session and guarantees it is closed.
    Use with:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()