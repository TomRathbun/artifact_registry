"""Need list filters on flat routes."""


def test_need_filter_by_project(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    other = client.post(
        "/api/v1/projects/",
        headers=auth_headers,
        json={"name": "Other Project", "description": ""},
    ).json()

    client.post(
        "/api/v1/needs/",
        headers=auth_headers,
        json={
            "title": "In A",
            "description": "a",
            "project_id": project_id,
        },
    )
    client.post(
        "/api/v1/needs/",
        headers=auth_headers,
        json={
            "title": "In B",
            "description": "b",
            "project_id": other["id"],
        },
    )

    only_a = client.get(
        f"/api/v1/needs/?project_id={project_id}",
        headers=auth_headers,
    ).json()
    titles = {n["title"] for n in only_a}
    assert "In A" in titles
    assert "In B" not in titles
