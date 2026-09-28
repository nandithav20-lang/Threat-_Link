from fastapi import APIRouter, HTTPException
from models import ThreatModel
from pymongo import MongoClient
import os

router = APIRouter()

# Simple synchronous MongoDB connection setup using pymongo
client = MongoClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
db = client[os.getenv("DATABASE_NAME", "threatlink_ai")]

@router.post("/darkweb")
def create_threat(threat: ThreatModel):
    threat_dict = threat.model_dump()
    result = db.threats.insert_one(threat_dict)
    
    if result.inserted_id:
        return {"status": "success", "id": str(result.inserted_id)}
    raise HTTPException(status_code=500, detail="Failed to save threat")
