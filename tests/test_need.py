# tests/test_need.py

def test_list_needs(client, db_session, auth_token):
    from app.db.models.need import Need
    from app.utils.id_generator import generate_artifact_id

    aid = generate_artifact_id(db_session, Need, "MCK")
    need = Need(aid=aid, title="Test", description="Test", area="MCK", status="PROPOSED")
    db_session.add(need)
    db_session.commit()

    response = client.get("/needs", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(n["aid"] == aid for n in response.json())

# def test_list_needs_filtered(client, db_session, auth_token):
#     from app.db.models.need import Need
#     from app.utils.id_generator import generate_artifact_id
#
#     aid = generate_artifact_id(db_session, Need, "MCK")
#     need = Need(aid=aid, title="Test", description="Test", area="MCK", status="PROPOSED", owner="Tom")
#     db_session.add(need)
#     db_session.commit()
#
#     response = client.get("/needs/?area=MCK&status=PROPOSED&owner=Tom", headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 200
#     assert len(response.json()) >= 1
#
# def test_get_need(client, db_session, auth_token):
#     from app.db.models.need import Need
#     from app.utils.id_generator import generate_artifact_id
#
#     aid = generate_artifact_id(db_session, Need, "MCK")
#     need = Need(
#         aid=aid,
#         title="Test Need",
#         description="Test",
#         area="MCK",
#         status="PROPOSED",
#         owner="rathbun"
#     )
#     db_session.add(need)
#     db_session.commit()
#
#     response = client.get(f"/needs/{aid}", headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 200
#     data = response.json()
#     assert data["aid"] == aid
#     assert data["title"] == "Test Need"
#
# def test_get_need_not_found(client, auth_token):
#     response = client.get("/needs/invalid", headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 404
#
# def test_create_need(client, db_session, auth_token):
#     payload = {"area": "MCK", "description": "Test"}
#     response = client.post("/needs/", json=payload, headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 201
#     assert "aid" in response.json()
#
# def test_update_need(client, db_session, auth_token):
#     from app.db.models.need import Need
#     from app.utils.id_generator import generate_artifact_id
#
#     aid = generate_artifact_id(db_session, Need, "MCK")
#     need = Need(aid=aid, title="Old", description="Old", area="MCK", status="PROPOSED")
#     db_session.add(need)
#     db_session.commit()
#
#     response = client.put(f"/needs/{aid}", json={"description": "New"}, headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 200
#     assert response.json()["description"] == "New"
#
# def test_update_need_not_found(client, auth_token):
#     response = client.put("/needs/invalid", json={}, headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 404
#
# def test_delete_need(client, db_session, auth_token):
#     from app.db.models.need import Need
#     from app.utils.id_generator import generate_artifact_id
#
#     aid = generate_artifact_id(db_session, Need, "MCK")
#     need = Need(aid=aid, title="Test", description="Test", area="MCK", status="PROPOSED")
#     db_session.add(need)
#     db_session.commit()
#
#     response = client.delete(f"/needs/{aid}", headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 204
#     get_res = client.get(f"/needs/{aid}", headers={"Authorization": f"Bearer {auth_token}"})
#     assert get_res.status_code == 404
#
# def test_delete_need_not_found(client, auth_token):
#     response = client.delete("/needs/invalid", headers={"Authorization": f"Bearer {auth_token}"})
#     assert response.status_code == 404