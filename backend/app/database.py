from pymongo import MongoClient
from pymongo.database import Database
from typing import Optional
from app.config import settings

class DatabaseManager:
    client: Optional[MongoClient] = None
    db: Optional[Database] = None

db_manager = DatabaseManager()

def connect_db() -> Optional[Database]:
    try:
        db_manager.client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1000)
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        return db_manager.db
    except Exception:
        db_manager.client = None
        db_manager.db = None
        return None

def close_db():
    if db_manager.client:
        try:
            db_manager.client.close()
        except Exception:
            pass
        db_manager.client = None
        db_manager.db = None

def get_database() -> Optional[Database]:
    return db_manager.db
