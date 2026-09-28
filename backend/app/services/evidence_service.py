from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import logging

from app.database import get_database
from app.models.evidence import EvidenceModel
from app.schemas.evidence import (
    EvidenceCreate,
    EvidenceResponse,
    EvidenceVerificationResponseData,
    BlockchainAnchorData,
    BlockchainVerificationData,
)
from app.services.hash_service import HashService
from app.services.blockchain_service import blockchain_service
from app.services.threat_service import ThreatService
from app.services.darkweb_service import DarkWebService
from app.services.fraud_event_service import FraudEventService
from app.services.correlation_service import CorrelationService
from app.services.risk_service import RiskService
from app.services.investigation_service import InvestigationService

logger = logging.getLogger("threatlink.services.evidence")

_in_memory_evidence: dict = {}
_in_memory_evd_counter = 0

class EvidenceService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[EvidenceModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    eid = item.get("id", "")
                    if eid.startswith("EVD-"):
                        try:
                            num = int(eid.replace("EVD-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"EVD-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_evd_counter
        _in_memory_evd_counter += 1
        return f"EVD-{_in_memory_evd_counter:03d}"

    @staticmethod
    def create_evidence(data: EvidenceCreate) -> EvidenceResponse:
        now_str = datetime.now(timezone.utc).isoformat()
        evd_id = EvidenceService._generate_next_id()
        calculated_hash = HashService.generate_sha256(data.content)

        doc = {
            "id": evd_id,
            "incident_id": data.incident_id,
            "evidence_type": data.evidence_type,
            "source_id": data.source_id,
            "description": data.description,
            "content": data.content,
            "sha256_hash": calculated_hash,
            "created_at": now_str,
            "updated_at": now_str,
            "blockchain_status": "NOT_ANCHORED",
            "transaction_hash": None,
            "blockchain_timestamp": None,
            "blockchain_hash": None,
        }

        db = get_database()
        if db is not None:
            try:
                db[EvidenceModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_evidence[evd_id] = doc
        else:
            _in_memory_evidence[evd_id] = doc

        return EvidenceResponse(**doc)

    @staticmethod
    def get_evidence(evidence_id: str) -> Optional[EvidenceResponse]:
        db = get_database()
        if db is not None:
            try:
                doc = db[EvidenceModel.COLLECTION_NAME].find_one({"id": evidence_id}, {"_id": 0})
                if doc:
                    return EvidenceResponse(**doc)
            except Exception:
                pass

        if evidence_id in _in_memory_evidence:
            return EvidenceResponse(**_in_memory_evidence[evidence_id])

        return None

    @staticmethod
    def get_incident_evidence(incident_id: str) -> List[EvidenceResponse]:
        db = get_database()
        evd_list = []

        if db is not None:
            try:
                cursor = db[EvidenceModel.COLLECTION_NAME].find({"incident_id": incident_id}, {"_id": 0})
                for doc in cursor:
                    evd_list.append(EvidenceResponse(**doc))
            except Exception:
                pass

        if not evd_list:
            for doc in _in_memory_evidence.values():
                if doc.get("incident_id") == incident_id:
                    evd_list.append(EvidenceResponse(**doc))

        return evd_list

    @staticmethod
    def get_all_evidence() -> List[EvidenceResponse]:
        db = get_database()
        evd_list = []

        if db is not None:
            try:
                cursor = db[EvidenceModel.COLLECTION_NAME].find({}, {"_id": 0})
                for doc in cursor:
                    evd_list.append(EvidenceResponse(**doc))
                if evd_list:
                    return evd_list
            except Exception:
                pass

        for doc in _in_memory_evidence.values():
            evd_list.append(EvidenceResponse(**doc))
        return evd_list

    @staticmethod
    def verify_evidence(evidence_id: str) -> Optional[EvidenceVerificationResponseData]:
        evidence = EvidenceService.get_evidence(evidence_id)
        if not evidence:
            return None

        current_hash = HashService.generate_sha256(evidence.content)
        is_valid = HashService.verify_sha256(evidence.content, evidence.sha256_hash)

        integrity_status = "VERIFIED" if is_valid else "MODIFIED"
        message = (
            "Evidence integrity verified successfully."
            if is_valid
            else "Evidence content does not match the stored SHA-256 hash."
        )

        return EvidenceVerificationResponseData(
            evidence_id=evidence_id,
            integrity_status=integrity_status,
            stored_hash=evidence.sha256_hash,
            current_hash=current_hash,
            message=message
        )

    @staticmethod
    def anchor_evidence_on_blockchain(evidence_id: str) -> Optional[BlockchainAnchorData]:
        evidence = EvidenceService.get_evidence(evidence_id)
        if not evidence:
            raise ValueError(f"Evidence '{evidence_id}' not found.")

        if not evidence.sha256_hash:
            raise ValueError(f"Evidence '{evidence_id}' does not have a valid SHA-256 hash.")

        if evidence.blockchain_status == "ANCHORED":
            raise ValueError(f"Evidence '{evidence_id}' is already anchored on the blockchain.")

        # Perform on-chain anchoring via Web3 BlockchainService
        anchor_res = blockchain_service.anchor_evidence(
            evidence_id=evidence.id,
            evidence_hash=evidence.sha256_hash,
            evidence_type=evidence.evidence_type
        )

        # Update database/memory record
        update_data = {
            "blockchain_status": "ANCHORED",
            "transaction_hash": anchor_res["transaction_hash"],
            "blockchain_timestamp": anchor_res["blockchain_timestamp"],
            "blockchain_hash": anchor_res["blockchain_hash"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        db = get_database()
        if db is not None:
            try:
                db[EvidenceModel.COLLECTION_NAME].update_one(
                    {"id": evidence_id},
                    {"$set": update_data}
                )
            except Exception as e:
                logger.error(f"Failed to update MongoDB with blockchain metadata: {e}")

        if evidence_id in _in_memory_evidence:
            _in_memory_evidence[evidence_id].update(update_data)

        return BlockchainAnchorData(
            evidence_id=evidence_id,
            sha256_hash=evidence.sha256_hash,
            transaction_hash=anchor_res["transaction_hash"],
            blockchain_status="ANCHORED"
        )

    @staticmethod
    def verify_evidence_on_blockchain(evidence_id: str) -> Optional[BlockchainVerificationData]:
        evidence = EvidenceService.get_evidence(evidence_id)
        if not evidence:
            return None

        # Calculate current content SHA-256 hash dynamically
        current_hash = HashService.generate_sha256(evidence.content)

        # Query smart contract directly on-chain
        blockchain_res = blockchain_service.verify_blockchain_evidence(
            evidence_id=evidence_id,
            current_hash=current_hash
        )

        return BlockchainVerificationData(
            evidence_id=evidence_id,
            integrity_status=blockchain_res["integrity_status"],
            blockchain_status=blockchain_res["blockchain_status"],
            message=blockchain_res["message"],
            blockchain_hash=blockchain_res.get("blockchain_hash"),
            current_hash=current_hash
        )

    @staticmethod
    def generate_evidence_from_investigation(incident_id: str = "INC-DEMO-001") -> List[EvidenceResponse]:
        logger.info(f"Auto-generating evidence for incident {incident_id}")
        existing_evd = EvidenceService.get_incident_evidence(incident_id)
        existing_sources = {e.source_id for e in existing_evd if e.source_id}

        darkweb = DarkWebService.get_indicators()
        fraud = FraudEventService.get_fraud_events()
        relationships = CorrelationService.get_relationships()
        risk_data = RiskService.get_latest_risk(incident_id)
        inv_data = InvestigationService.get_investigation(incident_id)

        created_items = []

        # 1. Dark Web Evidence
        for dw in darkweb:
            if dw.id not in existing_sources:
                ev = EvidenceService.create_evidence(EvidenceCreate(
                    incident_id=incident_id,
                    evidence_type="DARK_WEB",
                    source_id=dw.id,
                    description=f"Dark Web credential exposure indicator for {dw.related_entity or 'EMP001'}.",
                    content=f"Indicator: {dw.indicator} | Type: {dw.indicator_type} | Source: {dw.source} | Severity: {dw.severity}"
                ))
                created_items.append(ev)

        # 2. Fraud Event Evidence
        for fr in fraud:
            if fr.id not in existing_sources:
                ev = EvidenceService.create_evidence(EvidenceCreate(
                    incident_id=incident_id,
                    evidence_type="FRAUD",
                    source_id=fr.id,
                    description=f"Synthetic banking fraud event record for entity {fr.entity_id}.",
                    content=f"Event ID: {fr.id} | Entity: {fr.entity_id} | Account: {fr.account_id} | Amount: ₹{fr.amount} | Device: {fr.device_id or 'N/A'}"
                ))
                created_items.append(ev)

        # 3. Correlation Evidence
        for rel in relationships:
            if rel.id not in existing_sources:
                ev = EvidenceService.create_evidence(EvidenceCreate(
                    incident_id=incident_id,
                    evidence_type="CORRELATION",
                    source_id=rel.id,
                    description=f"Deterministic entity link between {rel.source_id} and {rel.target_id}.",
                    content=f"Relationship ID: {rel.id} | Source: {rel.source_id} ({rel.source_type}) | Target: {rel.target_id} ({rel.target_type}) | Type: {rel.relationship_type}"
                ))
                created_items.append(ev)

        # 4. Risk Analysis Evidence
        if risk_data and risk_data.id and risk_data.id not in existing_sources:
            ev = EvidenceService.create_evidence(EvidenceCreate(
                incident_id=incident_id,
                evidence_type="RISK",
                source_id=risk_data.id,
                description=f"Risk score evaluation result for incident {incident_id}.",
                content=f"Risk Score: {risk_data.risk_score} | Level: {risk_data.risk_level} | Explanation: {risk_data.explanation}"
            ))
            created_items.append(ev)

        # 5. Investigation Summary Evidence
        if inv_data and inv_data.id and inv_data.id not in existing_sources:
            ev = EvidenceService.create_evidence(EvidenceCreate(
                incident_id=incident_id,
                evidence_type="INVESTIGATION",
                source_id=inv_data.id,
                description=f"Final investigation summary and key findings.",
                content=f"Summary: {inv_data.summary} | Findings: {'; '.join(inv_data.key_findings)}"
            ))
            created_items.append(ev)

        return EvidenceService.get_incident_evidence(incident_id)
