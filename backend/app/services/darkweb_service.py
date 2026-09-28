from datetime import datetime, timezone
from typing import List, Optional
from app.database import get_database
from app.models.darkweb import DarkWebModel
from app.schemas.darkweb import (
    DarkWebIndicatorCreate,
    DarkWebIndicatorUpdate,
    DarkWebIndicatorResponse,
)

_in_memory_darkweb: dict = {}
_in_memory_counter = 0

class DarkWebService:
    @staticmethod
    def _generate_next_id() -> str:
        db = get_database()
        if db is not None:
            try:
                all_indicators = list(db[DarkWebModel.COLLECTION_NAME].find({}, {"id": 1}))
                max_num = 0
                for item in all_indicators:
                    iid = item.get("id", "")
                    if iid.startswith("DWI-"):
                        try:
                            num = int(iid.replace("DWI-", ""))
                            if num > max_num:
                                max_num = num
                        except ValueError:
                            pass
                return f"DWI-{max_num + 1:03d}"
            except Exception:
                pass

        global _in_memory_counter
        _in_memory_counter += 1
        return f"DWI-{_in_memory_counter:03d}"

    @staticmethod
    def create_indicator(data: DarkWebIndicatorCreate) -> DarkWebIndicatorResponse:
        db = get_database()
        now_str = datetime.now(timezone.utc).isoformat()
        indicator_id = DarkWebService._generate_next_id()
        discovered = data.discovered_at or now_str

        doc = {
            "id": indicator_id,
            "indicator": data.indicator,
            "indicator_type": data.indicator_type,
            "source": data.source,
            "related_entity": data.related_entity,
            "description": data.description,
            "severity": data.severity,
            "status": data.status,
            "discovered_at": discovered,
            "created_at": now_str,
            "updated_at": now_str,
        }

        if db is not None:
            try:
                db[DarkWebModel.COLLECTION_NAME].insert_one(doc.copy())
            except Exception:
                _in_memory_darkweb[indicator_id] = doc
        else:
            _in_memory_darkweb[indicator_id] = doc

        return DarkWebIndicatorResponse(**doc)

    @staticmethod
    def get_indicators() -> List[DarkWebIndicatorResponse]:
        db = get_database()
        indicators_list = []

        if db is not None:
            try:
                cursor = db[DarkWebModel.COLLECTION_NAME].find({}, {"_id": 0})
                for doc in cursor:
                    indicators_list.append(DarkWebIndicatorResponse(**doc))
                return indicators_list
            except Exception:
                pass

        for doc in _in_memory_darkweb.values():
            indicators_list.append(DarkWebIndicatorResponse(**doc))
        return indicators_list

    @staticmethod
    def get_indicator(indicator_id: str) -> Optional[DarkWebIndicatorResponse]:
        db = get_database()

        if db is not None:
            try:
                doc = db[DarkWebModel.COLLECTION_NAME].find_one({"id": indicator_id}, {"_id": 0})
                if doc:
                    return DarkWebIndicatorResponse(**doc)
            except Exception:
                pass

        if indicator_id in _in_memory_darkweb:
            return DarkWebIndicatorResponse(**_in_memory_darkweb[indicator_id])
        return None

    @staticmethod
    def update_indicator(indicator_id: str, update_data: DarkWebIndicatorUpdate) -> Optional[DarkWebIndicatorResponse]:
        existing = DarkWebService.get_indicator(indicator_id)
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
                res = db[DarkWebModel.COLLECTION_NAME].update_one(
                    {"id": indicator_id},
                    {"$set": update_dict}
                )
                if res.matched_count > 0:
                    updated_doc = db[DarkWebModel.COLLECTION_NAME].find_one({"id": indicator_id}, {"_id": 0})
                    if updated_doc:
                        return DarkWebIndicatorResponse(**updated_doc)
            except Exception:
                pass

        if indicator_id in _in_memory_darkweb:
            _in_memory_darkweb[indicator_id].update(update_dict)
            return DarkWebIndicatorResponse(**_in_memory_darkweb[indicator_id])

        return None

    @staticmethod
    def delete_indicator(indicator_id: str) -> bool:
        existing = DarkWebService.get_indicator(indicator_id)
        if not existing:
            return False

        deleted = False
        db = get_database()
        if db is not None:
            try:
                res = db[DarkWebModel.COLLECTION_NAME].delete_one({"id": indicator_id})
                if res.deleted_count > 0:
                    deleted = True
            except Exception:
                pass

        if indicator_id in _in_memory_darkweb:
            del _in_memory_darkweb[indicator_id]
            deleted = True

        return deleted
