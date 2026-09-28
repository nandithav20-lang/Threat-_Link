from pydantic import BaseModel

class ThreatModel(BaseModel):
    indicator: str
    indicator_type: str
    source: str
    related_entity: str
    description: str
    severity: str
    status: str
