import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from pymongo import ASCENDING

from app.database import get_database
from app.models.user import UserModel
from app.core.security import get_password_hash, verify_password, create_access_token

logger = logging.getLogger("threatlink.services.auth")

# In-memory user store for fallback/testing when MongoDB is disconnected
_in_memory_users: Dict[str, Dict[str, Any]] = {}

class AuthService:
    @staticmethod
    def init_db_indexes():
        db = get_database()
        if db is not None:
            try:
                db[UserModel.COLLECTION_NAME].create_index([("email", ASCENDING)], unique=True)
                logger.info("Created unique index on users.email")
            except Exception as err:
                logger.warning(f"Failed to create users index: {err}")

    @staticmethod
    def _normalize_user_doc(doc: dict) -> dict:
        if not doc:
            return {}
        user_id = str(doc.get("_id")) if "_id" in doc else doc.get("id", str(uuid.uuid4()))
        return {
            "id": user_id,
            "name": doc.get("name", ""),
            "email": doc.get("email", ""),
            "role": doc.get("role", "INVESTIGATOR"),
            "created_at": doc.get("created_at", ""),
            "updated_at": doc.get("updated_at", ""),
        }

    @classmethod
    def get_user_by_email(cls, email: str) -> Optional[dict]:
        email_clean = email.strip().lower()
        db = get_database()
        if db is not None:
            try:
                doc = db[UserModel.COLLECTION_NAME].find_one({"email": email_clean})
                if doc:
                    doc["id"] = str(doc.get("_id", doc.get("id", "")))
                    return doc
            except Exception as err:
                logger.error(f"MongoDB query error for user email: {err}")

        # Check in-memory store
        for uid, user_data in _in_memory_users.items():
            if user_data.get("email", "").lower() == email_clean:
                res = dict(user_data)
                res["id"] = uid
                return res
        return None

    @classmethod
    def get_user_by_id(cls, user_id: str) -> Optional[dict]:
        db = get_database()
        if db is not None:
            try:
                from bson import ObjectId
                doc = None
                if ObjectId.is_valid(user_id):
                    doc = db[UserModel.COLLECTION_NAME].find_one({"_id": ObjectId(user_id)})
                if not doc:
                    doc = db[UserModel.COLLECTION_NAME].find_one({"id": user_id})
                if doc:
                    doc["id"] = str(doc.get("_id", doc.get("id", user_id)))
                    return doc
            except Exception as err:
                logger.error(f"MongoDB query error for user_id {user_id}: {err}")

        if user_id in _in_memory_users:
            res = dict(_in_memory_users[user_id])
            res["id"] = user_id
            return res
        return None

    @classmethod
    def register_user(cls, name: str, email: str, password: str) -> Tuple[bool, str, Optional[dict], Optional[str]]:
        email_clean = email.strip().lower()
        name_clean = name.strip()

        if not name_clean:
            return False, "Name is required", None, "INVALID_NAME"
        if not email_clean or "@" not in email_clean:
            return False, "Valid email is required", None, "INVALID_EMAIL"
        if not password or len(password) < 6:
            return False, "Password must be at least 6 characters long", None, "INVALID_PASSWORD"

        existing = cls.get_user_by_email(email_clean)
        if existing:
            return False, "Email already registered", None, "EMAIL_ALREADY_EXISTS"

        hashed = get_password_hash(password)
        now_str = datetime.now(timezone.utc).isoformat()
        user_model = UserModel(
            name=name_clean,
            email=email_clean,
            password_hash=hashed,
            role="INVESTIGATOR",
            created_at=now_str,
            updated_at=now_str
        )

        db = get_database()
        created_id = str(uuid.uuid4())
        if db is not None:
            try:
                res = db[UserModel.COLLECTION_NAME].insert_one(user_model.to_dict())
                created_id = str(res.inserted_id)
            except Exception as err:
                logger.error(f"Error inserting user into MongoDB: {err}")
                # Fallback to in-memory
                _in_memory_users[created_id] = user_model.to_dict()
        else:
            _in_memory_users[created_id] = user_model.to_dict()

        public_user = {
            "id": created_id,
            "name": name_clean,
            "email": email_clean,
            "role": "INVESTIGATOR",
            "created_at": now_str,
            "updated_at": now_str
        }

        return True, "Registration successful", public_user, None

    @classmethod
    def authenticate_user(cls, email: str, password: str) -> Tuple[bool, str, Optional[dict]]:
        email_clean = email.strip().lower()
        user = cls.get_user_by_email(email_clean)

        if not user:
            return False, "Invalid email or password", None

        pwd_hash = user.get("password_hash", "")
        if not verify_password(password, pwd_hash):
            return False, "Invalid email or password", None

        user_id = str(user.get("_id", user.get("id", "")))
        public_user = {
            "id": user_id,
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "INVESTIGATOR"),
        }

        token = create_access_token(data={
            "user_id": user_id,
            "sub": user_id,
            "email": user.get("email", ""),
            "role": user.get("role", "INVESTIGATOR")
        })

        token_data = {
            "access_token": token,
            "token_type": "bearer",
            "user": public_user
        }

        return True, "Login successful", token_data
