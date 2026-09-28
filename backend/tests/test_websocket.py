import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_websocket_alerts_connection():
    client = TestClient(app)
    with client.websocket_connect("/api/v1/ws/alerts") as websocket:
        data = websocket.receive_json()
        assert data["event_type"] == "SYSTEM_HANDSHAKE"
        assert data["status"] == "CONNECTED"

        # Test ping/pong
        websocket.send_text("ping")
        response = websocket.receive_json()
        assert response["event_type"] == "PONG"
        assert response["status"] == "OK"
