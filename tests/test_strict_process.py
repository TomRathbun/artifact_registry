# tests/test_strict_process.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from artifact_registry import app

# Setup in-memory DB for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_strict_process_flow():
    # 1. Create Project
    response = client.post("/projects/", json={"name": "TEST_PROJECT", "description": "Tech Refresh Test"})
    assert response.status_code == 201
    project_id = response.json()["id"]

    # 2. Create Vision (Root)
    vision_payload = {
        "title": "Modernize Registry",
        "description": "We need a new registry.",
        "project_id": project_id
    }
    response = client.post("/vision-statements/", json=vision_payload)
    assert response.status_code == 201
    vision_id = response.json()["aid"]

    # 3. Create Need (Linked to Vision)
    need_payload = {
        "title": "Structured Process",
        "description": "Enforce strict flow.",
        "project_id": project_id,
        "source_vision_id": vision_id
    }
    response = client.post("/needs/", json=need_payload)
    assert response.status_code == 201
    need_id = response.json()["aid"]
    
    # Verify Linkage created
    response = client.get(f"/linkages/from/{need_id}")
    assert response.status_code == 200
    links = response.json()
    assert len(links) == 1
    assert links[0]["target_id"] == vision_id
    assert links[0]["relationship_type"] == "derives_from"

    # 4. Create Use Case (Linked to Need)
    uc_payload = {
        "title": "Create Artifact",
        "primary_actor": "User",
        "project_id": project_id,
        "source_need_id": need_id
    }
    response = client.post("/use-cases/", json=uc_payload)
    assert response.status_code == 201
    uc_id = response.json()["aid"]

    # 5. Create Requirement (Linked to Use Case)
    req_payload = {
        "short_name": "SYS-001",
        "text": "The system shall enforce linking.",
        "project_id": project_id,
        "source_use_case_id": uc_id
    }
    response = client.post("/requirements/", json=req_payload)
    assert response.status_code == 201
    req_id = response.json()["aid"]

def test_validation_failures():
    # Create Project
    response = client.post("/projects/", json={"name": "TEST_PROJECT"})
    project_id = response.json()["id"]

    # Fail: Create Need without Vision
    need_payload = {
        "title": "Orphan Need",
        "description": "Should fail.",
        "project_id": project_id,
        # Missing source_vision_id
    }
    response = client.post("/needs/", json=need_payload)
    assert response.status_code == 422 # Validation error (missing field)

    # Fail: Create Need with invalid Vision ID
    need_payload_invalid = {
        "title": "Bad Link Need",
        "description": "Should fail.",
        "project_id": project_id,
        "source_vision_id": "INVALID-ID"
    }
    response = client.post("/needs/", json=need_payload_invalid)
    assert response.status_code == 400 # Logic error (Vision not found)
