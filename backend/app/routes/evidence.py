import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.evidence import (
    EvidenceCreate,
    EvidenceSingleResponse,
    EvidenceListResponse,
    EvidenceVerificationResponse,
    BlockchainStatusResponse,
    BlockchainAnchorResponse,
    BlockchainVerificationResponse,
)
from app.services.evidence_service import EvidenceService
from app.services.blockchain_service import blockchain_service

logger = logging.getLogger("threatlink.routes.evidence")

router = APIRouter(tags=["Evidence Management & Blockchain Anchoring"])

@router.get(
    "/blockchain/status",
    response_model=BlockchainStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Blockchain Node & Smart Contract Status",
    description="Returns the connection status, chain ID, and deployed EvidenceRegistry smart contract address."
)
def get_blockchain_status():
    try:
        status_data = blockchain_service.get_blockchain_status()
        return BlockchainStatusResponse(
            success=status_data["connected"],
            message="Blockchain status retrieved",
            data=status_data
        )
    except Exception as err:
        logger.error(f"Failed to check blockchain status: {err}")
        return BlockchainStatusResponse(
            success=False,
            message="Blockchain status check failed",
            data={
                "connected": False,
                "chain_id": None,
                "contract_loaded": False,
                "contract_address": None,
                "rpc_url": None
            }
        )

@router.post(
    "/evidence",
    response_model=EvidenceSingleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Evidence Item",
    description="Creates an evidence record with auto-generated SHA-256 integrity hash."
)
def create_evidence(data: EvidenceCreate):
    try:
        evd = EvidenceService.create_evidence(data)
        return EvidenceSingleResponse(
            success=True,
            message="Evidence created successfully",
            data=evd
        )
    except Exception as err:
        logger.error(f"Failed to create evidence: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create evidence item."
        )

@router.post(
    "/evidence/generate-from-investigation/{incident_id}",
    response_model=EvidenceListResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Evidence From Investigation",
    description="Auto-generates SHA-256 anchored evidence records from existing investigation findings."
)
def generate_evidence_from_investigation(incident_id: str):
    try:
        items = EvidenceService.generate_evidence_from_investigation(incident_id)
        return EvidenceListResponse(
            success=True,
            message="Evidence generated from investigation successfully",
            data=items
        )
    except Exception as err:
        logger.error(f"Failed to generate evidence: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate evidence from investigation."
        )

@router.get(
    "/evidence",
    response_model=EvidenceListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get All Evidence Items",
    description="Returns all registered evidence items across incidents."
)
def get_all_evidence():
    try:
        items = EvidenceService.get_all_evidence()
        return EvidenceListResponse(
            success=True,
            message="Evidence list retrieved successfully",
            data=items
        )
    except Exception as err:
        logger.error(f"Failed to fetch evidence: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve evidence items."
        )

@router.get(
    "/evidence/{evidence_id}",
    response_model=EvidenceSingleResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Evidence Item Details",
    description="Returns metadata, SHA-256 hash, and blockchain anchoring info for a single evidence item."
)
def get_evidence(evidence_id: str):
    evd = EvidenceService.get_evidence(evidence_id)
    if not evd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence {evidence_id} not found."
        )
    return EvidenceSingleResponse(
        success=True,
        message="Evidence retrieved successfully",
        data=evd
    )

@router.get(
    "/incidents/{incident_id}/evidence",
    response_model=EvidenceListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Incident Evidence",
    description="Returns all evidence records associated with an incident."
)
def get_incident_evidence(incident_id: str):
    try:
        items = EvidenceService.get_incident_evidence(incident_id)
        if not items:
            items = EvidenceService.generate_evidence_from_investigation(incident_id)
        return EvidenceListResponse(
            success=True,
            message="Incident evidence retrieved successfully",
            data=items
        )
    except Exception as err:
        logger.error(f"Failed to fetch incident evidence: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve incident evidence."
        )

@router.post(
    "/evidence/{evidence_id}/verify",
    response_model=EvidenceVerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Evidence SHA-256 Integrity",
    description="Recalculates SHA-256 hash for current content and compares against stored hash to verify integrity (VERIFIED or MODIFIED)."
)
def verify_evidence(evidence_id: str):
    res = EvidenceService.verify_evidence(evidence_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence {evidence_id} not found."
        )
    return EvidenceVerificationResponse(
        success=True,
        message="Evidence verification completed",
        data=res
    )

@router.post(
    "/evidence/{evidence_id}/anchor",
    response_model=BlockchainAnchorResponse,
    status_code=status.HTTP_200_OK,
    summary="Anchor Evidence Hash on Blockchain",
    description="Anchors evidence SHA-256 hash on smart contract and records transaction hash."
)
def anchor_evidence(evidence_id: str):
    try:
        result = EvidenceService.anchor_evidence_on_blockchain(evidence_id)
        return BlockchainAnchorResponse(
            success=True,
            message="Evidence anchored successfully",
            data=result
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Blockchain service unavailable: {re}"
        )
    except Exception as err:
        logger.error(f"Failed to anchor evidence {evidence_id}: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error anchoring evidence on blockchain: {str(err)}"
        )

@router.post(
    "/evidence/{evidence_id}/verify-blockchain",
    response_model=BlockchainVerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Evidence Integrity Against Blockchain",
    description="Fetches stored hash directly from smart contract and compares against recalculated current SHA-256 hash."
)
def verify_blockchain_evidence(evidence_id: str):
    try:
        res = EvidenceService.verify_evidence_on_blockchain(evidence_id)
        if not res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Evidence {evidence_id} not found."
            )
        return BlockchainVerificationResponse(
            success=True,
            message="Blockchain evidence verification completed",
            data=res
        )
    except HTTPException:
        raise
    except Exception as err:
        logger.error(f"Failed to verify evidence on blockchain: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to verify evidence on blockchain: {str(err)}"
        )
