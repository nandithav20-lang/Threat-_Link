import asyncio
import random
import logging
from datetime import datetime, timezone
from app.core.websocket import ws_manager

logger = logging.getLogger(__name__)

SIMULATED_ALERTS = [
    {
        "event_type": "DARK_WEB_LEAK",
        "severity": "CRITICAL",
        "title": "Corporate Credentials Found on Dark Web Forum",
        "details": "Stolen database dump detected on BreachForums containing 4,200 employee logins.",
        "source": "BreachForums",
        "target_entity": "FinCorp Global",
        "risk_score": 92
    },
    {
        "event_type": "BANKING_FRAUD",
        "severity": "HIGH",
        "title": "High-Frequency Automated Account Takeover",
        "details": "Multiple rapid wire transfers detected originating from TOR exit nodes.",
        "source": "Core Banking API Gateway",
        "target_entity": "Account #88492019",
        "risk_score": 88
    },
    {
        "event_type": "AI_AGENT_CORRELATION",
        "severity": "CRITICAL",
        "title": "Cross-Domain Threat Correlation Identified",
        "details": "AI Agent linked ransomware wallet address to dark web marketplace vendor 'AlphaMalware'.",
        "source": "ThreatLink AI Multi-Agent Engine",
        "target_entity": "Ransomware Group Alpha",
        "risk_score": 96
    },
    {
        "event_type": "BLOCKCHAIN_ANCHOR",
        "severity": "INFO",
        "title": "Evidence Hash Anchored to EVM Smart Contract",
        "details": "SHA-256 digital forensic evidence successfully locked on-chain in EvidenceRegistry.sol.",
        "source": "EVM EvidenceRegistry Smart Contract",
        "target_entity": "Evidence #EVD-2026-9904",
        "risk_score": 10
    }
]

class AlertStreamService:
    def __init__(self):
        self.is_running = False
        self._task = None

    async def start_stream(self):
        """Start background loop broadcasting live alert notifications."""
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._broadcast_loop())
        logger.info("AlertStreamService background broadcast loop started.")

    async def stop_stream(self):
        """Stop background alert loop."""
        self.is_running = False
        if self._task:
            self._task.cancel()

    async def _broadcast_loop(self):
        while self.is_running:
            await asyncio.sleep(12)  # Emit event every 12 seconds if clients connected
            if ws_manager.active_connections:
                sample_alert = random.choice(SIMULATED_ALERTS).copy()
                sample_alert["id"] = f"ALT-{random.randint(10000, 99999)}"
                sample_alert["timestamp"] = datetime.now(timezone.utc).isoformat()
                await ws_manager.broadcast({
                    "event_type": "LIVE_ALERT",
                    "payload": sample_alert
                })

alert_stream_service = AlertStreamService()
