from datetime import datetime, timezone
from typing import Optional, Dict, Any

class UserModel:
    COLLECTION_NAME = "users"

    def __init__(
        self,
        name: str,
        email: str,
        password_hash: str,
        role: str = "INVESTIGATOR",
        id: Optional[str] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.created_at = created_at or datetime.now(timezone.utc).isoformat()
        self.updated_at = updated_at or datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        doc = {
            "name": self.name,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        if self.id:
            doc["id"] = self.id
        return doc

    def to_public_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id or "",
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
