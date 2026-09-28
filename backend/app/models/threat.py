from typing import Literal

IndicatorType = Literal["domain", "ip", "email", "url", "hash"]
SeverityType = Literal["low", "medium", "high", "critical"]
StatusType = Literal["new", "verified", "investigating", "resolved", "false_positive"]

class ThreatModel:
    COLLECTION_NAME = "threats"
