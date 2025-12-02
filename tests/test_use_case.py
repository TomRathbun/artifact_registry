# tests/test_use_case.py
import pytest
from app.db.models.use_case import UseCase
from app.utils.id_generator import generate_artifact_id

def create_use_case(db_session, area, description, status="PROPOSED", primary_actor=None):
    aid = generate_artifact_id(db_session, UseCase, area)
    uc = UseCase(
        aid=aid,
        area=area,
        description=description,
        status=status,
        primary_actor=primary_actor or []
    )
    db_session.add(uc)
    db_session.commit()
    db_session.refresh(uc)
    return aid

def test_list_use_cases(client, db_session):
    response = client.get("/use-cases/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_use_cases_filtered(client, db_session, auth_token):
    create_use_case(db_session, "MCK", "Test", "PROPOSED", ["User"])
    response = client.get("/use-cases/?area=MCK&status=PROPOSED&primary_actor=User", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_get_use_case(client, db_session):
    aid = create_use_case(db_session, "MCK", "Test")
    response = client.get(f"/use-cases/{aid}")
    assert response.status_code == 200
    assert response.json()["description"] == "Test"

def test_get_use_case_not_found(client):
    response = client.get("/use-cases/invalid")
    assert response.status_code == 404

def test_create_use_case(client, db_session, auth_token):
    payload = {"area": "MCK", "description": "Test"}
    response = client.post("/use-cases/", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    assert "aid" in response.json()

def test_update_use_case(client, db_session, auth_token):
    aid = create_use_case(db_session, "MCK", "Old")
    response = client.put(f"/use-cases/{aid}", json={"description": "New"}, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json()["description"] == "New"

def test_update_use_case_not_found(client, auth_token):
    response = client.put("/use-cases/invalid", json={}, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404

def test_delete_use_case(client, db_session, auth_token):
    aid = create_use_case(db_session, "MCK", "Test")
    response = client.delete(f"/use-cases/{aid}", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 204
    get_res = client.get(f"/use-cases/{aid}")
    assert get_res.status_code == 404

def test_delete_use_case_not_found(client, auth_token):
    response = client.delete("/use-cases/invalid", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404