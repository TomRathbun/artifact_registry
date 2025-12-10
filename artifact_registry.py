# artifact_registry.py
# TR2 Registry Backend – FastAPI entry point
# Dr Thomas Rathbun / SECL MBSE Team – Phase 2

from datetime import datetime, timedelta, UTC

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import FastAPI, APIRouter, Form
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
from pydantic import BaseModel

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import SessionLocal
from app.db.base import Base, engine

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# TODO: Replace with actual hash or load from env
SECL_PASS_HASH = "$argon2id$v=19$m=65536,t=3,p=4$..." 

app = FastAPI(title=settings.PROJECT_NAME)

from fastapi.staticfiles import StaticFiles
import os

# Get absolute path relative to this file (artifact_registry.py is in root)
current_dir = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(current_dir, "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

print(f"Mounting /uploads to: {UPLOAD_DIR}")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

with SessionLocal() as db:
    from app.db.models.user import User
    # Check if user exists to avoid error if table is empty
    try:
        if not db.query(User).filter(User.username == "rathbun").first():
            db.add(User(
                aid="rathbun",
                username="rathbun",
                email="rathbunt@gmail.com",
                hashed_password=SECL_PASS_HASH),
            )
            db.commit()
    except Exception as e:
        print(f"Error seeding user: {e}")

# Trigger reload