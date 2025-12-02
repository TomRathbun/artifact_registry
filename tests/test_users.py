def test_create_user(client):
    payload = {"id": "testuser@example.com"}  # Assuming UserCreate has 'id' (email?)
    response = client.post("/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == "testuser@example.com"

def test_create_user_duplicate(client):
    payload = {"id": "testuser@example.com"}
    client.post("/", json=payload)  # First create
    response = client.post("/", json=payload)  # Duplicate
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]