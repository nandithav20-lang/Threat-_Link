from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class RiskAnalysisModel(BaseModel):
    COLLECTION_NAME: str = "risk_analyses"

    id: str
    incident_id: str
    risk_score: int
    risk_level: str
    factor_scores: Dict[str, int]
    explanation: str
    created_at: str
