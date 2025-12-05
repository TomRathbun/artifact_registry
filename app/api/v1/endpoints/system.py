from fastapi import APIRouter
from app.core.config import settings
import sys
import platform

router = APIRouter()

import fastapi
import platform
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps

@router.get("/info")
def get_system_info(db: Session = Depends(deps.get_db)):
    """
    Get system version information.
    """
    db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
    db_version = "Unknown"
    
    try:
        if db_type == "PostgreSQL":
            # Returns something like "PostgreSQL 16.1 on x86_64..."
            # We want to extract just the version number usually, but the full string is info-rich
            # Let's try to get a cleaner version
            result = db.execute(text("SHOW server_version;")).scalar()
            db_version = result
        else:
            result = db.execute(text("SELECT sqlite_version();")).scalar()
            db_version = result
    except Exception as e:
        db_version = f"Error fetching version: {str(e)}"

    return {
        "app_name": settings.PROJECT_NAME,
        "version": "0.1.0", # TODO: Get dynamically if possible, or keep hardcoded for now matching pyproject
        "python_version": platform.python_version(),
        "fastapi_version": fastapi.__version__,
        "database_type": db_type,
        "database_version": db_version,
    }
