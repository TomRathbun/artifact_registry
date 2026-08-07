"""Vision CRUD against flat /api/v1/visions routes."""


def test_vision_crud_lifecycle(client, auth_headers, sample_project):
    project_id = sample_project["id"]

    created = client.post(
        "/api/v1/visions/",
        headers=auth_headers,
        json={
            "title": "Enterprise Vision",
            "description": "We deliver secure systems",
            "project_id": project_id,
        },
    )
    assert created.status_code == 201, created.text
    vision = created.json()
    aid = vision["aid"]

    listed = client.get(
        f"/api/v1/visions/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert len(listed.json()) >= 1

    updated = client.put(
        f"/api/v1/visions/{aid}",
        headers=auth_headers,
        json={
            "title": "Enterprise Vision v2",
            "description": "Updated",
            "project_id": project_id,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Enterprise Vision v2"

    deleted = client.delete(f"/api/v1/visions/{aid}", headers=auth_headers)
    assert deleted.status_code == 204
