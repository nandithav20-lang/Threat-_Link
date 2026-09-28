from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.common import ApiResponse
from app.schemas.fraud_event import (
    FraudEventCreate,
    FraudEventUpdate,
    FraudEventResponse,
)
from app.services.fraud_event_service import FraudEventService

router = APIRouter(tags=["Banking Fraud Detection"])

@router.post("/fraud-events", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
def create_fraud_event(data: FraudEventCreate):
    created = FraudEventService.create_fraud_event(data)
    return ApiResponse(
        success=True,
        message="Fraud event created successfully",
        data={"id": created.id}
    )

@router.get("/fraud-events", response_model=ApiResponse[List[FraudEventResponse]])
def get_fraud_events():
    events = FraudEventService.get_fraud_events()
    return ApiResponse(
        success=True,
        message="Fraud events retrieved successfully",
        data=events
    )

@router.get("/fraud-events/{id}", response_model=ApiResponse[FraudEventResponse])
def get_fraud_event(id: str):
    event = FraudEventService.get_fraud_event(id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fraud event not found"
        )
    return ApiResponse(
        success=True,
        message="Fraud event retrieved successfully",
        data=event
    )

@router.put("/fraud-events/{id}", response_model=ApiResponse[FraudEventResponse])
def update_fraud_event(id: str, data: FraudEventUpdate):
    updated = FraudEventService.update_fraud_event(id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fraud event not found"
        )
    return ApiResponse(
        success=True,
        message="Fraud event updated successfully",
        data=updated
    )

@router.delete("/fraud-events/{id}", response_model=ApiResponse[None])
def delete_fraud_event(id: str):
    deleted = FraudEventService.delete_fraud_event(id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fraud event not found"
        )
    return ApiResponse(
        success=True,
        message="Fraud event deleted successfully",
        data=None
    )
