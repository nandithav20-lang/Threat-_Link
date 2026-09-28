from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.common import ApiResponse
from app.schemas.darkweb import (
    DarkWebIndicatorCreate,
    DarkWebIndicatorUpdate,
    DarkWebIndicatorResponse,
)
from app.services.darkweb_service import DarkWebService

router = APIRouter(tags=["Dark Web Intelligence"])

@router.post("/dark-web", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
def create_darkweb_indicator(data: DarkWebIndicatorCreate):
    created = DarkWebService.create_indicator(data)
    return ApiResponse(
        success=True,
        message="Dark Web indicator created successfully",
        data={"id": created.id}
    )

@router.get("/dark-web", response_model=ApiResponse[List[DarkWebIndicatorResponse]])
def get_darkweb_indicators():
    indicators = DarkWebService.get_indicators()
    return ApiResponse(
        success=True,
        message="Dark Web indicators retrieved successfully",
        data=indicators
    )

@router.get("/dark-web/{id}", response_model=ApiResponse[DarkWebIndicatorResponse])
def get_darkweb_indicator(id: str):
    indicator = DarkWebService.get_indicator(id)
    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dark Web indicator not found"
        )
    return ApiResponse(
        success=True,
        message="Dark Web indicator retrieved successfully",
        data=indicator
    )

@router.put("/dark-web/{id}", response_model=ApiResponse[DarkWebIndicatorResponse])
def update_darkweb_indicator(id: str, data: DarkWebIndicatorUpdate):
    updated = DarkWebService.update_indicator(id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dark Web indicator not found"
        )
    return ApiResponse(
        success=True,
        message="Dark Web indicator updated successfully",
        data=updated
    )

@router.delete("/dark-web/{id}", response_model=ApiResponse[None])
def delete_darkweb_indicator(id: str):
    deleted = DarkWebService.delete_indicator(id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dark Web indicator not found"
        )
    return ApiResponse(
        success=True,
        message="Dark Web indicator deleted successfully",
        data=None
    )
