import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.risk import RiskAnalysisResponse, RiskCalculateRequest
from app.services.risk_service import RiskService

logger = logging.getLogger("threatlink.routes.risk")

router = APIRouter(prefix="/risk", tags=["Risk Analysis Engine"])

@router.post(
    "/calculate",
    response_model=RiskAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Risk Score",
    description="Calculates a deterministic 0-100 risk score, risk level, factor breakdown, and explanation based on evidence."
)
def calculate_risk(body: RiskCalculateRequest = RiskCalculateRequest()):
    try:
        incident_id = body.incident_id or "INC-DEMO-001"
        result = RiskService.calculate_and_save_risk(incident_id)
        return RiskAnalysisResponse(
            success=True,
            message="Risk calculated successfully",
            data=result
        )
    except Exception as err:
        logger.error(f"Risk calculation failure: {type(err).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to calculate risk."
        )

@router.get(
    "/{incident_id}",
    response_model=RiskAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Risk Analysis",
    description="Returns the latest calculated risk analysis for the given incident ID."
)
def get_risk(incident_id: str):
    try:
        result = RiskService.get_latest_risk(incident_id)
        if not result:
            result = RiskService.calculate_and_save_risk(incident_id)
        return RiskAnalysisResponse(
            success=True,
            message="Risk analysis retrieved successfully",
            data=result
        )
    except Exception as err:
        logger.error(f"Risk retrieval failure: {type(err).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve risk analysis."
        )
