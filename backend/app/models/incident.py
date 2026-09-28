from typing import Optional
from pydantic import BaseModel, Field

class IncidentModel(BaseModel):
    COLLECTION_NAME: str = "incidents"

    id: str
    title: str
    description: str
    status: str = Field(default="OPEN") # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    risk_score: int = Field(default=0)
    risk_level: str = Field(default="LOW")
    created_at: str
    updated_at: str
