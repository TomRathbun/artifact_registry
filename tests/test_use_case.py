"""Use-case CRUD against flat /api/v1/use-cases routes."""


def test_use_case_crud_lifecycle(client, auth_headers, sample_project):
    project_id = sample_project["id"]

    created = client.post(
        "/api/v1/use-cases/",
        headers=auth_headers,
        json={
            "title": "Export Report",
            "description": "Actor exports a report",
            "project_id": project_id,
            "trigger": "User clicks export",
            "status": "Draft",
            "exceptions": [],
            "mss": [],
            "extensions": [],
        },
    )
    assert created.status_code == 201, created.text
    aid = created.json()["aid"]

    listed = client.get(
        f"/api/v1/use-cases/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(u["aid"] == aid for u in listed.json())

    deleted = client.delete(f"/api/v1/use-cases/{aid}", headers=auth_headers)
    assert deleted.status_code == 204
