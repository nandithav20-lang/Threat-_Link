from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.services.health_service import HealthService
from app.services.database_service import DatabaseService

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=ApiResponse[dict])
def get_health():
    return HealthService.get_health_status()

@router.get("/health/database", response_model=ApiResponse[dict])
def get_database_health():
    db_status = DatabaseService.get_database_status()
    is_connected = db_status["status"] == "connected"
    
    return ApiResponse(
        success=is_connected,
        message="MongoDB connection successful" if is_connected else "MongoDB connection failed",
        data=db_status
    )
