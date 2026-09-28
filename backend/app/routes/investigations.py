import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.investigation import InvestigationSingleResponse
from app.services.investigation_service import InvestigationService

logger = logging.getLogger("threatlink.routes.investigations")

router = APIRouter(prefix="/investigations", tags=["Investigation Engine"])

@router.post(
    "/run/{incident_id}",
    response_model=InvestigationSingleResponse,
    status_code=status.HTTP_200_OK,
    summary="Run Investigation Analysis",
    description="Combines threat, dark web, fraud, correlation, AI, and risk data to generate an investigation summary and key findings."
)
def run_investigation(incident_id: str):
    try:
        inv = InvestigationService.generate_investigation(incident_id)
        return InvestigationSingleResponse(
            success=True,
            message="Investigation generated successfully",
            data=inv
        )
    except Exception as err:
        logger.error(f"Failed to generate investigation: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate investigation."
        )

@router.get(
    "/{incident_id}",
    response_model=InvestigationSingleResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Investigation Details",
    description="Returns the latest generated investigation for an incident."
)
def get_investigation(incident_id: str):
    try:
        inv = InvestigationService.get_investigation(incident_id)
        return InvestigationSingleResponse(
            success=True,
            message="Investigation retrieved successfully",
            data=inv
        )
    except Exception as err:
        logger.error(f"Failed to fetch investigation: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve investigation."
        )
