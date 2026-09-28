from app.schemas.common import ApiResponse
from app.services.database_service import DatabaseService

class HealthService:
    @staticmethod
    def get_health_status() -> ApiResponse[dict]:
        db_connected = DatabaseService.is_connected()
        if db_connected:
            return ApiResponse(
                success=True,
                message="ThreatLink AI backend is running",
                data={"database": "connected"}
            )
        else:
            return ApiResponse(
                success=False,
                message="Database connection unavailable",
                data={"database": "disconnected"}
            )
