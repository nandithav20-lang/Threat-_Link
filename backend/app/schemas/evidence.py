from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class EvidenceCreate(BaseModel):
    incident_id: str
    evidence_type: str = Field(pattern="^(THREAT|DARK_WEB|FRAUD|AI_FINDING|CORRELATION|RISK|INVESTIGATION|TIMELINE)$")
    source_id: Optional[str] = None
    description: str = Field(min_length=3, max_length=500)
    content: str = Field(min_length=1)

class EvidenceResponse(BaseModel):
    id: str
    incident_id: str
    evidence_type: str
    source_id: Optional[str] = None
    description: str
    content: str
    sha256_hash: str
    created_at: str
    updated_at: str
    blockchain_status: str = "NOT_ANCHORED"
    transaction_hash: Optional[str] = None
    blockchain_timestamp: Optional[str] = None
    blockchain_hash: Optional[str] = None

class EvidenceSingleResponse(BaseModel):
    success: bool
    message: str
    data: Optional[EvidenceResponse] = None

class EvidenceListResponse(BaseModel):
    success: bool
    message: str
    data: List[EvidenceResponse] = Field(default_factory=list)

class EvidenceVerificationResponseData(BaseModel):
    evidence_id: str
    integrity_status: str  # VERIFIED or MODIFIED
    stored_hash: str
    current_hash: str
    message: str

class EvidenceVerificationResponse(BaseModel):
    success: bool
    message: str
    data: Optional[EvidenceVerificationResponseData] = None

# Blockchain schemas
class BlockchainStatusData(BaseModel):
    connected: bool
    chain_id: Optional[int] = None
    contract_loaded: bool
    contract_address: Optional[str] = None
    rpc_url: Optional[str] = None

class BlockchainStatusResponse(BaseModel):
    success: bool
    message: str
    data: Optional[BlockchainStatusData] = None

class BlockchainAnchorData(BaseModel):
    evidence_id: str
    sha256_hash: str
    transaction_hash: str
    blockchain_status: str

class BlockchainAnchorResponse(BaseModel):
    success: bool
    message: str
    data: Optional[BlockchainAnchorData] = None

class BlockchainVerificationData(BaseModel):
    evidence_id: str
    integrity_status: str  # VERIFIED, MODIFIED, NOT_ANCHORED
    blockchain_status: str
    message: str
    blockchain_hash: Optional[str] = None
    current_hash: Optional[str] = None

class BlockchainVerificationResponse(BaseModel):
    success: bool
    message: str
    data: Optional[BlockchainVerificationData] = None
