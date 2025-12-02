# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import your FastAPI app
from artifact_registry import app

# FIXED: Explicit imports — app.db is a package, so import from submodules
from app.db.base import Base
from app.db.session import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def test_engine():
    """Fresh engine per test to avoid state leaks."""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    yield engine
    engine.dispose()

@pytest.fixture(scope="function")
def db_session(test_engine):
    """Fresh DB session with tables created/dropped per test."""
    Base.metadata.create_all(bind=test_engine)
    print("Tables created:", list(Base.metadata.tables.keys()))
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    """TestClient with DB override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db  # type: ignore[attr-defined]
    print("Override applied for get_db")  # Debug: Confirm override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()  # type: ignore[attr-defined]

@pytest.fixture
def auth_token(client):
    resp = client.post(
        "/token",
        data={"username": "rathbun", "password": "seclpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert resp.status_code == 200, f"Token failed: {resp.text}"
    return resp.json()["access_token"]