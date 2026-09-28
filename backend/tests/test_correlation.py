from fastapi.testclient import TestClient
from app.main import app

def test_correlation_engine_full_flow():
    with TestClient(app) as client:
        # 1. Seed Dark Web Indicator with entity EMP001
        dw_payload = {
            "indicator": "employee001@example.test",
            "indicator_type": "credential_exposure",
            "source": "Simulated Feed",
            "related_entity": "EMP001",
            "description": "Exposed credentials",
            "severity": "high",
            "status": "new"
        }
        res_dw = client.post("/api/v1/dark-web", json=dw_payload)
        assert res_dw.status_code == 201

        # 2. Seed Fraud Event 1 with entity EMP001, account ACC-SIM-001, device DEVICE-SIM-001
        fr1_payload = {
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "unusual_transaction",
            "transaction_id": "TXN-SIM-001",
            "amount": 85000.0,
            "currency": "INR",
            "device_id": "DEVICE-SIM-001",
            "ip_address": "192.0.2.10",
            "wallet_id": "WALLET-SIM-001",
            "description": "Unusual transfer EMP001",
            "severity": "high",
            "status": "new"
        }
        res_fr1 = client.post("/api/v1/fraud-events", json=fr1_payload)
        assert res_fr1.status_code == 201

        # 3. Seed Fraud Event 2 with matching account ACC-SIM-001
        fr2_payload = {
            "entity_id": "EMP002",
            "account_id": "ACC-SIM-001",
            "event_type": "suspicious_login",
            "amount": 0.0,
            "currency": "INR",
            "description": "Suspicious login on same account",
            "severity": "medium",
            "status": "new"
        }
        res_fr2 = client.post("/api/v1/fraud-events", json=fr2_payload)
        assert res_fr2.status_code == 201

        # 4. Seed Fraud Event 3 with matching device DEVICE-SIM-001
        fr3_payload = {
            "entity_id": "EMP003",
            "account_id": "ACC-SIM-003",
            "event_type": "new_device",
            "device_id": "DEVICE-SIM-001",
            "amount": 0.0,
            "currency": "INR",
            "description": "New device login matching DEVICE-SIM-001",
            "severity": "medium",
            "status": "new"
        }
        res_fr3 = client.post("/api/v1/fraud-events", json=fr3_payload)
        assert res_fr3.status_code == 201

        # 5. Run Correlation Engine
        res_run = client.post("/api/v1/correlation/run")
        assert res_run.status_code == 200
        data_run = res_run.json()
        assert data_run["success"] is True
        created_count = data_run["data"]["relationships_created"]
        assert created_count >= 3  # Entity, Account, Device matches

        # 6. Test Duplicate Prevention (Run correlation again)
        res_run2 = client.post("/api/v1/correlation/run")
        assert res_run2.status_code == 200
        assert res_run2.json()["data"]["relationships_created"] == 0

        # 7. Get All Relationships
        res_rels = client.get("/api/v1/correlation/relationships")
        assert res_rels.status_code == 200
        data_rels = res_rels.json()
        assert data_rels["success"] is True
        assert len(data_rels["data"]) >= 3

        # 8. Get Relationships for Entity EMP001
        res_emp = client.get("/api/v1/correlation/entity/EMP001")
        assert res_emp.status_code == 200
        data_emp = res_emp.json()
        assert data_emp["success"] is True
        assert len(data_emp["data"]) >= 1
