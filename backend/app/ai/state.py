from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AIState(BaseModel):
    threats: List[Dict[str, Any]] = Field(default_factory=list)
    dark_web_indicators: List[Dict[str, Any]] = Field(default_factory=list)
    fraud_events: List[Dict[str, Any]] = Field(default_factory=list)
    relationships: List[Dict[str, Any]] = Field(default_factory=list)

    analysis_results: List[Dict[str, Any]] = Field(default_factory=list)
    verification_results: List[Dict[str, Any]] = Field(default_factory=list)
    fraud_results: List[Dict[str, Any]] = Field(default_factory=list)
    correlation_results: List[Dict[str, Any]] = Field(default_factory=list)
