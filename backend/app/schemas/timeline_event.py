from typing import Optional, List
from pydantic import BaseModel, Field

class TimelineEventData(BaseModel):
    id: str
    incident_id: str
    event_type: str
    event_title: str
    description: str
    timestamp: str
    source_id: Optional[str] = None

class TimelineListResponse(BaseModel):
    success: bool
    message: str
    data: List[TimelineEventData] = Field(default_factory=list)
