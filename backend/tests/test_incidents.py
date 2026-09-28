import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_incidents():
    response = client.get("/api/v1/incidents")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1

def test_create_incident():
    payload = {
        "title": "Suspicious Account Access - EMP002",
        "description": "Anomalous IP logins and credential dump correlation."
    }
    response = client.post("/api/v1/incidents", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"] == payload["title"]
    assert data["data"]["status"] == "OPEN"

def test_get_incident_details():
    response = client.get("/api/v1/incidents/INC-DEMO-001")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == "INC-DEMO-001"

def test_update_incident_status():
    response = client.patch(
        "/api/v1/incidents/INC-DEMO-001/status",
        json={"status": "IN_PROGRESS"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "IN_PROGRESS"

def test_update_incident_invalid_status():
    response = client.patch(
        "/api/v1/incidents/INC-DEMO-001/status",
        json={"status": "INVALID_STATUS"}
    )
    assert response.status_code == 400
