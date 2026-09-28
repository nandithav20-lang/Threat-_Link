from typing import Optional
from pydantic import BaseModel, Field, field_validator

EVENT_TYPES = [
    "suspicious_login",
    "new_device",
    "unusual_transaction",
    "multiple_transactions",
    "wallet_transfer",
    "other"
]
SEVERITY_LEVELS = ["low", "medium", "high", "critical"]
STATUS_LEVELS = ["new", "reviewing", "confirmed", "resolved", "false_positive"]

class FraudEventCreate(BaseModel):
    entity_id: str = Field(..., min_length=1, description="Associated entity ID (e.g. EMP001)")
    account_id: str = Field(..., min_length=1, description="Synthetic account ID (e.g. ACC-SIM-001)")
    event_type: str = Field(..., description="Type of event: suspicious_login, new_device, unusual_transaction, etc.")
    transaction_id: Optional[str] = Field(None, description="Synthetic transaction ID (e.g. TXN-SIM-001)")
    amount: float = Field(0.0, ge=0.0, description="Transaction amount (must not be negative)")
    currency: str = Field("INR", description="Currency string (e.g. INR)")
    device_id: Optional[str] = Field(None, description="Synthetic device identifier")
    ip_address: Optional[str] = Field(None, description="IP address string")
    wallet_id: Optional[str] = Field(None, description="Synthetic wallet identifier")
    description: str = Field(..., description="Summary explanation of fraud event")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    status: str = Field(..., description="Status: new, reviewing, confirmed, resolved, false_positive")
    event_time: Optional[str] = None

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in EVENT_TYPES:
            raise ValueError(f"Invalid event_type '{v}'. Must be one of {EVENT_TYPES}")
        return v_lower

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in SEVERITY_LEVELS:
            raise ValueError(f"Invalid severity '{v}'. Must be one of {SEVERITY_LEVELS}")
        return v_lower

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in STATUS_LEVELS:
            raise ValueError(f"Invalid status '{v}'. Must be one of {STATUS_LEVELS}")
        return v_lower


class FraudEventUpdate(BaseModel):
    entity_id: Optional[str] = None
    account_id: Optional[str] = None
    event_type: Optional[str] = None
    transaction_id: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    wallet_id: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    event_time: Optional[str] = None

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower()
        if v_lower not in EVENT_TYPES:
            raise ValueError(f"Invalid event_type '{v}'. Must be one of {EVENT_TYPES}")
        return v_lower

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower()
        if v_lower not in SEVERITY_LEVELS:
            raise ValueError(f"Invalid severity '{v}'. Must be one of {SEVERITY_LEVELS}")
        return v_lower

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower()
        if v_lower not in STATUS_LEVELS:
            raise ValueError(f"Invalid status '{v}'. Must be one of {STATUS_LEVELS}")
        return v_lower

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Amount must not be negative")
        return v


class FraudEventResponse(BaseModel):
    id: str
    entity_id: str
    account_id: str
    event_type: str
    transaction_id: Optional[str] = None
    amount: float
    currency: str
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    wallet_id: Optional[str] = None
    description: str
    severity: str
    status: str
    event_time: str
    created_at: str
    updated_at: str
