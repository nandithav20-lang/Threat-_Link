import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import connect_db, close_db
from app.models.fraud_event import FraudEventModel
from datetime import datetime, timezone

def seed_fraud_events():
    db = connect_db()
    if db is None:
        print("[ERR] Could not connect to MongoDB. Ensure server is running.")
        return

    collection = db[FraudEventModel.COLLECTION_NAME]

    synthetic_events = [
        {
            "id": "FRAUD-001",
            "entity_id": "EMP001",
            "account_id": "ACC-SIM-001",
            "event_type": "unusual_transaction",
            "transaction_id": "TXN-SIM-001",
            "amount": 85000.0,
            "currency": "INR",
            "device_id": "DEVICE-SIM-001",
            "ip_address": "192.0.2.10",
            "wallet_id": "WALLET-SIM-001",
            "description": "Simulated unusual transaction from a newly observed device.",
            "severity": "high",
            "status": "new",
            "event_time": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "FRAUD-002",
            "entity_id": "EMP002",
            "account_id": "ACC-SIM-002",
            "event_type": "new_device",
            "transaction_id": None,
            "amount": 0.0,
            "currency": "INR",
            "device_id": "DEVICE-SIM-002",
            "ip_address": "198.51.100.12",
            "wallet_id": None,
            "description": "Simulated unauthorized login attempt from unregistered device.",
            "severity": "medium",
            "status": "reviewing",
            "event_time": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "id": "FRAUD-003",
            "entity_id": "EMP003",
            "account_id": "ACC-SIM-003",
            "event_type": "wallet_transfer",
            "transaction_id": "TXN-SIM-009",
            "amount": 45000.0,
            "currency": "INR",
            "device_id": "DEVICE-SIM-003",
            "ip_address": "203.0.113.45",
            "wallet_id": "WALLET-SIM-009",
            "description": "Simulated high-risk crypto wallet transfer event.",
            "severity": "high",
            "status": "confirmed",
            "event_time": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    ]

    inserted_count = 0
    for item in synthetic_events:
        existing = collection.find_one({"id": item["id"]})
        if not existing:
            collection.insert_one(item)
            inserted_count += 1
            print(f"[+] Seeded fraud event {item['id']}")
        else:
            print(f"[*] Fraud event {item['id']} already exists, skipping")

    close_db()
    print(f"[SUCCESS] Seeding complete. {inserted_count} new fraud events added.")

if __name__ == "__main__":
    seed_fraud_events()
