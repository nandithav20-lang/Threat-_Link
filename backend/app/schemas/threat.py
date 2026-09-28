from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

INDICATOR_TYPES = ["domain", "ip", "email", "url", "hash"]
SEVERITY_LEVELS = ["low", "medium", "high", "critical"]
STATUS_LEVELS = ["new", "verified", "investigating", "resolved", "false_positive"]

class ThreatCreate(BaseModel):
    indicator: str = Field(..., min_length=1, description="The threat indicator string")
    indicator_type: str = Field(..., description="Type of indicator: domain, ip, email, url, hash")
    source: str = Field(..., min_length=1, description="Source of threat intelligence")
    description: str = Field(..., description="Short summary description of threat")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    status: str = Field(..., description="Status: new, verified, investigating, resolved, false_positive")

    @field_validator("indicator_type")
    @classmethod
    def validate_indicator_type(cls, v: str) -> str:
        v_lower = v.lower()
        if v_lower not in INDICATOR_TYPES:
            raise ValueError(f"Invalid indicator_type '{v}'. Must be one of {INDICATOR_TYPES}")
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


class ThreatUpdate(BaseModel):
    indicator: Optional[str] = None
    indicator_type: Optional[str] = None
    source: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None

    @field_validator("indicator_type")
    @classmethod
    def validate_indicator_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_lower = v.lower()
        if v_lower not in INDICATOR_TYPES:
            raise ValueError(f"Invalid indicator_type '{v}'. Must be one of {INDICATOR_TYPES}")
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


class ThreatResponse(BaseModel):
    id: str
    indicator: str
    indicator_type: str
    source: str
    description: str
    severity: str
    status: str
    created_at: str
    updated_at: str
