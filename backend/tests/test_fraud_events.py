from fastapi.testclient import TestClient
from app.main import app

def test_create_and_manage_fraud_event():
    with TestClient(app) as client:
        # 1. Create Fraud Event
        payload = {
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "unusual_transaction",
            "transaction_id": "TXN-SIM-001",
            "amount": 85000.0,
            "currency": "INR",
            "device_id": "DEVICE-SIM-001",
            "ip_address": "192.0.2.10",
            "wallet_id": "WALLET-SIM-001",
            "description": "Simulated unusual transaction from a newly observed device.",
            "severity": "high",
            "status": "new"
        }
        res_create = client.post("/api/v1/fraud-events", json=payload)
        assert res_create.status_code == 201
        data_create = res_create.json()
        assert data_create["success"] is True
        fraud_id = data_create["data"]["id"]
        assert fraud_id.startswith("FRAUD-")

        # 2. Get All Fraud Events
        res_all = client.get("/api/v1/fraud-events")
        assert res_all.status_code == 200
        data_all = res_all.json()
        assert data_all["success"] is True
        assert isinstance(data_all["data"], list)
        assert len(data_all["data"]) >= 1

        # 3. Get Single Fraud Event
        res_one = client.get(f"/api/v1/fraud-events/{fraud_id}")
        assert res_one.status_code == 200
        data_one = res_one.json()
        assert data_one["success"] is True
        assert data_one["data"]["id"] == fraud_id
        assert data_one["data"]["amount"] == 85000.0

        # 4. Update Fraud Event
        update_payload = {
            "severity": "critical",
            "status": "reviewing"
        }
        res_update = client.put(f"/api/v1/fraud-events/{fraud_id}", json=update_payload)
        assert res_update.status_code == 200
        data_update = res_update.json()
        assert data_update["success"] is True
        assert data_update["data"]["severity"] == "critical"
        assert data_update["data"]["status"] == "reviewing"

        # 5. Delete Fraud Event
        res_delete = client.delete(f"/api/v1/fraud-events/{fraud_id}")
        assert res_delete.status_code == 200
        data_delete = res_delete.json()
        assert data_delete["success"] is True

        # 6. Verify 404 after deletion
        res_404 = client.get(f"/api/v1/fraud-events/{fraud_id}")
        assert res_404.status_code == 404

def test_fraud_event_validation_errors():
    with TestClient(app) as client:
        # Invalid Event Type
        bad_type = {
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "invalid_event_type",
            "description": "Test",
            "severity": "high",
            "status": "new"
        }
        res1 = client.post("/api/v1/fraud-events", json=bad_type)
        assert res1.status_code == 422

        # Invalid Severity
        bad_severity = {
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "suspicious_login",
            "description": "Test",
            "severity": "invalid_severity",
            "status": "new"
        }
        res2 = client.post("/api/v1/fraud-events", json=bad_severity)
        assert res2.status_code == 422

        # Invalid Status
        bad_status = {
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "suspicious_login",
            "description": "Test",
            "severity": "high",
            "status": "invalid_status"
        }
        res3 = client.post("/api/v1/fraud-events", json=bad_status)
        assert res3.status_code == 422

        # Negative Amount
        bad_amount = {
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "unusual_transaction",
            "amount": -500.0,
            "description": "Test",
            "severity": "high",
            "status": "new"
        }
        res4 = client.post("/api/v1/fraud-events", json=bad_amount)
        assert res4.status_code == 422

def test_fraud_event_not_found_errors():
    with TestClient(app) as client:
        non_existent_id = "FRAUD-99999"

        res_get = client.get(f"/api/v1/fraud-events/{non_existent_id}")
        assert res_get.status_code == 404

        res_put = client.put(f"/api/v1/fraud-events/{non_existent_id}", json={"severity": "low"})
        assert res_put.status_code == 404

        res_del = client.delete(f"/api/v1/fraud-events/{non_existent_id}")
        assert res_del.status_code == 404
