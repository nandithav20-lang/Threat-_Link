from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import logging

from app.database import get_database
from app.models.timeline_event import TimelineEventModel
from app.schemas.timeline_event import TimelineEventData
from app.services.threat_service import ThreatService
from app.services.darkweb_service import DarkWebService
from app.services.fraud_event_service import FraudEventService
from app.services.correlation_service import CorrelationService

logger = logging.getLogger("threatlink.services.timeline")

_in_memory_timeline: dict = {}
_in_memory_tl_counter = 0

class TimelineService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[TimelineEventModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    tid = item.get("id", "")
                    if tid.startswith("TL-"):
                        try:
                            num = int(tid.replace("TL-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"TL-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_tl_counter
        _in_memory_tl_counter += 1
        return f"TL-{_in_memory_tl_counter:03d}"

    @staticmethod
    def create_timeline_event(
        incident_id: str,
        event_type: str,
        event_title: str,
        description: str,
        timestamp: str,
        source_id: Optional[str] = None
    ) -> TimelineEventData:
        tl_id = TimelineService._generate_next_id()
        doc = {
            "id": tl_id,
            "incident_id": incident_id,
            "event_type": event_type,
            "event_title": event_title,
            "description": description,
            "timestamp": timestamp,
            "source_id": source_id,
        }

        db = get_database()
        if db is not None:
            try:
                # Avoid duplicate timeline events with identical incident_id, event_type, source_id
                query = {"incident_id": incident_id, "event_type": event_type, "source_id": source_id}
                if source_id and db[TimelineEventModel.COLLECTION_NAME].find_one(query):
                    existing = db[TimelineEventModel.COLLECTION_NAME].find_one(query, {"_id": 0})
                    return TimelineEventData(**existing)
                
                db[TimelineEventModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_timeline[tl_id] = doc
        else:
            _in_memory_timeline[tl_id] = doc

        return TimelineEventData(**doc)

    @staticmethod
    def build_incident_timeline(incident_id: str = "INC-DEMO-001") -> List[TimelineEventData]:
        logger.info(f"Building timeline for incident {incident_id}")

        threats = ThreatService.get_threats()
        darkweb = DarkWebService.get_indicators()
        fraud = FraudEventService.get_fraud_events()
        relationships = CorrelationService.get_relationships()

        # 1. Add Threat Signals
        for t in threats:
            ts = t.created_at or datetime.now(timezone.utc).isoformat()
            TimelineService.create_timeline_event(
                incident_id=incident_id,
                event_type="THREAT",
                event_title="Threat Signal Observed",
                description=f"Threat indicator {t.indicator} ({t.threat_type}) recorded with severity {t.severity}.",
                timestamp=ts,
                source_id=t.id
            )

        # 2. Add Dark Web Indicators
        for dw in darkweb:
            ts = dw.discovered_at or dw.created_at or datetime.now(timezone.utc).isoformat()
            TimelineService.create_timeline_event(
                incident_id=incident_id,
                event_type="DARK_WEB",
                event_title="Dark Web Indicator Detected",
                description=f"Indicator {dw.indicator} associated with entity {dw.related_entity or 'EMP001'}.",
                timestamp=ts,
                source_id=dw.id
            )

        # 3. Add Fraud Events
        for fr in fraud:
            ts = fr.event_time or fr.created_at or datetime.now(timezone.utc).isoformat()
            TimelineService.create_timeline_event(
                incident_id=incident_id,
                event_type="FRAUD",
                event_title=f"Banking Fraud Event ({fr.event_type})",
                description=f"Fraud event {fr.id} recorded for entity {fr.entity_id} with amount ₹{fr.amount:,}.",
                timestamp=ts,
                source_id=fr.id
            )

        # 4. Add Correlation Events
        for rel in relationships:
            ts = rel.created_at or datetime.now(timezone.utc).isoformat()
            TimelineService.create_timeline_event(
                incident_id=incident_id,
                event_type="CORRELATION",
                event_title="Relationship Link Correlated",
                description=f"Record {rel.source_id} linked to {rel.target_id} via {rel.relationship_type} ({rel.matched_field}).",
                timestamp=ts,
                source_id=rel.id
            )

        return TimelineService.get_incident_timeline(incident_id)

    @staticmethod
    def get_incident_timeline(incident_id: str) -> List[TimelineEventData]:
        db = get_database()
        tl_list = []

        if db is not None:
            try:
                cursor = db[TimelineEventModel.COLLECTION_NAME].find({"incident_id": incident_id}, {"_id": 0})
                for doc in cursor:
                    tl_list.append(TimelineEventData(**doc))
            except Exception:
                pass

        if not tl_list:
            for doc in _in_memory_timeline.values():
                if doc.get("incident_id") == incident_id:
                    tl_list.append(TimelineEventData(**doc))

        # Sort timeline events by timestamp (oldest event first)
        tl_list.sort(key=lambda x: x.timestamp or "")
        return tl_list
