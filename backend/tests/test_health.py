from fastapi.testclient import TestClient
from app.main import app

def test_root_endpoint():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Welcome to ThreatLink AI API"

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "message" in data
        assert "data" in data
        assert "database" in data["data"]
        assert data["data"]["database"] in ["connected", "disconnected"]
