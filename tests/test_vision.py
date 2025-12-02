# tests/test_vision.py
def create_vision(db_session, statement):
    from app.db.models.vision import Vision
    vision = Vision(aid="TEST-GLOBAL-VISION-001", statement=statement)
    db_session.add(vision)
    db_session.commit()
    db_session.refresh(vision)
    return vision.aid

def test_list_vision_statements(client, db_session):
    create_vision(db_session, "Test")
    response = client.get("/vision-statements/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_vision_statement(client, db_session):
    aid = create_vision(db_session, "Test vision")
    response = client.get(f"/vision-statements/{aid}")
    assert response.status_code == 200
    assert response.json()["statement"] == "Test vision"

def test_get_vision_statement_not_found(client):
    response = client.get("/vision-statements/invalid")
    assert response.status_code == 404

def test_create_vision_statement(client, db_session, auth_token):
    payload = {"statement": "Test vision"}
    response = client.post("/vision-statements/", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    assert response.json()["aid"] == "TEST-GLOBAL-VISION-001"

def test_update_vision_statement(client, db_session, auth_token):
    create_vision(db_session, "Old")
    payload = {"statement": "New vision"}
    response = client.put("/vision-statements/TEST-GLOBAL-VISION-001", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json()["statement"] == "New vision"

def test_update_vision_statement_not_found(client, auth_token):
    response = client.put("/vision-statements/invalid", json={}, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404

def test_delete_vision_statement(client, db_session, auth_token):
    create_vision(db_session, "Test")
    response = client.delete("/vision-statements/TEST-GLOBAL-VISION-001", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 204
    get_res = client.get("/vision-statements/TEST-GLOBAL-VISION-001")
    assert get_res.status_code == 404

def test_delete_vision_statement_not_found(client, auth_token):
    response = client.delete("/vision-statements/invalid", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 404