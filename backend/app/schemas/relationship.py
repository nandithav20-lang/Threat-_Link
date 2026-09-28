from pydantic import BaseModel, Field, field_validator

SOURCE_TYPES = [
    "threat", "dark_web", "fraud_event", "entity", "account", "transaction", "device", "wallet"
]
RELATIONSHIP_TYPES = [
    "same_entity", "same_account", "same_device", "same_transaction", "same_wallet", "related_threat"
]

class RelationshipResponse(BaseModel):
    id: str
    source_type: str
    source_id: str
    target_type: str
    target_id: str
    relationship_type: str
    matched_field: str
    created_at: str

    @field_validator("source_type", "target_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in SOURCE_TYPES:
            raise ValueError(f"Invalid type '{v}'. Must be one of {SOURCE_TYPES}")
        return v_lower

    @field_validator("relationship_type")
    @classmethod
    def validate_relationship_type(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in RELATIONSHIP_TYPES:
            raise ValueError(f"Invalid relationship_type '{v}'. Must be one of {RELATIONSHIP_TYPES}")
        return v_lower


class CorrelationRunData(BaseModel):
    relationships_created: int
