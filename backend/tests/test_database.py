from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.services.database_service import DatabaseService

client = TestClient(app)

def test_database_config():
    assert settings.MONGODB_URL is not None
    assert settings.DATABASE_NAME == "threatlink_ai"

def test_database_service_ping():
    connected = DatabaseService.is_connected()
    assert isinstance(connected, bool)

def test_database_health_endpoint():
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/health/database")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "data" in data
        assert data["data"]["database"] == "threatlink_ai"
        assert data["data"]["status"] in ["connected", "disconnected"]

def test_health_with_database_status():
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "data" in data
        assert "database" in data["data"]
