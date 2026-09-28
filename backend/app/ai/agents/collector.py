import logging
from typing import Dict, Any
from app.ai.state import AIState
from app.services.threat_service import ThreatService
from app.services.darkweb_service import DarkWebService
from app.services.fraud_event_service import FraudEventService
from app.services.correlation_service import CorrelationService

logger = logging.getLogger("threatlink.ai.collector")

class CollectorAgent:
    def run(self, state: AIState) -> Dict[str, Any]:
        logger.info("Collector Agent started")
        
        threats = ThreatService.get_threats()
        darkweb = DarkWebService.get_indicators()
        fraud = FraudEventService.get_fraud_events()
        relationships = CorrelationService.get_relationships()

        state.threats = [t.model_dump() for t in threats]
        state.dark_web_indicators = [d.model_dump() for d in darkweb]
        state.fraud_events = [f.model_dump() for f in fraud]
        state.relationships = [r.model_dump() for r in relationships]

        logger.info("Collector Agent completed")

        return {
            "threats": len(state.threats),
            "dark_web_indicators": len(state.dark_web_indicators),
            "fraud_events": len(state.fraud_events),
            "relationships": len(state.relationships),
        }
