from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import logging

from app.database import get_database
from app.config.risk_config import (
    THREAT_SEVERITY_MAP,
    FRAUD_SEVERITY_MAP,
    VERIFICATION_STATUS_MAP,
    get_risk_level_from_score,
)
from app.models.risk_analysis import RiskAnalysisModel
from app.schemas.risk import RiskFactorScores, RiskAnalysisData
from app.services.threat_service import ThreatService
from app.services.darkweb_service import DarkWebService
from app.services.fraud_event_service import FraudEventService
from app.services.correlation_service import CorrelationService
from app.ai.pipeline import run_ai_pipeline

logger = logging.getLogger("threatlink.services.risk")

_in_memory_risk_analyses: dict = {}
_in_memory_risk_counter = 0

class RiskService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[RiskAnalysisModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    rid = item.get("id", "")
                    if rid.startswith("RISK-"):
                        try:
                            num = int(rid.replace("RISK-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"RISK-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_risk_counter
        _in_memory_risk_counter += 1
        return f"RISK-{_in_memory_risk_counter:03d}"

    @staticmethod
    def calculate_threat_score(threats: List[Dict[str, Any]]) -> int:
        if not threats:
            return 0
        max_score = 0
        for t in threats:
            sev = (t.get("severity") or "low").lower()
            score = THREAT_SEVERITY_MAP.get(sev, 5)
            if score > max_score:
                max_score = score
        return min(max_score, 20)

    @staticmethod
    def calculate_dark_web_score(darkweb: List[Dict[str, Any]], verifications: List[Dict[str, Any]]) -> int:
        if not darkweb:
            return 0
        
        has_supported = any(v.get("status") == "supported" for v in verifications)
        if has_supported:
            return 20
        return 10

    @staticmethod
    def calculate_fraud_score(fraud_events: List[Dict[str, Any]]) -> int:
        if not fraud_events:
            return 0
        max_score = 0
        for f in fraud_events:
            sev = (f.get("severity") or "low").lower()
            score = FRAUD_SEVERITY_MAP.get(sev, 5)
            if score > max_score:
                max_score = score
        return min(max_score, 25)

    @staticmethod
    def calculate_correlation_score(relationships: List[Dict[str, Any]]) -> int:
        count = len(relationships)
        if count == 0:
            return 0
        elif count == 1:
            return 5
        elif count == 2:
            return 10
        elif count == 3:
            return 15
        else:
            return 20

    @staticmethod
    def calculate_verification_score(verifications: List[Dict[str, Any]]) -> int:
        if not verifications:
            return 0
        
        max_score = 0
        for v in verifications:
            status = v.get("status", "insufficient_evidence")
            score = VERIFICATION_STATUS_MAP.get(status, 0)
            if score > max_score:
                max_score = score
        return min(max_score, 15)

    @staticmethod
    def get_risk_level(score: int) -> str:
        return get_risk_level_from_score(score)

    @staticmethod
    def generate_risk_explanation(
        risk_level: str,
        factors: RiskFactorScores,
        threats_count: int,
        darkweb_count: int,
        fraud_count: int,
        relationships_count: int,
    ) -> str:
        reasons = []
        if factors.fraud > 0:
            reasons.append(f"a fraud event with severity weight {factors.fraud}/25")
        if factors.dark_web > 0:
            reasons.append(f"relevant Dark Web evidence indicator ({factors.dark_web}/20)")
        if factors.threat > 0:
            reasons.append(f"observed threat signal severity ({factors.threat}/20)")
        if factors.correlation > 0:
            reasons.append(f"{relationships_count} connected correlation relationship(s) ({factors.correlation}/20)")
        if factors.verification > 0:
            reasons.append(f"supporting verification status evidence ({factors.verification}/15)")

        if not reasons:
            return "No elevated threat or fraud evidence detected. The account exhibits low baseline risk."

        joined_reasons = ", ".join(reasons)
        return (
            f"The risk level is evaluated as {risk_level} based on deterministic evidence factors: "
            f"influenced by {joined_reasons}."
        )

    @staticmethod
    def calculate_and_save_risk(incident_id: str = "INC-DEMO-001") -> RiskAnalysisData:
        logger.info(f"Calculating risk for incident {incident_id}")

        threats = [t.model_dump() for t in ThreatService.get_threats()]
        darkweb = [d.model_dump() for d in DarkWebService.get_indicators()]
        fraud = [f.model_dump() for f in FraudEventService.get_fraud_events()]
        relationships = [r.model_dump() for r in CorrelationService.get_relationships()]

        # Run AI pipeline to get verification results
        ai_output = run_ai_pipeline()
        verifications = ai_output.get("verification_results", [])

        threat_score = RiskService.calculate_threat_score(threats)
        dark_web_score = RiskService.calculate_dark_web_score(darkweb, verifications)
        fraud_score = RiskService.calculate_fraud_score(fraud)
        correlation_score = RiskService.calculate_correlation_score(relationships)
        verification_score = RiskService.calculate_verification_score(verifications)

        total_score = threat_score + dark_web_score + fraud_score + correlation_score + verification_score
        total_score = max(0, min(100, total_score))

        risk_level = RiskService.get_risk_level(total_score)
        factor_scores = RiskFactorScores(
            threat=threat_score,
            dark_web=dark_web_score,
            fraud=fraud_score,
            correlation=correlation_score,
            verification=verification_score,
        )

        explanation = RiskService.generate_risk_explanation(
            risk_level=risk_level,
            factors=factor_scores,
            threats_count=len(threats),
            darkweb_count=len(darkweb),
            fraud_count=len(fraud),
            relationships_count=len(relationships),
        )

        now_str = datetime.now(timezone.utc).isoformat()
        risk_id = RiskService._generate_next_id()

        doc = {
            "id": risk_id,
            "incident_id": incident_id,
            "risk_score": total_score,
            "risk_level": risk_level,
            "factor_scores": factor_scores.model_dump(),
            "explanation": explanation,
            "created_at": now_str,
        }

        db = get_database()
        if db is not None:
            try:
                db[RiskAnalysisModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_risk_analyses[incident_id] = doc
        else:
            _in_memory_risk_analyses[incident_id] = doc

        return RiskAnalysisData(**doc)

    @staticmethod
    def get_latest_risk(incident_id: str = "INC-DEMO-001") -> Optional[RiskAnalysisData]:
        db = get_database()
        if db is not None:
            try:
                doc = db[RiskAnalysisModel.COLLECTION_NAME].find_one(
                    {"incident_id": incident_id},
                    {"_id": 0},
                    sort=[("created_at", -1)]
                )
                if doc:
                    return RiskAnalysisData(**doc)
            except Exception:
                pass

        if incident_id in _in_memory_risk_analyses:
            return RiskAnalysisData(**_in_memory_risk_analyses[incident_id])

        # If no risk analysis exists yet, compute and return a fresh baseline calculation
        return RiskService.calculate_and_save_risk(incident_id)
