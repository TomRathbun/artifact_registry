# artifact_registry.py
# Artifact Registry Backend – FastAPI entry point
# SECL MBSE Team – Phase 2

import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import SessionLocal
from app.db.base import Base, engine
from app.core import security
from app.api import deps
from app.core.roles import Role

# Real hash for 'seclpass' using argon2
SECL_PASS_HASH = "$argon2id$v=19$m=65536,t=3,p=4$FSh3SKDmtXDxHTXC93snCA$5LaMcoAwxs4G5YFdT+/qbkI1sZaKLAzTLEr0iF4SWYM"

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
                if not db.query(User).filter(User.username == "admin").first():
                    db.add(User(
                        aid="admin",
                        username="admin",
                        email="admin@example.com",
                        full_name="Administrator",
                        roles=[Role.ADMIN.value],
                        password_expired=True,
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
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

@app.post("/token")
async def login(db: SessionLocal = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    from app.db.models.user import User
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # Verify password
    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = security.create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "password_expired": user.password_expired
    }

# MOUNT UPLOADS
UPLOAD_DIR = str(settings.UPLOAD_DIR.resolve())
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
