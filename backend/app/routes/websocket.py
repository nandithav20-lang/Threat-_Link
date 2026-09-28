import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket import ws_manager
from app.core.security import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket Stream"])

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    Real-time WebSocket endpoint for broadcasting threat alerts, banking fraud events,
    AI investigation updates, and blockchain evidence anchors.
    """
    user_info = None
    if token:
        payload = decode_access_token(token)
        if payload:
            user_info = {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role")
            }

    await ws_manager.connect(websocket)
    
    # Send initial connection handshake
    await ws_manager.send_personal_message({
        "event_type": "SYSTEM_HANDSHAKE",
        "status": "CONNECTED",
        "message": "Connected to ThreatLink AI Real-Time Alert Stream",
        "user": user_info
    }, websocket)

    try:
        while True:
            # Wait for client incoming messages (heartbeats, filter commands)
            data = await websocket.receive_text()
            if data == "ping":
                await ws_manager.send_personal_message({"event_type": "PONG", "status": "OK"}, websocket)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        ws_manager.disconnect(websocket)
