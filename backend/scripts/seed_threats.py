import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import connect_db, close_db, get_database
from app.models.threat import ThreatModel
from datetime import datetime, timezone

def seed_threats():
    db = connect_db()
    if db is None:
        print("[ERR] Could not connect to MongoDB. Ensure server is running.")
        return

    collection = db[ThreatModel.COLLECTION_NAME]
    
    # Optional clear existing
    # collection.delete_many({})

    synthetic_threats = [
        {
            "id": "THR-001",
            "indicator": "example-malicious-domain.test",
            "indicator_type": "domain",
            "source": "Simulated Threat Feed",
            "description": "Simulated suspicious domain associated with malware distribution",
            "severity": "high",
            "status": "new",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "THR-002",
            "indicator": "192.0.2.10",
            "indicator_type": "ip",
            "source": "C2 Tracker Feed",
            "description": "Simulated command & control server IP address",
            "severity": "critical",
            "status": "verified",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "THR-003",
            "indicator": "phishing-banking-portal.test",
            "indicator_type": "url",
            "source": "OSINT Recon",
            "description": "Simulated credential harvesting portal URL",
            "severity": "medium",
            "status": "investigating",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    ]

    inserted_count = 0
    for threat in synthetic_threats:
        existing = collection.find_one({"id": threat["id"]})
        if not existing:
            collection.insert_one(threat)
            inserted_count += 1
            print(f"[+] Seeded threat {threat['id']}")
        else:
            print(f"[*] Threat {threat['id']} already exists, skipping")

    close_db()
    print(f"[SUCCESS] Seeding complete. {inserted_count} new threats added.")

if __name__ == "__main__":
    seed_threats()
