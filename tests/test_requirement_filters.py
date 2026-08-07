"""Requirement list filters on flat routes."""


def test_requirement_filter_by_project(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    client.post(
        "/api/v1/requirements/",
        headers=auth_headers,
        json={
            "short_name": "R1",
            "text": "The system shall A.",
            "project_id": project_id,
            "level": "sys",
            "ears_type": "ubiquitous",
        },
    )
    listed = client.get(
        f"/api/v1/requirements/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(r["short_name"] == "R1" for r in listed.json())
