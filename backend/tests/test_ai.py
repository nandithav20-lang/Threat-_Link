import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.ai.state import AIState
from app.ai.agents.collector import CollectorAgent
from app.ai.agents.analyzer import AnalyzerAgent
from app.ai.agents.verifier import VerifierAgent
from app.ai.agents.fraud_analyzer import FraudAnalyzerAgent
from app.ai.agents.correlation_analyzer import CorrelationAnalyzerAgent
from app.ai.pipeline import run_ai_pipeline

client = TestClient(app)

def test_collector_agent():
    state = AIState()
    collector = CollectorAgent()
    res = collector.run(state)
    assert isinstance(res, dict)
    assert "threats" in res
    assert "dark_web_indicators" in res
    assert "fraud_events" in res
    assert "relationships" in res

def test_analyzer_agent_rule_fallback():
    state = AIState()
    state.dark_web_indicators = [{
        "id": "DWI-001",
        "indicator_type": "credential_exposure",
        "indicator": "emp@company.com",
        "related_entity": "EMP001",
        "severity": "high"
    }]
    
    with patch("app.ai.agents.analyzer.call_llm", return_value=None):
        analyzer = AnalyzerAgent()
        findings = analyzer.run(state)
        assert len(findings) >= 1
        assert findings[0]["entity"] == "EMP001"
        assert findings[0]["severity"] == "high"

def test_verifier_agent():
    state = AIState()
    state.analysis_results = [{
        "type": "credential_exposure",
        "entity": "EMP001",
        "severity": "high",
        "observation": "Test obs"
    }]
    state.fraud_events = [{
        "id": "FRAUD-001",
        "entity_id": "EMP001"
    }]
    state.relationships = [{
        "source_id": "DWI-001",
        "target_id": "FRAUD-001",
        "matched_field": "entity_id"
    }]

    with patch("app.ai.agents.verifier.call_llm", return_value=None):
        verifier = VerifierAgent()
        results = verifier.run(state)
        assert len(results) == 1
        assert results[0]["status"] == "supported"

def test_fraud_analyzer_agent():
    state = AIState()
    state.fraud_events = [{
        "id": "FRAUD-001",
        "event_type": "unusual_transaction",
        "severity": "high",
        "amount": 50000,
        "device_id": "DEVICE-SIM-001"
    }]

    with patch("app.ai.agents.fraud_analyzer.call_llm", return_value=None):
        agent = FraudAnalyzerAgent()
        results = agent.run(state)
        assert len(results) == 1
        assert results[0]["event_id"] == "FRAUD-001"
        assert "device_id" in results[0]["evidence"]

def test_correlation_analyzer_agent():
    state = AIState()
    state.relationships = [{
        "source_id": "DWI-001",
        "target_id": "FRAUD-001",
        "relationship_type": "same_entity",
        "matched_field": "entity_id"
    }]

    with patch("app.ai.agents.correlation_analyzer.call_llm", return_value=None):
        agent = CorrelationAnalyzerAgent()
        results = agent.run(state)
        assert len(results) == 1
        assert results[0]["source"] == "DWI-001"
        assert results[0]["target"] == "FRAUD-001"
        assert results[0]["relationship"] == "same_entity"

def test_ai_pipeline_execution():
    with patch("app.ai.agents.analyzer.call_llm", return_value=None), \
         patch("app.ai.agents.verifier.call_llm", return_value=None), \
         patch("app.ai.agents.fraud_analyzer.call_llm", return_value=None), \
         patch("app.ai.agents.correlation_analyzer.call_llm", return_value=None):
        result = run_ai_pipeline()
        assert "analysis_results" in result
        assert "verification_results" in result
        assert "fraud_results" in result
        assert "correlation_results" in result

def test_ai_api_endpoint():
    with patch("app.ai.agents.analyzer.call_llm", return_value=None), \
         patch("app.ai.agents.verifier.call_llm", return_value=None), \
         patch("app.ai.agents.fraud_analyzer.call_llm", return_value=None), \
         patch("app.ai.agents.correlation_analyzer.call_llm", return_value=None):
        response = client.post("/api/v1/ai/analyze")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "AI analysis completed successfully"
        assert "analysis_results" in data["data"]
        assert "verification_results" in data["data"]

def test_ai_api_error_handling():
    with patch("app.routes.ai.run_ai_pipeline", side_effect=Exception("Pipeline Timeout Error")):
        response = client.post("/api/v1/ai/analyze")
        assert response.status_code == 500
        data = response.json()
        assert data["detail"] == "AI analysis service is currently unavailable."

