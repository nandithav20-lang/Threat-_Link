from typing import Optional, List
from pydantic import BaseModel, Field

class IncidentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=5, max_length=1000)

class IncidentStatusUpdate(BaseModel):
    status: str # OPEN, IN_PROGRESS, RESOLVED, CLOSED

class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    risk_score: int
    risk_level: str
    created_at: str
    updated_at: str

class IncidentListResponse(BaseModel):
    success: bool
    message: str
    data: List[IncidentResponse] = Field(default_factory=list)

class IncidentSingleResponse(BaseModel):
    success: bool
    message: str
    data: Optional[IncidentResponse] = None
