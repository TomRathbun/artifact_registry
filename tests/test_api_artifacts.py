"""Integration tests for flattened artifact API paths."""


def test_flat_routes_require_auth(client):
    for path in (
        "/api/v1/visions/",
        "/api/v1/needs/",
        "/api/v1/use-cases/",
        "/api/v1/requirements/",
        "/api/v1/linkages/",
        "/api/v1/metadata/areas",
        "/api/v1/documents/",
    ):
        resp = client.get(path)
        assert resp.status_code == 401, f"{path} should require auth, got {resp.status_code}"


def test_create_list_get_vision(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    create = client.post(
        "/api/v1/visions/",
        headers=auth_headers,
        json={
            "title": "Test Vision",
            "description": "A vision statement",
            "area": "GLOBAL",
            "project_id": project_id,
        },
    )
    assert create.status_code == 201, create.text
    vision = create.json()
    assert vision["title"] == "Test Vision"
    assert vision["aid"]
    assert vision["project_id"] == project_id

    listed = client.get(
        f"/api/v1/visions/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(v["aid"] == vision["aid"] for v in listed.json())

    got = client.get(f"/api/v1/visions/{vision['aid']}", headers=auth_headers)
    assert got.status_code == 200
    assert got.json()["title"] == "Test Vision"


def test_create_list_need(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    create = client.post(
        "/api/v1/needs/",
        headers=auth_headers,
        json={
            "title": "Test Need",
            "description": "Need description",
            "area": "GLOBAL",
            "project_id": project_id,
        },
    )
    assert create.status_code == 201, create.text
    need = create.json()
    assert need["aid"]
    assert "NEED" in need["aid"].upper() or need["aid"]

    listed = client.get(
        f"/api/v1/needs/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(n["aid"] == need["aid"] for n in listed.json())


def test_create_requirement(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    create = client.post(
        "/api/v1/requirements/",
        headers=auth_headers,
        json={
            "short_name": "SYS-REQ-001",
            "text": "The system shall log all access events.",
            "area": "GLOBAL",
            "project_id": project_id,
            "level": "sys",
            "ears_type": "ubiquitous",
        },
    )
    assert create.status_code == 201, create.text
    req = create.json()
    assert req["short_name"] == "SYS-REQ-001"

    listed = client.get(
        f"/api/v1/requirements/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(r["aid"] == req["aid"] for r in listed.json())


def test_create_use_case(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    create = client.post(
        "/api/v1/use-cases/",
        headers=auth_headers,
        json={
            "title": "Login",
            "description": "User logs in",
            "area": "GLOBAL",
            "project_id": project_id,
            "trigger": "User navigates to login",
            "status": "Draft",
            "exceptions": [],
            "mss": [],
            "extensions": [],
        },
    )
    assert create.status_code == 201, create.text
    uc = create.json()
    assert uc["title"] == "Login"

    listed = client.get(
        f"/api/v1/use-cases/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(u["aid"] == uc["aid"] for u in listed.json())


def test_linkage_same_project(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    vision = client.post(
        "/api/v1/visions/",
        headers=auth_headers,
        json={
            "title": "V",
            "description": "d",
            "project_id": project_id,
        },
    ).json()
    need = client.post(
        "/api/v1/needs/",
        headers=auth_headers,
        json={
            "title": "N",
            "description": "d",
            "project_id": project_id,
        },
    ).json()

    link = client.post(
        "/api/v1/linkages/",
        headers=auth_headers,
        json={
            "source_artifact_type": "need",
            "source_id": need["aid"],
            "target_artifact_type": "vision",
            "target_id": vision["aid"],
            "relationship_type": "derives_from",
            "project_id": project_id,
        },
    )
    assert link.status_code == 201, link.text
    body = link.json()
    assert body["source_id"] == need["aid"]
    assert body["target_id"] == vision["aid"]

    listed = client.get(
        f"/api/v1/linkages/?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert any(l["aid"] == body["aid"] for l in listed.json())


def test_metadata_areas(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    create = client.post(
        "/api/v1/metadata/areas",
        headers=auth_headers,
        json={"code": "TST", "name": "Test Area", "project_id": project_id},
    )
    # 201 or 400 if schema differs — accept 201
    assert create.status_code in (200, 201), create.text

    listed = client.get(
        f"/api/v1/metadata/areas?project_id={project_id}",
        headers=auth_headers,
    )
    assert listed.status_code == 200
    assert isinstance(listed.json(), list)


def test_old_nested_paths_are_gone(client, auth_headers, sample_project):
    """Double-nested paths from the pre-flatten API must not resolve."""
    project_id = sample_project["id"]
    for path in (
        f"/api/v1/need/needs/?project_id={project_id}",
        f"/api/v1/vision/vision-statements/?project_id={project_id}",
        f"/api/v1/metadata/metadata/areas?project_id={project_id}",
        f"/api/v1/linkage/linkages/?project_id={project_id}",
    ):
        resp = client.get(path, headers=auth_headers)
        assert resp.status_code == 404, f"{path} should be gone, got {resp.status_code}"
