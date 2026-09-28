from typing import Literal

FraudEventType = Literal[
    "suspicious_login",
    "new_device",
    "unusual_transaction",
    "multiple_transactions",
    "wallet_transfer",
    "other"
]
FraudSeverityType = Literal["low", "medium", "high", "critical"]
FraudStatusType = Literal["new", "reviewing", "confirmed", "resolved", "false_positive"]

class FraudEventModel:
    COLLECTION_NAME = "fraud_events"
