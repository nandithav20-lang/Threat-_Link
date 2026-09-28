# Risk Score Weights and Threshold Configurations

WEIGHT_THREAT_SEVERITY_MAX = 20
WEIGHT_DARK_WEB_MAX = 20
WEIGHT_FRAUD_SEVERITY_MAX = 25
WEIGHT_CORRELATION_MAX = 20
WEIGHT_VERIFICATION_MAX = 15

# Threat Severity Point Mapping
THREAT_SEVERITY_MAP = {
    "low": 5,
    "medium": 10,
    "high": 15,
    "critical": 20
}

# Fraud Severity Point Mapping
FRAUD_SEVERITY_MAP = {
    "low": 5,
    "medium": 12,
    "high": 18,
    "critical": 25
}

# Verification Status Point Mapping
VERIFICATION_STATUS_MAP = {
    "insufficient_evidence": 0,
    "partially_supported": 7,
    "supported": 15
}

# Risk Level Thresholds
def get_risk_level_from_score(score: int) -> str:
    if score <= 24:
        return "LOW"
    elif score <= 49:
        return "MEDIUM"
    elif score <= 74:
        return "HIGH"
    else:
        return "CRITICAL"
