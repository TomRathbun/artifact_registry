"""Need CRUD against flat /api/v1/needs routes (replaces stale suite)."""


def test_need_crud_lifecycle(client, auth_headers, sample_project):
    project_id = sample_project["id"]

    # Create
    created = client.post(
        "/api/v1/needs/",
        headers=auth_headers,
        json={
            "title": "Capability Need",
            "description": "System must support X",
            "area": "GLOBAL",
            "project_id": project_id,
            "status": "Draft",
        },
    )
    assert created.status_code == 201, created.text
    need = created.json()
    aid = need["aid"]

    # Read
    got = client.get(f"/api/v1/needs/{aid}", headers=auth_headers)
    assert got.status_code == 200
    assert got.json()["title"] == "Capability Need"

    # Update
    updated = client.put(
        f"/api/v1/needs/{aid}",
        headers=auth_headers,
        json={
            "title": "Capability Need Updated",
            "description": "Updated description",
            "area": "GLOBAL",
            "project_id": project_id,
        },
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["title"] == "Capability Need Updated"

    # Delete
    deleted = client.delete(f"/api/v1/needs/{aid}", headers=auth_headers)
    assert deleted.status_code == 204

    missing = client.get(f"/api/v1/needs/{aid}", headers=auth_headers)
    assert missing.status_code == 404
