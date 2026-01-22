import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# 1. FORCE LOAD .ENV AT THE ABSOLUTE TOP
# This ensures os.environ is populated before Settings is instantiated
registry_root = Path(__file__).resolve().parents[2]
env_path = registry_root / ".env"
if env_path.exists():
    load_dotenv(env_path, override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Artifact Registry Backend"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str = "postgresql://admin@127.0.0.1:5433/registry"

    # Base Directory
    BASE_DIR: Path = registry_root

    # Data Directories - Use os.getenv directly to be 100% sure we bypass Pydantic defaults
    # if the env var exists in the system environment.
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(registry_root / "uploads")))
    BACKUP_DIR: Path = Path(os.getenv("BACKUP_DIR", str(registry_root / "db_backups")))
    DATA_ARCHIVE_DIR: Path = Path(os.getenv("DATA_ARCHIVE_DIR", str(registry_root / "data_archives")))

    # Requirements Classifier Configuration
    # Default to sibling directory structure
    CLASSIFIER_PROJECT_DIR: Path = Path(os.getenv("CLASSIFIER_PROJECT_DIR", str(registry_root.parent / "requirements_classifier")))
    CLASSIFIER_MODEL_PATH: Optional[Path] = Path(os.getenv("CLASSIFIER_MODEL_PATH", "")) if os.getenv("CLASSIFIER_MODEL_PATH") else None

    # Secondary Pydantic config just in case
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Global check to ensure paths are absolute and cleaned
settings.UPLOAD_DIR = settings.UPLOAD_DIR.resolve()
settings.BACKUP_DIR = settings.BACKUP_DIR.resolve()
settings.DATA_ARCHIVE_DIR = settings.DATA_ARCHIVE_DIR.resolve()

# ENSURE DIRECTORIES EXIST IMMEDIATELY
settings.UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
settings.BACKUP_DIR.mkdir(exist_ok=True, parents=True)
settings.DATA_ARCHIVE_DIR.mkdir(exist_ok=True, parents=True)

print(f"!!! CONFIG LOADED !!!")
print(f"UPLOAD_DIR: {settings.UPLOAD_DIR}")
print(f"!!!!!!!!!!!!!!!!!!!!!")