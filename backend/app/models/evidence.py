from typing import Optional
from pydantic import BaseModel, Field

class EvidenceModel(BaseModel):
    COLLECTION_NAME: str = "evidence"

    id: str
    incident_id: str
    evidence_type: str  # THREAT, DARK_WEB, FRAUD, AI_FINDING, CORRELATION, RISK, INVESTIGATION, TIMELINE
    source_id: Optional[str] = None
    description: str
    content: str
    sha256_hash: str
    created_at: str
    updated_at: str
    blockchain_status: str = "NOT_ANCHORED"  # NOT_ANCHORED, ANCHORED
    transaction_hash: Optional[str] = None
    blockchain_timestamp: Optional[str] = None
    blockchain_hash: Optional[str] = None
