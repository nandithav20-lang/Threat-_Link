from typing import List, Optional
from pydantic import BaseModel, Field

class FindingItem(BaseModel):
    type: str
    entity: str
    severity: str
    observation: str

class VerificationItem(BaseModel):
    finding: str
    status: str
    reason: str

class FraudFindingItem(BaseModel):
    event_id: str
    observation: str
    evidence: List[str] = Field(default_factory=list)

class CorrelationFindingItem(BaseModel):
    source: str
    target: str
    relationship: str
    explanation: str

class AIAnalysisData(BaseModel):
    analysis_results: List[FindingItem] = Field(default_factory=list)
    verification_results: List[VerificationItem] = Field(default_factory=list)
    fraud_results: List[FraudFindingItem] = Field(default_factory=list)
    correlation_results: List[CorrelationFindingItem] = Field(default_factory=list)

class AIAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[AIAnalysisData] = None
