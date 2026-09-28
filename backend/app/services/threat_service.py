from datetime import datetime, timezone
from typing import List, Optional
from app.database import get_database
from app.models.threat import ThreatModel
from app.schemas.threat import ThreatCreate, ThreatUpdate, ThreatResponse
from fastapi import HTTPException

# In-memory store fallback for offline test environments when MongoDB is unavailable
_in_memory_threats: dict = {}
_in_memory_counter = 0

class ThreatService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                # Find highest numeric ID suffix in MongoDB threats collection
                all_threats = list(db[ThreatModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for t in all_threats:
                    tid = t.get("id", "")
                    if tid.startswith("THR-"):
                        try:
                            num = int(tid.replace("THR-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"THR-{max_num + 1:03d}"
            except Exception:
                pass
        
        global _in_memory_counter
        _in_memory_counter += 1
        return f"THR-{_in_memory_counter:03d}"

    @staticmethod
    def create_threat(threat_data: ThreatCreate) -> ThreatResponse:
        db = get_database()
        now_str = datetime.now(timezone.utc).isoformat()
        threat_id = ThreatService._generate_next_id()

        doc = {
            "id": threat_id,
            "indicator": threat_data.indicator,
            "indicator_type": threat_data.indicator_type,
            "source": threat_data.source,
            "description": threat_data.description,
            "severity": threat_data.severity,
            "status": threat_data.status,
            "created_at": now_str,
            "updated_at": now_str
        }

        if db is not None:
            try:
                db[ThreatModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception as e:
                # Fallback to in-memory if db error
                _in_memory_threats[threat_id] = doc
        else:
            _in_memory_threats[threat_id] = doc

        return ThreatResponse(**doc)

    @staticmethod
    def get_threats() -> List[ThreatResponse]:
        db = get_database()
        threats_list = []

        if db is not None:
            try:
                cursor = db[ThreatModel.COLLECTION_NAME].find({}, {"_id": 0})
                for doc in cursor:
                    threats_list.append(ThreatResponse(**doc))
                return threats_list
            except Exception:
                pass

        for doc in _in_memory_threats.values():
            threats_list.append(ThreatResponse(**doc))
        return threats_list

    @staticmethod
    def get_threat(threat_id: str) -> Optional[ThreatResponse]:
        db = get_database()

        if db is not None:
            try:
                doc = db[ThreatModel.COLLECTION_NAME].find_one({"id": threat_id}, {"_id": 0})
                if doc:
                    return ThreatResponse(**doc)
            except Exception:
                pass

        if threat_id in _in_memory_threats:
            return ThreatResponse(**_in_memory_threats[threat_id])
        return None

    @staticmethod
    def update_threat(threat_id: str, update_data: ThreatUpdate) -> Optional[ThreatResponse]:
        existing = ThreatService.get_threat(threat_id)
        if not existing:
            return None

        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        if not update_dict:
            return existing

        now_str = datetime.now(timezone.utc).isoformat()
        update_dict["updated_at"] = now_str

        db = get_database()
        if db is not None:
            try:
                res = db[ThreatModel.COLLECTION_NAME].update_one(
                    {"id": threat_id},
                    {"$set": update_dict}
                )
                if res.matched_count > 0:
                    updated_doc = db[ThreatModel.COLLECTION_NAME].find_one({"id": threat_id}, {"_id": 0})
                    if updated_doc:
                        return ThreatResponse(**updated_doc)
            except Exception:
                pass

        if threat_id in _in_memory_threats:
            _in_memory_threats[threat_id].update(update_dict)
            return ThreatResponse(**_in_memory_threats[threat_id])

        return None

    @staticmethod
    def delete_threat(threat_id: str) -> bool:
        existing = ThreatService.get_threat(threat_id)
        if not existing:
            return False

        deleted = False
        db = get_database()
        if db is not None:
            try:
                res = db[ThreatModel.COLLECTION_NAME].delete_one({"id": threat_id})
                if res.deleted_count > 0:
                    deleted = True
            except Exception:
                pass

        if threat_id in _in_memory_threats:
            del _in_memory_threats[threat_id]
            deleted = True

        return deleted
