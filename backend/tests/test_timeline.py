import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.timeline_service import TimelineService

client = TestClient(app)

def test_timeline_service_build_and_sort():
    events = TimelineService.build_incident_timeline("INC-DEMO-001")
    assert isinstance(events, list)
    
    # Verify events are sorted chronologically by timestamp
    timestamps = [e.timestamp for e in events]
    assert timestamps == sorted(timestamps)

def test_get_timeline_api():
    response = client.get("/api/v1/incidents/INC-DEMO-001/timeline")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
