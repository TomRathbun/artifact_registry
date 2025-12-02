# app/db/__init__.py
from .base import Base, engine, SessionLocal
from .session import get_db
from .models import *   # pulls in all model classes

__all__ = [
    "Base", "engine", "SessionLocal", "get_db",
    # models will be added automatically by the * import above
]