from fastapi import APIRouter, status
from typing import List
from app.schemas.common import ApiResponse
from app.schemas.relationship import RelationshipResponse, CorrelationRunData
from app.services.correlation_service import CorrelationService

router = APIRouter(prefix="/correlation", tags=["Threat Correlation"])

@router.post("/run", response_model=ApiResponse[CorrelationRunData], status_code=status.HTTP_200_OK)
def run_correlation():
    created = CorrelationService.run_correlation()
    return ApiResponse(
        success=True,
        message="Correlation completed successfully",
        data={"relationships_created": created}
    )

@router.get("/relationships", response_model=ApiResponse[List[RelationshipResponse]])
def get_relationships():
    rels = CorrelationService.get_relationships()
    return ApiResponse(
        success=True,
        message="Relationships retrieved successfully",
        data=rels
    )

@router.get("/entity/{entity_id}", response_model=ApiResponse[List[RelationshipResponse]])
def get_entity_relationships(entity_id: str):
    rels = CorrelationService.get_entity_relationships(entity_id)
    return ApiResponse(
        success=True,
        message=f"Relationships for entity '{entity_id}' retrieved successfully",
        data=rels
    )
