from fastapi import APIRouter, HTTPException, status
from typing import List, Any
from app.schemas.common import ApiResponse
from app.schemas.threat import ThreatCreate, ThreatUpdate, ThreatResponse
from app.services.threat_service import ThreatService

router = APIRouter(tags=["Threat Intelligence"])

@router.post("/threats", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
def create_threat(threat_input: ThreatCreate):
    created = ThreatService.create_threat(threat_input)
    return ApiResponse(
        success=True,
        message="Threat created successfully",
        data=created.model_dump()
    )

@router.get("/threats", response_model=ApiResponse[List[ThreatResponse]])
def get_threats():
    threats = ThreatService.get_threats()
    return ApiResponse(
        success=True,
        message="Threats retrieved successfully",
        data=threats
    )

@router.get("/threats/{id}", response_model=ApiResponse[ThreatResponse])
def get_threat(id: str):
    threat = ThreatService.get_threat(id)
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat not found"
        )
    return ApiResponse(
        success=True,
        message="Threat retrieved successfully",
        data=threat
    )

@router.put("/threats/{id}", response_model=ApiResponse[ThreatResponse])
def update_threat(id: str, threat_input: ThreatUpdate):
    updated = ThreatService.update_threat(id, threat_input)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat not found"
        )
    return ApiResponse(
        success=True,
        message="Threat updated successfully",
        data=updated
    )

@router.delete("/threats/{id}", response_model=ApiResponse[None])
def delete_threat(id: str):
    deleted = ThreatService.delete_threat(id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat not found"
        )
    return ApiResponse(
        success=True,
        message="Threat deleted successfully",
        data=None
    )
