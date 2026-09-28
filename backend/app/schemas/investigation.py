from typing import Optional, List
from pydantic import BaseModel, Field

class InvestigationResponseData(BaseModel):
    id: str
    incident_id: str
    summary: str
    key_findings: List[str] = Field(default_factory=list)
    risk_explanation: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class InvestigationSingleResponse(BaseModel):
    success: bool
    message: str
    data: Optional[InvestigationResponseData] = None
