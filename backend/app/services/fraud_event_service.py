from datetime import datetime, timezone
from typing import List, Optional
from app.database import get_database
from app.models.fraud_event import FraudEventModel
from app.schemas.fraud_event import (
    FraudEventCreate,
    FraudEventUpdate,
    FraudEventResponse,
)

_in_memory_fraud: dict = {}
_in_memory_counter = 0

class FraudEventService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_items = list(db[FraudEventModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_items:
                    fid = item.get("id", "")
                    if fid.startswith("FRAUD-"):
                        try:
                            num = int(fid.replace("FRAUD-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"FRAUD-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_counter
        _in_memory_counter += 1
        return f"FRAUD-{_in_memory_counter:03d}"

    @staticmethod
    def create_fraud_event(data: FraudEventCreate) -> FraudEventResponse:
        db = get_database()
        now_str = datetime.now(timezone.utc).isoformat()
        fraud_id = FraudEventService._generate_next_id()
        event_time_str = data.event_time or now_str

        doc = {
            "id": fraud_id,
            "entity_id": data.entity_id,
            "account_id": data.account_id,
            "event_type": data.event_type,
            "transaction_id": data.transaction_id,
            "amount": data.amount,
            "currency": data.currency,
            "device_id": data.device_id,
            "ip_address": data.ip_address,
            "wallet_id": data.wallet_id,
            "description": data.description,
            "severity": data.severity,
            "status": data.status,
            "event_time": event_time_str,
            "created_at": now_str,
            "updated_at": now_str,
        }

        if db is not None:
            try:
                db[FraudEventModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_fraud[fraud_id] = doc
        else:
            _in_memory_fraud[fraud_id] = doc

        return FraudEventResponse(**doc)

    @staticmethod
    def get_fraud_events() -> List[FraudEventResponse]:
        db = get_database()
        events_list = []

        if db is not None:
            try:
                cursor = db[FraudEventModel.COLLECTION_NAME].find({}, {"_id": 0})
                for doc in cursor:
                    events_list.append(FraudEventResponse(**doc))
                return events_list
            except Exception:
                pass

        for doc in _in_memory_fraud.values():
            events_list.append(FraudEventResponse(**doc))
        return events_list

    @staticmethod
    def get_fraud_event(fraud_id: str) -> Optional[FraudEventResponse]:
        db = get_database()

        if db is not None:
            try:
                doc = db[FraudEventModel.COLLECTION_NAME].find_one({"id": fraud_id}, {"_id": 0})
                if doc:
                    return FraudEventResponse(**doc)
            except Exception:
                pass

        if fraud_id in _in_memory_fraud:
            return FraudEventResponse(**_in_memory_fraud[fraud_id])
        return None

    @staticmethod
    def update_fraud_event(fraud_id: str, update_data: FraudEventUpdate) -> Optional[FraudEventResponse]:
        existing = FraudEventService.get_fraud_event(fraud_id)
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
                res = db[FraudEventModel.COLLECTION_NAME].update_one(
                    {"id": fraud_id},
                    {"$set": update_dict}
                )
                if res.matched_count > 0:
                    updated_doc = db[FraudEventModel.COLLECTION_NAME].find_one({"id": fraud_id}, {"_id": 0})
                    if updated_doc:
                        return FraudEventResponse(**updated_doc)
            except Exception:
                pass

        if fraud_id in _in_memory_fraud:
            _in_memory_fraud[fraud_id].update(update_dict)
            return FraudEventResponse(**_in_memory_fraud[fraud_id])

        return None

    @staticmethod
    def delete_fraud_event(fraud_id: str) -> bool:
        existing = FraudEventService.get_fraud_event(fraud_id)
        if not existing:
            return False

        deleted = False
        db = get_database()
        if db is not None:
            try:
                res = db[FraudEventModel.COLLECTION_NAME].delete_one({"id": fraud_id})
                if res.deleted_count > 0:
                    deleted = True
            except Exception:
                pass

        if fraud_id in _in_memory_fraud:
            del _in_memory_fraud[fraud_id]
            deleted = True

        return deleted
