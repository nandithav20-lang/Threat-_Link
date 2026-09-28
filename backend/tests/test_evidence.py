import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.evidence_service import EvidenceService
from app.schemas.evidence import EvidenceCreate

client = TestClient(app)

def test_create_evidence():
    payload = {
        "incident_id": "INC-DEMO-001",
        "evidence_type": "FRAUD",
        "source_id": "FRAUD-001",
        "description": "Synthetic fraud event evidence.",
        "content": "Event ID: FRAUD-001 | Amount: ₹50,000"
    }
    response = client.post("/api/v1/evidence", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["evidence_type"] == "FRAUD"
    assert len(data["data"]["sha256_hash"]) == 64

def test_get_evidence():
    payload = EvidenceCreate(
        incident_id="INC-DEMO-001",
        evidence_type="DARK_WEB",
        source_id="DWI-001",
        description="Dark Web indicator match.",
        content="Indicator: emp@company.com"
    )
    evd = EvidenceService.create_evidence(payload)
    
    response = client.get(f"/api/v1/evidence/{evd.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == evd.id

def test_get_incident_evidence():
    response = client.get("/api/v1/incidents/INC-DEMO-001/evidence")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)

def test_verify_evidence_success():
    payload = EvidenceCreate(
        incident_id="INC-DEMO-001",
        evidence_type="RISK",
        source_id="RISK-001",
        description="Risk evaluation evidence.",
        content="Risk Score: 72 | Level: HIGH"
    )
    evd = EvidenceService.create_evidence(payload)

    response = client.post(f"/api/v1/evidence/{evd.id}/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["integrity_status"] == "VERIFIED"
    assert data["data"]["stored_hash"] == data["data"]["current_hash"]

def test_verify_evidence_modified():
    payload = EvidenceCreate(
        incident_id="INC-DEMO-001",
        evidence_type="INVESTIGATION",
        source_id="INV-001",
        description="Investigation summary.",
        content="Original Summary"
    )
    evd = EvidenceService.create_evidence(payload)

    # Mutate content manually for test verification
    from app.services.evidence_service import _in_memory_evidence
    if evd.id in _in_memory_evidence:
        _in_memory_evidence[evd.id]["content"] = "Tampered Summary Content"

    response = client.post(f"/api/v1/evidence/{evd.id}/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["integrity_status"] == "MODIFIED"
    assert data["data"]["stored_hash"] != data["data"]["current_hash"]

def test_invalid_evidence_id():
    response = client.get("/api/v1/evidence/EVD-INVALID-999")
    assert response.status_code == 404
