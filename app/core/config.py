import os
import sys
import warnings
from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Force-load .env before Settings instantiation (skip override under pytest/testing)
registry_root = Path(__file__).resolve().parents[2]
env_path = registry_root / ".env"
_testing = (
    os.getenv("TESTING", "").lower() in ("1", "true", "yes")
    or "pytest" in sys.modules
    or os.getenv("PYTEST_CURRENT_TEST") is not None
)
if env_path.exists() and not _testing:
    load_dotenv(env_path, override=True)
elif env_path.exists() and _testing:
    # Load .env but do not override values already set by the test harness
    load_dotenv(env_path, override=False)

DEFAULT_SECRET = "change-me-in-production"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Artifact Registry Backend"
    VERSION: str = "0.1.9"
    SECRET_KEY: str = DEFAULT_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str = "postgresql://admin@127.0.0.1:5433/registry"
    ENVIRONMENT: str = "development"

    # Comma-separated browser origins allowed for CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    BASE_DIR: Path = registry_root

    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(registry_root / "uploads")))
    BACKUP_DIR: Path = Path(os.getenv("BACKUP_DIR", str(registry_root / "db_backups")))
    DATA_ARCHIVE_DIR: Path = Path(
        os.getenv("DATA_ARCHIVE_DIR", str(registry_root / "data_archives"))
    )

    CLASSIFIER_PROJECT_DIR: Path = Path(
        os.getenv(
            "CLASSIFIER_PROJECT_DIR",
            str(registry_root.parent / "requirements_classifier"),
        )
    )
    CLASSIFIER_MODEL_PATH: Optional[Path] = (
        Path(os.getenv("CLASSIFIER_MODEL_PATH", ""))
        if os.getenv("CLASSIFIER_MODEL_PATH")
        else None
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        return origins or ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()

# Resolve data directories and ensure they exist
settings.UPLOAD_DIR = Path(settings.UPLOAD_DIR).resolve()
settings.BACKUP_DIR = Path(settings.BACKUP_DIR).resolve()
settings.DATA_ARCHIVE_DIR = Path(settings.DATA_ARCHIVE_DIR).resolve()
settings.UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
settings.BACKUP_DIR.mkdir(exist_ok=True, parents=True)
settings.DATA_ARCHIVE_DIR.mkdir(exist_ok=True, parents=True)

# SECRET_KEY hardening
_in_pytest = "pytest" in sys.modules or os.getenv("PYTEST_CURRENT_TEST") is not None
_allow_insecure = os.getenv("ALLOW_INSECURE_DEFAULTS", "").lower() in ("1", "true", "yes")

if settings.SECRET_KEY == DEFAULT_SECRET:
    if settings.ENVIRONMENT.lower() == "production" and not _allow_insecure:
        raise RuntimeError(
            "SECRET_KEY must be set to a strong value in production. "
            "Generate one and put it in .env (see INSTALL.md)."
        )
    if not _in_pytest and not _allow_insecure:
        warnings.warn(
            "SECRET_KEY is the insecure default. Set SECRET_KEY in .env before "
            "exposing this service beyond localhost.",
            UserWarning,
            stacklevel=1,
        )
