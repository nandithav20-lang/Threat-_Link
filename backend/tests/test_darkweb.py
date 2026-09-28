from fastapi.testclient import TestClient
from app.main import app

def test_create_and_manage_darkweb_indicator():
    with TestClient(app) as client:
        # 1. Create Dark Web Indicator
        payload = {
            "indicator": "employee001@example.test",
            "indicator_type": "credential_exposure",
            "source": "Simulated Dark Web Feed",
            "related_entity": "EMP001",
            "description": "Simulated credential exposure associated with EMP001.",
            "severity": "high",
            "status": "new"
        }
        res_create = client.post("/api/v1/dark-web", json=payload)
        assert res_create.status_code == 201
        data_create = res_create.json()
        assert data_create["success"] is True
        indicator_id = data_create["data"]["id"]
        assert indicator_id.startswith("DWI-")

        # 2. Get All Dark Web Indicators
        res_all = client.get("/api/v1/dark-web")
        assert res_all.status_code == 200
        data_all = res_all.json()
        assert data_all["success"] is True
        assert isinstance(data_all["data"], list)
        assert len(data_all["data"]) >= 1

        # 3. Get Single Dark Web Indicator
        res_one = client.get(f"/api/v1/dark-web/{indicator_id}")
        assert res_one.status_code == 200
        data_one = res_one.json()
        assert data_one["success"] is True
        assert data_one["data"]["id"] == indicator_id

        # 4. Update Dark Web Indicator
        update_payload = {
            "severity": "critical",
            "status": "investigating"
        }
        res_update = client.put(f"/api/v1/dark-web/{indicator_id}", json=update_payload)
        assert res_update.status_code == 200
        data_update = res_update.json()
        assert data_update["success"] is True
        assert data_update["data"]["severity"] == "critical"
        assert data_update["data"]["status"] == "investigating"

        # 5. Delete Dark Web Indicator
        res_delete = client.delete(f"/api/v1/dark-web/{indicator_id}")
        assert res_delete.status_code == 200
        data_delete = res_delete.json()
        assert data_delete["success"] is True

        # 6. Verify 404 after deletion
        res_404 = client.get(f"/api/v1/dark-web/{indicator_id}")
        assert res_404.status_code == 404

def test_darkweb_validation_errors():
    with TestClient(app) as client:
        # Invalid Indicator Type
        bad_type = {
            "indicator": "employee001@example.test",
            "indicator_type": "invalid_darkweb_type",
            "source": "Simulated Feed",
            "related_entity": "EMP001",
            "description": "Test",
            "severity": "high",
            "status": "new"
        }
        res1 = client.post("/api/v1/dark-web", json=bad_type)
        assert res1.status_code == 422

        # Invalid Severity
        bad_severity = {
            "indicator": "employee001@example.test",
            "indicator_type": "email",
            "source": "Simulated Feed",
            "related_entity": "EMP001",
            "description": "Test",
            "severity": "extreme_danger",
            "status": "new"
        }
        res2 = client.post("/api/v1/dark-web", json=bad_severity)
        assert res2.status_code == 422

        # Invalid Status
        bad_status = {
            "indicator": "employee001@example.test",
            "indicator_type": "email",
            "source": "Simulated Feed",
            "related_entity": "EMP001",
            "description": "Test",
            "severity": "high",
            "status": "invalid_status"
        }
        res3 = client.post("/api/v1/dark-web", json=bad_status)
        assert res3.status_code == 422

def test_darkweb_not_found_errors():
    with TestClient(app) as client:
        non_existent_id = "DWI-99999"

        res_get = client.get(f"/api/v1/dark-web/{non_existent_id}")
        assert res_get.status_code == 404

        res_put = client.put(f"/api/v1/dark-web/{non_existent_id}", json={"severity": "low"})
        assert res_put.status_code == 404

        res_del = client.delete(f"/api/v1/dark-web/{non_existent_id}")
        assert res_del.status_code == 404
