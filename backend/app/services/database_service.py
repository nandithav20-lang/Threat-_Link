from app.database import db_manager
from app.config import settings

class DatabaseService:
    @staticmethod
    def is_connected() -> bool:
        if db_manager.client is None:
            return False
        try:
            # Ping admin database to verify active connection
            db_manager.client.admin.command('ping')
            return True
        except Exception:
            return False

    @staticmethod
    def get_database_status() -> dict:
        connected = DatabaseService.is_connected()
        return {
            "database": settings.DATABASE_NAME,
            "status": "connected" if connected else "disconnected"
        }
