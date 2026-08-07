"""Linkage API against flat /api/v1/linkages routes."""


def test_linkage_rejects_missing_artifact(client, auth_headers, sample_project):
    project_id = sample_project["id"]
    resp = client.post(
        "/api/v1/linkages/",
        headers=auth_headers,
        json={
            "source_artifact_type": "need",
            "source_id": "DOES-NOT-EXIST",
            "target_artifact_type": "vision",
            "target_id": "ALSO-MISSING",
            "relationship_type": "derives_from",
            "project_id": project_id,
        },
    )
    assert resp.status_code == 400
