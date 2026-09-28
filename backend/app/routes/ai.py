import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.ai_result import AIAnalysisResponse, AIAnalysisData
from app.ai.pipeline import run_ai_pipeline

logger = logging.getLogger("threatlink.routes.ai")

router = APIRouter(prefix="/ai", tags=["AI Investigation Pipeline"])

@router.post(
    "/analyze",
    response_model=AIAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI Investigation Pipeline",
    description="Runs the 5-stage AI analysis pipeline over collected threats, dark web indicators, fraud events, and correlation relationships."
)
def analyze_threats():
    try:
        pipeline_output = run_ai_pipeline()
        return AIAnalysisResponse(
            success=True,
            message="AI analysis completed successfully",
            data=AIAnalysisData(**pipeline_output)
        )
    except Exception as err:
        logger.error(f"AI analysis pipeline failure: {type(err).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI analysis service is currently unavailable."
        )
