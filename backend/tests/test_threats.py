from fastapi.testclient import TestClient
from app.main import app

def test_create_and_manage_threat():
    with TestClient(app) as client:
        # 1. Create Threat
        payload = {
            "indicator": "test-indicator.example",
            "indicator_type": "domain",
            "source": "UnitTest Suite",
            "description": "Synthetic unit test threat indicator",
            "severity": "high",
            "status": "new"
        }
        res_create = client.post("/api/v1/threats", json=payload)
        assert res_create.status_code == 201
        data_create = res_create.json()
        assert data_create["success"] is True
        threat_data = data_create["data"]
        threat_id = threat_data["id"]
        assert threat_id.startswith("THR-")
        assert threat_data["indicator"] == "test-indicator.example"

        # 2. Get All Threats
        res_all = client.get("/api/v1/threats")
        assert res_all.status_code == 200
        data_all = res_all.json()
        assert data_all["success"] is True
        assert isinstance(data_all["data"], list)
        assert len(data_all["data"]) >= 1

        # 3. Get Single Threat
        res_one = client.get(f"/api/v1/threats/{threat_id}")
        assert res_one.status_code == 200
        data_one = res_one.json()
        assert data_one["success"] is True
        assert data_one["data"]["id"] == threat_id

        # 4. Update Threat
        update_payload = {
            "severity": "critical",
            "status": "investigating"
        }
        res_update = client.put(f"/api/v1/threats/{threat_id}", json=update_payload)
        assert res_update.status_code == 200
        data_update = res_update.json()
        assert data_update["success"] is True
        assert data_update["data"]["severity"] == "critical"
        assert data_update["data"]["status"] == "investigating"

        # 5. Delete Threat
        res_delete = client.delete(f"/api/v1/threats/{threat_id}")
        assert res_delete.status_code == 200
        data_delete = res_delete.json()
        assert data_delete["success"] is True

        # 6. Verify 404 after deletion
        res_404 = client.get(f"/api/v1/threats/{threat_id}")
        assert res_404.status_code == 404

def test_threat_validation_errors():
    with TestClient(app) as client:
        # Invalid Severity
        bad_severity = {
            "indicator": "test.example",
            "indicator_type": "domain",
            "source": "UnitTest",
            "description": "Test",
            "severity": "super_extreme",  # Invalid
            "status": "new"
        }
        res1 = client.post("/api/v1/threats", json=bad_severity)
        assert res1.status_code == 422

        # Invalid Status
        bad_status = {
            "indicator": "test.example",
            "indicator_type": "domain",
            "source": "UnitTest",
            "description": "Test",
            "severity": "high",
            "status": "unknown_status"  # Invalid
        }
        res2 = client.post("/api/v1/threats", json=bad_status)
        assert res2.status_code == 422

        # Invalid Indicator Type
        bad_type = {
            "indicator": "test.example",
            "indicator_type": "invalid_type",  # Invalid
            "source": "UnitTest",
            "description": "Test",
            "severity": "high",
            "status": "new"
        }
        res3 = client.post("/api/v1/threats", json=bad_type)
        assert res3.status_code == 422

def test_threat_not_found_errors():
    with TestClient(app) as client:
        non_existent_id = "THR-99999"
        
        res_get = client.get(f"/api/v1/threats/{non_existent_id}")
        assert res_get.status_code == 404

        res_put = client.put(f"/api/v1/threats/{non_existent_id}", json={"severity": "low"})
        assert res_put.status_code == 404

        res_del = client.delete(f"/api/v1/threats/{non_existent_id}")
        assert res_del.status_code == 404
