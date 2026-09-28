from typing import Literal

DarkWebIndicatorType = Literal[
    "credential_exposure", "email", "domain", "username", "mention", "other"
]
DarkWebSeverityType = Literal["low", "medium", "high", "critical"]
DarkWebStatusType = Literal["new", "verified", "investigating", "resolved", "false_positive"]

class DarkWebModel:
    COLLECTION_NAME = "darkweb_indicators"
