import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.blockchain_service import blockchain_service
from app.services.evidence_service import EvidenceService
from app.schemas.evidence import EvidenceCreate

client = TestClient(app)

def test_blockchain_status():
    status = blockchain_service.get_blockchain_status()
    assert status["connected"] is True
    assert status["contract_loaded"] is True
    assert status["contract_address"] is not None

def test_anchor_and_retrieve_blockchain_evidence():
    evd_id = "EVD-TEST-BLK-001"
    evd_hash = "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff"
    evd_type = "FRAUD"

    anchor_res = blockchain_service.anchor_evidence(evd_id, evd_hash, evd_type)
    assert anchor_res["evidence_id"] == evd_id
    assert anchor_res["blockchain_status"] == "ANCHORED"
    assert anchor_res["transaction_hash"].startswith("0x")

    record = blockchain_service.get_blockchain_evidence(evd_id)
    assert record is not None
    assert record["exists"] is True
    assert record["evidence_hash"] == evd_hash
    assert record["evidence_type"] == evd_type

def test_duplicate_anchor_rejection():
    evd_id = "EVD-TEST-DUP-001"
    evd_hash = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
    evd_type = "THREAT"

    blockchain_service.anchor_evidence(evd_id, evd_hash, evd_type)

    with pytest.raises(ValueError, match="already anchored"):
        blockchain_service.anchor_evidence(evd_id, evd_hash, evd_type)

def test_verify_blockchain_evidence_match_and_modified():
    evd_id = "EVD-TEST-VER-001"
    original_hash = "aaaaaa0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
    modified_hash = "bbbbbb0123456789abcdef0123456789abcdef0123456789abcdef0123456789"

    blockchain_service.anchor_evidence(evd_id, original_hash, "RISK")

    # Match check
    res_match = blockchain_service.verify_blockchain_evidence(evd_id, original_hash)
    assert res_match["integrity_status"] == "VERIFIED"
    assert res_match["blockchain_status"] == "ANCHORED"

    # Modified check
    res_mod = blockchain_service.verify_blockchain_evidence(evd_id, modified_hash)
    assert res_mod["integrity_status"] == "MODIFIED"
    assert res_mod["blockchain_status"] == "ANCHORED"

def test_blockchain_status_api_endpoint():
    response = client.get("/api/v1/blockchain/status")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["data"]["connected"] is True
    assert json_data["data"]["contract_loaded"] is True

def test_anchor_api_end_to_end():
    # 1. Create evidence
    create_res = client.post("/api/v1/evidence", json={
        "incident_id": "INC-BLK-TEST",
        "evidence_type": "DARK_WEB",
        "source_id": "DWI-BLK-01",
        "description": "Test dark web credential leak evidence.",
        "content": "Synthetic leak content for blockchain test."
    })
    assert create_res.status_code == 201
    evd_data = create_res.json()["data"]
    evd_id = evd_data["id"]

    # 2. Anchor on blockchain via API
    anchor_res = client.post(f"/api/v1/evidence/{evd_id}/anchor")
    assert anchor_res.status_code == 200
    anchor_json = anchor_res.json()
    assert anchor_json["success"] is True
    assert anchor_json["data"]["blockchain_status"] == "ANCHORED"
    assert anchor_json["data"]["transaction_hash"].startswith("0x")

    # 3. Verify on blockchain via API
    verify_res = client.post(f"/api/v1/evidence/{evd_id}/verify-blockchain")
    assert verify_res.status_code == 200
    verify_json = verify_res.json()
    assert verify_json["success"] is True
    assert verify_json["data"]["integrity_status"] == "VERIFIED"
    assert verify_json["data"]["blockchain_status"] == "ANCHORED"
