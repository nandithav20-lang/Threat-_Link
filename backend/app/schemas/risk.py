from typing import Dict, Optional, List
from pydantic import BaseModel, Field

class RiskFactorScores(BaseModel):
    threat: int = Field(ge=0, le=20)
    dark_web: int = Field(ge=0, le=20)
    fraud: int = Field(ge=0, le=25)
    correlation: int = Field(ge=0, le=20)
    verification: int = Field(ge=0, le=15)

class RiskCalculateRequest(BaseModel):
    incident_id: Optional[str] = "INC-DEMO-001"

class RiskAnalysisData(BaseModel):
    id: Optional[str] = None
    incident_id: str
    risk_score: int = Field(ge=0, le=100)
    risk_level: str
    factor_scores: RiskFactorScores
    explanation: str
    created_at: Optional[str] = None

class RiskAnalysisResponse(BaseModel):
    success: bool
    message: str
    data: Optional[RiskAnalysisData] = None
