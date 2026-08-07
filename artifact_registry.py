# artifact_registry.py
# Artifact Registry Backend – FastAPI entry point

import logging
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from app.api import deps
from app.api.v1.router import api_router
from app.core import security
from app.core.config import settings
from app.core.roles import Role
from app.db.base import Base, engine
from app.db.session import SessionLocal, get_db

logger = logging.getLogger("artifact_registry")

# Seed hash for default admin password 'seclpass' (forced change on first login)
SECL_PASS_HASH = (
    "$argon2id$v=19$m=65536,t=3,p=4$FSh3SKDmtXDxHTXC93snCA$"
    "5LaMcoAwxs4G5YFdT+/qbkI1sZaKLAzTLEr0iF4SWYM"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    max_retries = 5
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            logger.info(
                "Database connection attempt %s/%s", attempt + 1, max_retries
            )
            # Prefer migrations in production; create_all keeps fresh local installs working.
            Base.metadata.create_all(bind=engine)

            with SessionLocal() as db:
                from app.db.models.user import User

                if not db.query(User).filter(User.username == "admin").first():
                    db.add(
                        User(
                            aid="admin",
                            username="admin",
                            email="admin@example.com",
                            full_name="Administrator",
                            roles=[Role.ADMIN.value],
                            password_expired=True,
                            hashed_password=SECL_PASS_HASH,
                        )
                    )
                    db.commit()
                    logger.warning(
                        "Seeded default admin user (username=admin). "
                        "Change the password immediately."
                    )
            logger.info("Database initialized successfully.")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(
                    "Database connection failed: %s. Retrying in %ss...", e, retry_delay
                )
                time.sleep(retry_delay)
            else:
                logger.error(
                    "Database connection failed after %s attempts: %s",
                    max_retries,
                    e,
                )
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)


@app.post("/token")
async def login(
    db=Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    from app.db.models.user import User

    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if not getattr(user, "is_active", True):
        raise HTTPException(status_code=403, detail="Inactive user")

    access_token = security.create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "password_expired": user.password_expired,
    }


# Authenticated API for managed files; public StaticFiles kept for markdown/img embedding
# in documents. Prefer listing/uploading only through authenticated endpoints.
app.mount(
    "/uploads",
    StaticFiles(directory=str(settings.UPLOAD_DIR.resolve())),
    name="uploads",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
