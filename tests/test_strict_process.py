"""Ensure unauthenticated write attempts are rejected (default-deny)."""


def test_create_need_requires_auth(client, sample_project):
    # sample_project fixture uses auth; create a project id without reusing headers
    # Use a fake project_id — auth should fail before project validation for unauthenticated
    resp = client.post(
        "/api/v1/needs/",
        json={
            "title": "No Auth",
            "description": "x",
            "project_id": sample_project["id"],
        },
    )
    assert resp.status_code == 401


def test_create_project_requires_admin_or_auth(client):
    resp = client.post(
        "/api/v1/projects/",
        json={"name": "Sneaky", "description": ""},
    )
    assert resp.status_code == 401
