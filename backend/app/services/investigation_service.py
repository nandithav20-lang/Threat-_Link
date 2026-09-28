from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import logging

from app.database import get_database
from app.models.incident import IncidentModel
from app.models.investigation import InvestigationModel
from app.schemas.incident import IncidentCreate, IncidentResponse
from app.schemas.investigation import InvestigationResponseData
from app.services.threat_service import ThreatService
from app.services.darkweb_service import DarkWebService
from app.services.fraud_event_service import FraudEventService
from app.services.correlation_service import CorrelationService
from app.services.risk_service import RiskService
from app.services.timeline_service import TimelineService
from app.ai.pipeline import run_ai_pipeline

logger = logging.getLogger("threatlink.services.investigation")

_in_memory_incidents: dict = {}
_in_memory_investigations: dict = {}
_in_memory_inc_counter = 0
_in_memory_inv_counter = 0

VALID_STATUSES = {"OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"}

class InvestigationService:
    @staticmethod
    def _generate_incident_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[IncidentModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    iid = item.get("id", "")
                    if iid.startswith("INC-"):
                        try:
                            num = int(iid.replace("INC-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"INC-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_inc_counter
        _in_memory_inc_counter += 1
        return f"INC-{_in_memory_inc_counter:03d}"

    @staticmethod
    def _generate_investigation_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[InvestigationModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    ivid = item.get("id", "")
                    if ivid.startswith("INV-"):
                        try:
                            num = int(ivid.replace("INV-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"INV-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_inv_counter
        _in_memory_inv_counter += 1
        return f"INV-{_in_memory_inv_counter:03d}"

    @staticmethod
    def seed_demo_incident():
        now_str = datetime.now(timezone.utc).isoformat()
        risk_data = RiskService.get_latest_risk("INC-DEMO-001")
        doc = {
            "id": "INC-DEMO-001",
            "title": "Suspicious Activity - EMP001",
            "description": "Connected threat intelligence, dark web credential exposure, and banking-fraud events detected.",
            "status": "OPEN",
            "risk_score": risk_data.risk_score if risk_data else 72,
            "risk_level": risk_data.risk_level if risk_data else "HIGH",
            "created_at": now_str,
            "updated_at": now_str,
        }
        db = get_database()
        if db is not None:
            try:
                if not db[IncidentModel.COLLECTION_NAME].find_one({"id": "INC-DEMO-001"}):
                    db[IncidentModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_incidents["INC-DEMO-001"] = doc
        else:
            _in_memory_incidents["INC-DEMO-001"] = doc

    @staticmethod
    def create_incident(data: IncidentCreate) -> IncidentResponse:
        now_str = datetime.now(timezone.utc).isoformat()
        inc_id = InvestigationService._generate_incident_id()
        
        # Calculate current risk baseline
        risk_data = RiskService.get_latest_risk(inc_id)

        doc = {
            "id": inc_id,
            "title": data.title,
            "description": data.description,
            "status": "OPEN",
            "risk_score": risk_data.risk_score if risk_data else 0,
            "risk_level": risk_data.risk_level if risk_data else "LOW",
            "created_at": now_str,
            "updated_at": now_str,
        }

        db = get_database()
        if db is not None:
            try:
                db[IncidentModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_incidents[inc_id] = doc
        else:
            _in_memory_incidents[inc_id] = doc

        # Initialize timeline for new incident
        TimelineService.build_incident_timeline(inc_id)

        return IncidentResponse(**doc)

    @staticmethod
    def get_incidents() -> List[IncidentResponse]:
        InvestigationService.seed_demo_incident()
        db = get_database()
        inc_list = []

        if db is not None:
            try:
                cursor = db[IncidentModel.COLLECTION_NAME].find({}, {"_id": 0})
                for doc in cursor:
                    inc_list.append(IncidentResponse(**doc))
                if inc_list:
                    return inc_list
            except Exception:
                pass

        for doc in _in_memory_incidents.values():
            inc_list.append(IncidentResponse(**doc))
        return inc_list

    @staticmethod
    def get_incident(incident_id: str) -> Optional[IncidentResponse]:
        InvestigationService.seed_demo_incident()
        db = get_database()

        if db is not None:
            try:
                doc = db[IncidentModel.COLLECTION_NAME].find_one({"id": incident_id}, {"_id": 0})
                if doc:
                    return IncidentResponse(**doc)
            except Exception:
                pass

        if incident_id in _in_memory_incidents:
            return IncidentResponse(**_in_memory_incidents[incident_id])

        return None

    @staticmethod
    def update_incident_status(incident_id: str, status: str) -> Optional[IncidentResponse]:
        status_upper = status.upper()
        if status_upper not in VALID_STATUSES:
            raise ValueError(f"Invalid incident status: {status}. Must be one of {list(VALID_STATUSES)}")

        existing = InvestigationService.get_incident(incident_id)
        if not existing:
            return None

        now_str = datetime.now(timezone.utc).isoformat()
        db = get_database()

        if db is not None:
            try:
                db[IncidentModel.COLLECTION_NAME].update_one(
                    {"id": incident_id},
                    {"$set": {"status": status_upper, "updated_at": now_str}}
                )
                updated_doc = db[IncidentModel.COLLECTION_NAME].find_one({"id": incident_id}, {"_id": 0})
                if updated_doc:
                    return IncidentResponse(**updated_doc)
            except Exception:
                pass

        if incident_id in _in_memory_incidents:
            _in_memory_incidents[incident_id]["status"] = status_upper
            _in_memory_incidents[incident_id]["updated_at"] = now_str
            return IncidentResponse(**_in_memory_incidents[incident_id])

        return None

    @staticmethod
    def generate_investigation(incident_id: str) -> InvestigationResponseData:
        logger.info(f"Generating investigation for incident {incident_id}")
        inc = InvestigationService.get_incident(incident_id)

        threats = [t.model_dump() for t in ThreatService.get_threats()]
        darkweb = [d.model_dump() for d in DarkWebService.get_indicators()]
        fraud = [f.model_dump() for f in FraudEventService.get_fraud_events()]
        relationships = [r.model_dump() for r in CorrelationService.get_relationships()]

        # Run AI pipeline and calculate risk
        ai_output = run_ai_pipeline()
        risk_data = RiskService.calculate_and_save_risk(incident_id)

        # Update incident risk score
        db = get_database()
        now_str = datetime.now(timezone.utc).isoformat()
        if db is not None:
            try:
                db[IncidentModel.COLLECTION_NAME].update_one(
                    {"id": incident_id},
                    {"$set": {"risk_score": risk_data.risk_score, "risk_level": risk_data.risk_level, "updated_at": now_str}}
                )
            except Exception:
                pass
        if incident_id in _in_memory_incidents:
            _in_memory_incidents[incident_id]["risk_score"] = risk_data.risk_score
            _in_memory_incidents[incident_id]["risk_level"] = risk_data.risk_level

        # Build timeline
        TimelineService.build_incident_timeline(incident_id)

        # Generate summary and key findings
        summary_parts = []
        if darkweb:
            dw_entity = darkweb[0].get("related_entity") or "EMP001"
            summary_parts.append(f"A simulated Dark Web indicator was identified associated with entity {dw_entity}.")
        if fraud:
            fr_entity = fraud[0].get("entity_id") or "EMP001"
            summary_parts.append(f"Suspicious banking fraud event(s) recorded for {fr_entity}.")
        if relationships:
            summary_parts.append(f"The deterministic correlation engine identified {len(relationships)} connected relationship links across records.")
        summary_parts.append(f"Current evaluated risk level is {risk_data.risk_level} with a score of {risk_data.risk_score}/100.")

        summary = " ".join(summary_parts)

        key_findings = []
        for dw in darkweb:
            key_findings.append(f"Dark Web indicator ({dw.get('indicator')}) associated with {dw.get('related_entity') or 'EMP001'}.")
        for fr in fraud:
            key_findings.append(f"Suspicious fraud event ({fr.get('id')}) linked to entity {fr.get('entity_id')} and account {fr.get('account_id')}.")
        if relationships:
            key_findings.append(f"Multiple entities and assets are connected through {len(relationships)} correlation relationships.")
        if ai_output.get("verification_results"):
            key_findings.append("AI agent pipeline analysis identified supporting verification evidence across signals.")
        key_findings.append(f"Risk assessment engine assigned {risk_data.risk_level} threat level ({risk_data.risk_score}/100).")

        inv_id = InvestigationService._generate_investigation_id()
        inv_doc = {
            "id": inv_id,
            "incident_id": incident_id,
            "summary": summary,
            "key_findings": key_findings,
            "risk_explanation": risk_data.explanation,
            "created_at": now_str,
            "updated_at": now_str,
        }

        if db is not None:
            try:
                db[InvestigationModel.COLLECTION_NAME].insert_one(inv_doc.copy())
            except Exception:
                _in_memory_investigations[incident_id] = inv_doc
        else:
            _in_memory_investigations[incident_id] = inv_doc

        return InvestigationResponseData(**inv_doc)

    @staticmethod
    def get_investigation(incident_id: str) -> Optional[InvestigationResponseData]:
        db = get_database()
        if db is not None:
            try:
                doc = db[InvestigationModel.COLLECTION_NAME].find_one(
                    {"incident_id": incident_id},
                    {"_id": 0},
                    sort=[("created_at", -1)]
                )
                if doc:
                    return InvestigationResponseData(**doc)
            except Exception:
                pass

        if incident_id in _in_memory_investigations:
            return InvestigationResponseData(**_in_memory_investigations[incident_id])

        # Generate fresh investigation if none exists yet
        return InvestigationService.generate_investigation(incident_id)
