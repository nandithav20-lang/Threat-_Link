from typing import List, Optional
from pydantic import BaseModel, Field

class InvestigationModel(BaseModel):
    COLLECTION_NAME: str = "investigations"

    id: str
    incident_id: str
    summary: str
    key_findings: List[str] = Field(default_factory=list)
    risk_explanation: str
    created_at: str
    updated_at: str
