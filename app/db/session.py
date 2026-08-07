# app/db/session.py
# SQLAlchemy session factory for the FastAPI dependency system

from typing import Generator

from sqlalchemy.orm import Session

from app.db.base import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency – yields a DB session and guarantees it is closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            # Silence errors during shutdown/reload
            pass
