# tests/test_linkage.py
import pytest
from app.db.models.vision import Vision
from app.db.models.need import Need
from app.utils.id_generator import generate_artifact_id

@pytest.fixture
def sample_artifacts(db_session):
    vision_aid = generate_artifact_id(db_session, Vision, "GLOBAL")
    need_aid = generate_artifact_id(db_session, Need, "MCK")
    vision = Vision(aid=vision_aid, statement="Test")
    need = Need(aid=need_aid, title="Test", description="Test", area="MCK")
    db_session.add_all([vision, need])
    db_session.commit()
    return {"vision_id": vision_aid, "need_id": need_aid}

def test_list_linkages(client, auth_token):
    response = client.get("/linkages/", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_linkage(client, sample_artifacts, auth_token):
    payload = {
        "source_artifact_type": "vision",
        "source_id": sample_artifacts["vision_id"],
        "target_artifact_type": "need",
        "target_id": sample_artifacts["need_id"],
        "link_type": "derives"
    }
    create_res = client.post("/linkages/", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
    aid = create_res.json()["aid"]
    response = client.get(f"/linkages/{aid}", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json()["aid"] == aid

# ... (other tests similar, add headers={"Authorization": f"Bearer {auth_token}"} to all client calls)

def test_get_linkage_not_found(client):
    response = client.get("/linkages/invalid")
    assert response.status_code == 404

def test_create_linkage(client, sample_artifacts, auth_token):
    payload = {
        "source_artifact_type": "vision",
        "source_id": sample_artifacts["vision_id"],
        "target_artifact_type": "need",
        "target_id": sample_artifacts["need_id"],
        "link_type": "derives"
    }
    response = client.post("/linkages/", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    assert "aid" in response.json()

def test_create_linkage_invalid_source(client, sample_artifacts, auth_token):
    payload = {
        "source_artifact_type": "invalid",
        "source_id": "invalid",
        "target_artifact_type": "need",
        "target_id": "invalid",
        "link_type": "derives"
    }
    response = client.post("/linkages/", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 400

def test_update_linkage(client, sample_artifacts, auth_token):
    # Create first
    create_payload = {
        "source_artifact_type": "vision",
        "source_id": sample_artifacts["vision_id"],
        "target_artifact_type": "need",
        "target_id": sample_artifacts["need_id"],
        "link_type": "derives"
    }
    create_res = client.post("/linkages/", json=create_payload, headers={"Authorization": f"Bearer {auth_token}"})
    aid = create_res.json()["aid"]
    # Update
    update_payload = {**create_payload, "link_type": "satisfies"}
    response = client.put(f"/linkages/{aid}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["link_type"] == "satisfies"

def test_update_linkage_not_found(client):
    response = client.put("/linkages/invalid", json={})
    assert response.status_code == 404

def test_delete_linkage(client, sample_artifacts, auth_token):
    create_payload = {
        "source_artifact_type": "vision",
        "source_id": sample_artifacts["vision_id"],
        "target_artifact_type": "need",
        "target_id": sample_artifacts["need_id"],
        "link_type": "derives"
    }
    create_res = client.post("/linkages/", json=create_payload, headers={"Authorization": f"Bearer {auth_token}"})
    aid = create_res.json()["aid"]
    response = client.delete(f"/linkages/{aid}")
    assert response.status_code == 204
    # Verify deleted
    get_res = client.get(f"/linkages/{aid}")
    assert get_res.status_code == 404

def test_delete_linkage_not_found(client):
    response = client.delete("/linkages/invalid")
    assert response.status_code == 404