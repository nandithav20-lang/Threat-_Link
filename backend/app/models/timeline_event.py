from typing import Optional
from pydantic import BaseModel, Field

class TimelineEventModel(BaseModel):
    COLLECTION_NAME: str = "timeline_events"

    id: str
    incident_id: str
    event_type: str # THREAT, DARK_WEB, LOGIN, FRAUD, TRANSACTION, CORRELATION, AI_ANALYSIS, RISK_ANALYSIS
    event_title: str
    description: str
    timestamp: str
    source_id: Optional[str] = None
