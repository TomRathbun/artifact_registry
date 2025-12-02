# tests/test_requirement.py
from fastapi import status

# -------------------------------------------------
#  GET – list (already covered, keep existing tests)
# -------------------------------------------------

def test_get_requirement(client):
    # create one first
    payload = {"area": "MCK", "text": "Test requirement"}
    create_res = client.post("/requirements/", json=payload)
    aid = create_res.json()["aid"]

    response = client.get(f"/requirements/{aid}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["aid"] == aid
    assert data["text"] == "Test requirement"


def test_get_requirement_not_found(client):
    response = client.get("/requirements/INVALID-AID")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Requirement not found" in response.json()["detail"]


def test_delete_requirement(client):
    # create
    payload = {"area": "MCK", "text": "Delete me"}
    create_res = client.post("/requirements/", json=payload)
    aid = create_res.json()["aid"]

    # delete
    del_res = client.delete(f"/requirements/{aid}")
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # verify gone
    get_res = client.get(f"/requirements/{aid}")
    assert get_res.status_code == status.HTTP_404_NOT_FOUND


def test_delete_requirement_not_found(client):
    response = client.delete("/requirements/INVALID-AID")
    assert response.status_code == status.HTTP_404_NOT_FOUND