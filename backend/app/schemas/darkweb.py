from typing import Optional
from pydantic import BaseModel, Field, field_validator

DARKWEB_INDICATOR_TYPES = [
    "credential_exposure", "email", "domain", "username", "mention", "other"
]
SEVERITY_LEVELS = ["low", "medium", "high", "critical"]
STATUS_LEVELS = ["new", "verified", "investigating", "resolved", "false_positive"]

class DarkWebIndicatorCreate(BaseModel):
    indicator: str = Field(..., min_length=1, description="Simulated dark web indicator (e.g. employee001@example.test)")
    indicator_type: str = Field(..., description="Type: credential_exposure, email, domain, username, mention, other")
    source: str = Field(..., min_length=1, description="Source of dark web threat intelligence")
    related_entity: str = Field(..., min_length=1, description="Related entity identifier (e.g. EMP001)")
    description: str = Field(..., description="Summary description of indicator")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    status: str = Field(..., description="Status: new, verified, investigating, resolved, false_positive")
    discovered_at: Optional[str] = None

    @field_validator("indicator_type")
    @classmethod
    def validate_indicator_type(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in DARKWEB_INDICATOR_TYPES:
            raise ValueError(f"Invalid indicator_type '{v}'. Must be one of {DARKWEB_INDICATOR_TYPES}")
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


class DarkWebIndicatorUpdate(BaseModel):
    indicator: Optional[str] = None
    indicator_type: Optional[str] = None
    source: Optional[str] = None
    related_entity: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    discovered_at: Optional[str] = None

    @field_validator("indicator_type")
    @classmethod
    def validate_indicator_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower()
        if v_lower not in DARKWEB_INDICATOR_TYPES:
            raise ValueError(f"Invalid indicator_type '{v}'. Must be one of {DARKWEB_INDICATOR_TYPES}")
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


class DarkWebIndicatorResponse(BaseModel):
    id: str
    indicator: str
    indicator_type: str
    source: str
    related_entity: str
    description: str
    severity: str
    status: str
    discovered_at: str
    created_at: str
    updated_at: str
