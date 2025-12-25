# app/core/config.py
# Settings for the FastAPI backend – Pydantic v2 style
# Dr Thomas Rathbun / SECL MBSE Team – Phase 2
from pydantic import ConfigDict
from pydantic_settings import BaseSettings   # <-- new package
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "TR2 Registry Backend"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "postgresql://admin@127.0.0.1:5433/registry"

    # class Config:
    #     env_file = ".env"
    #     case_sensitive = False
    model_config = ConfigDict(from_attributes=True)  # Replaces class Config

settings = Settings()