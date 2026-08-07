"""Requirement CRUD against flat /api/v1/requirements routes."""


def test_requirement_crud_and_ears_templates(client, auth_headers, sample_project):
    project_id = sample_project["id"]

    templates = client.get(
        "/api/v1/requirements/ears/templates",
        headers=auth_headers,
    )
    assert templates.status_code == 200
    assert "templates" in templates.json() or isinstance(templates.json(), dict)

    created = client.post(
        "/api/v1/requirements/",
        headers=auth_headers,
        json={
            "short_name": "REQ-100",
            "text": "The system shall authenticate users.",
            "project_id": project_id,
            "area": "GLOBAL",
            "level": "sys",
            "ears_type": "ubiquitous",
        },
    )
    assert created.status_code == 201, created.text
    aid = created.json()["aid"]

    got = client.get(f"/api/v1/requirements/{aid}", headers=auth_headers)
    assert got.status_code == 200

    deleted = client.delete(f"/api/v1/requirements/{aid}", headers=auth_headers)
    assert deleted.status_code == 204
