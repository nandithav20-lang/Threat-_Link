import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.config.risk_config import get_risk_level_from_score
from app.services.risk_service import RiskService

client = TestClient(app)

def test_risk_level_thresholds():
    assert get_risk_level_from_score(0) == "LOW"
    assert get_risk_level_from_score(24) == "LOW"
    assert get_risk_level_from_score(25) == "MEDIUM"
    assert get_risk_level_from_score(49) == "MEDIUM"
    assert get_risk_level_from_score(50) == "HIGH"
    assert get_risk_level_from_score(74) == "HIGH"
    assert get_risk_level_from_score(75) == "CRITICAL"
    assert get_risk_level_from_score(100) == "CRITICAL"

def test_threat_score_calculation():
    assert RiskService.calculate_threat_score([]) == 0
    assert RiskService.calculate_threat_score([{"severity": "low"}]) == 5
    assert RiskService.calculate_threat_score([{"severity": "medium"}]) == 10
    assert RiskService.calculate_threat_score([{"severity": "high"}]) == 15
    assert RiskService.calculate_threat_score([{"severity": "critical"}]) == 20

def test_dark_web_score_calculation():
    assert RiskService.calculate_dark_web_score([], []) == 0
    assert RiskService.calculate_dark_web_score([{"id": "DWI-001"}], []) == 10
    assert RiskService.calculate_dark_web_score(
        [{"id": "DWI-001"}],
        [{"status": "supported"}]
    ) == 20

def test_fraud_score_calculation():
    assert RiskService.calculate_fraud_score([]) == 0
    assert RiskService.calculate_fraud_score([{"severity": "low"}]) == 5
    assert RiskService.calculate_fraud_score([{"severity": "medium"}]) == 12
    assert RiskService.calculate_fraud_score([{"severity": "high"}]) == 18
    assert RiskService.calculate_fraud_score([{"severity": "critical"}]) == 25

def test_correlation_score_calculation():
    assert RiskService.calculate_correlation_score([]) == 0
    assert RiskService.calculate_correlation_score([1]) == 5
    assert RiskService.calculate_correlation_score([1, 2]) == 10
    assert RiskService.calculate_correlation_score([1, 2, 3]) == 15
    assert RiskService.calculate_correlation_score([1, 2, 3, 4]) == 20
    assert RiskService.calculate_correlation_score([1, 2, 3, 4, 5, 6]) == 20

def test_verification_score_calculation():
    assert RiskService.calculate_verification_score([]) == 0
    assert RiskService.calculate_verification_score([{"status": "insufficient_evidence"}]) == 0
    assert RiskService.calculate_verification_score([{"status": "partially_supported"}]) == 7
    assert RiskService.calculate_verification_score([{"status": "supported"}]) == 15

def test_calculate_and_save_risk():
    with patch("app.services.risk_service.run_ai_pipeline", return_value={"verification_results": []}):
        res = RiskService.calculate_and_save_risk("INC-TEST-001")
        assert res.incident_id == "INC-TEST-001"
        assert 0 <= res.risk_score <= 100
        assert res.risk_level in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

def test_risk_api_endpoints():
    with patch("app.services.risk_service.run_ai_pipeline", return_value={"verification_results": []}):
        # POST /calculate
        response_post = client.post("/api/v1/risk/calculate", json={"incident_id": "INC-TEST-999"})
        assert response_post.status_code == 200
        data_post = response_post.json()
        assert data_post["success"] is True
        assert data_post["data"]["incident_id"] == "INC-TEST-999"

        # GET /{incident_id}
        response_get = client.get("/api/v1/risk/INC-TEST-999")
        assert response_get.status_code == 200
        data_get = response_get.json()
        assert data_get["success"] is True
        assert data_get["data"]["incident_id"] == "INC-TEST-999"
