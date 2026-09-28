from datetime import datetime, timezone
from typing import List
from app.database import get_database
from app.models.relationship import RelationshipModel
from app.schemas.relationship import RelationshipResponse
from app.services.darkweb_service import DarkWebService
from app.services.fraud_event_service import FraudEventService
from app.services.threat_service import ThreatService

_in_memory_relationships: dict = {}
_in_memory_counter = 0

class CorrelationService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[RelationshipModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    rid = item.get("id", "")
                    if rid.startswith("REL-"):
                        try:
                            num = int(rid.replace("REL-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"REL-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_counter
        _in_memory_counter += 1
        return f"REL-{_in_memory_counter:03d}"

    @staticmethod
    def _relationship_exists(source_type: str, source_id: str, target_type: str, target_id: str, relationship_type: str) -> bool:
        db = get_database()
        if db is not None:
            try:
                query = {
                    "$or": [
                        {
                            "source_type": source_type,
                            "source_id": source_id,
                            "target_type": target_type,
                            "target_id": target_id,
                            "relationship_type": relationship_type
                        },
                        {
                            "source_type": target_type,
                            "source_id": target_id,
                            "target_type": source_type,
                            "target_id": source_id,
                            "relationship_type": relationship_type
                        }
                    ]
                }
                found = db[RelationshipModel.COLLECTION_NAME].find_one(query)
                if found:
                    return True
            except Exception:
                pass

        # In-memory check
        for r in _in_memory_relationships.values():
            if r["relationship_type"] == relationship_type:
                if (r["source_id"] == source_id and r["target_id"] == target_id) or \
                   (r["source_id"] == target_id and r["target_id"] == source_id):
                    return True

        return False

    @staticmethod
    def run_correlation() -> int:
        db = get_database()
        created_count = 0

        # Fetch records from all 3 modules
        darkweb_list = DarkWebService.get_indicators()
        fraud_list = FraudEventService.get_fraud_events()
        threat_list = ThreatService.get_threats()

        candidates = []

        # Rule 1 — Dark Web Entity Match with Fraud Event Entity
        for dw in darkweb_list:
            if dw.related_entity:
                for fr in fraud_list:
                    if fr.entity_id and dw.related_entity.lower() == fr.entity_id.lower():
                        candidates.append({
                            "source_type": "dark_web",
                            "source_id": dw.id,
                            "target_type": "fraud_event",
                            "target_id": fr.id,
                            "relationship_type": "same_entity",
                            "matched_field": f"entity_id:{fr.entity_id}"
                        })

        # Rule 2 — Account Match between Fraud Events
        for i in range(len(fraud_list)):
            for j in range(i + 1, len(fraud_list)):
                f1 = fraud_list[i]
                f2 = fraud_list[j]
                if f1.account_id and f2.account_id and f1.account_id == f2.account_id:
                    candidates.append({
                        "source_type": "fraud_event",
                        "source_id": f1.id,
                        "target_type": "fraud_event",
                        "target_id": f2.id,
                        "relationship_type": "same_account",
                        "matched_field": f"account_id:{f1.account_id}"
                    })

        # Rule 3 — Device Match between Fraud Events
        for i in range(len(fraud_list)):
            for j in range(i + 1, len(fraud_list)):
                f1 = fraud_list[i]
                f2 = fraud_list[j]
                if f1.device_id and f2.device_id and f1.device_id == f2.device_id:
                    candidates.append({
                        "source_type": "fraud_event",
                        "source_id": f1.id,
                        "target_type": "fraud_event",
                        "target_id": f2.id,
                        "relationship_type": "same_device",
                        "matched_field": f"device_id:{f1.device_id}"
                    })

        # Rule 4 — Transaction Match between Fraud Events
        for i in range(len(fraud_list)):
            for j in range(i + 1, len(fraud_list)):
                f1 = fraud_list[i]
                f2 = fraud_list[j]
                if f1.transaction_id and f2.transaction_id and f1.transaction_id == f2.transaction_id:
                    candidates.append({
                        "source_type": "fraud_event",
                        "source_id": f1.id,
                        "target_type": "fraud_event",
                        "target_id": f2.id,
                        "relationship_type": "same_transaction",
                        "matched_field": f"transaction_id:{f1.transaction_id}"
                    })

        # Rule 5 — Wallet Match between Fraud Events
        for i in range(len(fraud_list)):
            for j in range(i + 1, len(fraud_list)):
                f1 = fraud_list[i]
                f2 = fraud_list[j]
                if f1.wallet_id and f2.wallet_id and f1.wallet_id == f2.wallet_id:
                    candidates.append({
                        "source_type": "fraud_event",
                        "source_id": f1.id,
                        "target_type": "fraud_event",
                        "target_id": f2.id,
                        "relationship_type": "same_wallet",
                        "matched_field": f"wallet_id:{f1.wallet_id}"
                    })

        # Rule 6 — Threat Entity Match
        for th in threat_list:
            for fr in fraud_list:
                if fr.entity_id and fr.entity_id.lower() in th.description.lower():
                    candidates.append({
                        "source_type": "threat",
                        "source_id": th.id,
                        "target_type": "fraud_event",
                        "target_id": fr.id,
                        "relationship_type": "related_threat",
                        "matched_field": f"entity_id:{fr.entity_id}"
                    })

        # Save non-duplicate candidates
        for cand in candidates:
            if not CorrelationService._relationship_exists(
                cand["source_type"], cand["source_id"], cand["target_type"], cand["target_id"], cand["relationship_type"]
            ):
                now_str = datetime.now(timezone.utc).isoformat()
                rel_id = CorrelationService._generate_next_id()
                doc = {
                    "id": rel_id,
                    "source_type": cand["source_type"],
                    "source_id": cand["source_id"],
                    "target_type": cand["target_type"],
                    "target_id": cand["target_id"],
                    "relationship_type": cand["relationship_type"],
                    "matched_field": cand["matched_field"],
                    "created_at": now_str,
                }

                if db is not None:
                    try:
                        db[RelationshipModel.COLLECTION_NAME].insert_one(doc.copy())
                        created_count += 1
                    except Exception:
                        _in_memory_relationships[rel_id] = doc
                        created_count += 1
                else:
                    _in_memory_relationships[rel_id] = doc
                    created_count += 1

        return created_count

    @staticmethod
    def get_relationships() -> List[RelationshipResponse]:
        db = get_database()
        res_list = []

        if db is not None:
            try:
                cursor = db[RelationshipModel.COLLECTION_NAME].find({}, {"_id": 0})
                for doc in cursor:
                    res_list.append(RelationshipResponse(**doc))
                return res_list
            except Exception:
                pass

        for doc in _in_memory_relationships.values():
            res_list.append(RelationshipResponse(**doc))
        return res_list

    @staticmethod
    def get_entity_relationships(entity_id: str) -> List[RelationshipResponse]:
        all_rels = CorrelationService.get_relationships()
        filtered = []
        entity_lower = entity_id.lower()

        for r in all_rels:
            matched_lower = r.matched_field.lower()
            if entity_lower in matched_lower or r.source_id.lower() == entity_lower or r.target_id.lower() == entity_lower:
                filtered.append(r)

        return filtered
