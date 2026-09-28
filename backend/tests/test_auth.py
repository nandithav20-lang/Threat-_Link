import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

TEST_USER = {
    "name": "Test Investigator",
    "email": "test.investigator@example.test",
    "password": "StrongPassword123"
}

def test_auth_register_success():
    response = client.post("/api/v1/auth/register", json=TEST_USER)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Registration successful"
    assert "user" in data["data"]
    assert data["data"]["user"]["email"] == TEST_USER["email"]
    assert data["data"]["user"]["role"] == "INVESTIGATOR"
    assert "password" not in data["data"]["user"]
    assert "password_hash" not in data["data"]["user"]

def test_auth_register_duplicate_email():
    # Attempt to register same email again
    response = client.post("/api/v1/auth/register", json=TEST_USER)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "EMAIL_ALREADY_EXISTS"

def test_auth_register_short_password():
    payload = {
        "name": "Short Pass User",
        "email": "short@example.test",
        "password": "123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code in (400, 422)

def test_auth_login_success():
    payload = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert data["data"]["user"]["email"] == TEST_USER["email"]

def test_auth_login_wrong_password():
    payload = {
        "email": TEST_USER["email"],
        "password": "WrongPassword999"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False

def test_auth_login_unknown_email():
    payload = {
        "email": "nonexistent@example.test",
        "password": "SomePassword123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False

def test_auth_me_valid_token():
    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    token = login_res.json()["data"]["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == TEST_USER["email"]

def test_auth_me_no_token():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_auth_me_invalid_token():
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token_12345"}
    )
    assert response.status_code == 401

def test_protected_route_unauthorized():
    response = client.get("/api/v1/incidents")
    assert response.status_code == 401

def test_protected_route_authorized():
    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    })
    token = login_res.json()["data"]["access_token"]

    response = client.get(
        "/api/v1/incidents",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
