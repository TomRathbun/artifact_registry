def test_create_user(client, auth_headers):
    payload = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "secure-password-1",
        "full_name": "Test User",
        "roles": ["viewer"],
    }
    response = client.post("/api/v1/users/", json=payload, headers=auth_headers)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"


def test_create_user_duplicate(client, auth_headers):
    payload = {
        "username": "dupuser",
        "email": "dup@example.com",
        "password": "secure-password-1",
        "full_name": "Dup User",
        "roles": ["viewer"],
    }
    first = client.post("/api/v1/users/", json=payload, headers=auth_headers)
    assert first.status_code == 201, first.text
    response = client.post("/api/v1/users/", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "already" in response.json()["detail"].lower()


def test_create_user_requires_admin(client):
    # No auth
    response = client.post(
        "/api/v1/users/",
        json={
            "username": "x",
            "email": "x@example.com",
            "password": "secure-password-1",
        },
    )
    assert response.status_code == 401
