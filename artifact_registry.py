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

import time
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist with retries
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            print(f"Database connection attempt {attempt + 1}/{max_retries}...")
            Base.metadata.create_all(bind=engine)
            
            # Seed initial user
            with SessionLocal() as db:
                from app.db.models.user import User
                if not db.query(User).filter(User.username == "rathbun").first():
                    db.add(User(
                        aid="rathbun",
                        username="rathbun",
                        email="rathbunt@gmail.com",
                        hashed_password=SECL_PASS_HASH),
                    )
                    db.commit()
            print("Database initialized successfully.")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Database connection failed: {e}. Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                print(f"Database connection failed after {max_retries} attempts: {e}")
                # We don't raise here to allow the app to start (so logs are visible), 
                # but subsequent requests will fail.
    yield

# TODO: Replace with actual hash or load from env
SECL_PASS_HASH = "$argon2id$v=19$m=65536,t=3,p=4$..." 

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

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

# Trigger reload

# Trigger reload