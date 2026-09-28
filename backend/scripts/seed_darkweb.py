import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import connect_db, close_db
from app.models.darkweb import DarkWebModel
from datetime import datetime, timezone

def seed_darkweb():
    db = connect_db()
    if db is None:
        print("[ERR] Could not connect to MongoDB. Ensure server is running.")
        return

    collection = db[DarkWebModel.COLLECTION_NAME]

    synthetic_indicators = [
        {
            "id": "DWI-001",
            "indicator": "employee001@example.test",
            "indicator_type": "credential_exposure",
            "source": "Simulated Dark Web Feed",
            "related_entity": "EMP001",
            "description": "Simulated credential exposure associated with EMP001.",
            "severity": "high",
            "status": "new",
            "discovered_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "DWI-002",
            "indicator": "example-leak-dump.test",
            "indicator_type": "domain",
            "source": "Authorized Intelligence Feed",
            "related_entity": "EMP004",
            "description": "Simulated database breach paste mentioning corporate domain",
            "severity": "critical",
            "status": "verified",
            "discovered_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "DWI-003",
            "indicator": "vpn_access_user_99",
            "indicator_type": "username",
            "source": "Simulated Dark Web Market",
            "related_entity": "EMP009",
            "description": "Simulated broker listing mentioning VPN access username",
            "severity": "medium",
            "status": "investigating",
            "discovered_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    ]

    inserted_count = 0
    for item in synthetic_indicators:
        existing = collection.find_one({"id": item["id"]})
        if not existing:
            collection.insert_one(item)
            inserted_count += 1
            print(f"[+] Seeded dark web indicator {item['id']}")
        else:
            print(f"[*] Dark Web indicator {item['id']} already exists, skipping")

    close_db()
    print(f"[SUCCESS] Seeding complete. {inserted_count} new indicators added.")

if __name__ == "__main__":
    seed_darkweb()
