# tests/conftest.py
import os

# Ensure tests always use sqlite + a known secret before app import
os.environ["TESTING"] = "1"
os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ["ALLOW_INSECURE_DEFAULTS"] = "true"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ.setdefault("UPLOAD_DIR", os.path.join(os.getcwd(), ".test_uploads"))
os.environ.setdefault("BACKUP_DIR", os.path.join(os.getcwd(), ".test_backups"))
os.environ.setdefault("DATA_ARCHIVE_DIR", os.path.join(os.getcwd(), ".test_archives"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from artifact_registry import app, SECL_PASS_HASH
from app.db.base import Base
from app.db.session import get_db
from app.api import deps
from app.db.models.user import User
from app.db.models.project import Project
from app.core.roles import Role

SQLALCHEMY_DATABASE_URL = "sqlite://"


@pytest.fixture(scope="function")
def test_engine():
    """In-memory SQLite shared across connections for a single test."""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = SessionLocal()
    session.add(
        User(
            aid="admin",
            username="admin",
            email="admin@example.com",
            full_name="Administrator",
            roles=[Role.ADMIN.value],
            password_expired=False,
            is_active=True,
            hashed_password=SECL_PASS_HASH,
        )
    )
    session.commit()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[deps.get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def auth_token(client):
    resp = client.post(
        "/token",
        data={"username": "admin", "password": "seclpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, f"Token failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def sample_project(client, auth_headers):
    """Create a project via API and return its JSON body."""
    resp = client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "Test Project", "description": "pytest"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()
