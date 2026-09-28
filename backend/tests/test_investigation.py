import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_run_investigation():
    with patch("app.services.investigation_service.run_ai_pipeline", return_value={"verification_results": []}):
        response = client.post("/api/v1/investigations/run/INC-DEMO-001")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["incident_id"] == "INC-DEMO-001"
        assert isinstance(data["data"]["key_findings"], list)
        assert len(data["data"]["summary"]) > 0

def test_get_investigation():
    with patch("app.services.investigation_service.run_ai_pipeline", return_value={"verification_results": []}):
        response = client.get("/api/v1/investigations/INC-DEMO-001")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["incident_id"] == "INC-DEMO-001"
