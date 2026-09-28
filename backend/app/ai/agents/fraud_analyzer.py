import logging
import json
from typing import List, Dict, Any
from app.ai.state import AIState
from app.ai.llm import call_llm
from app.ai.prompts.fraud_prompt import FRAUD_SYSTEM_PROMPT

logger = logging.getLogger("threatlink.ai.fraud_analyzer")

class FraudAnalyzerAgent:
    def run(self, state: AIState) -> List[Dict[str, Any]]:
        logger.info("Fraud Analyzer Agent started")
        
        user_prompt = json.dumps({
            "fraud_events": state.fraud_events
        })

        llm_response = call_llm(FRAUD_SYSTEM_PROMPT, user_prompt)

        if llm_response and "fraud_findings" in llm_response and isinstance(llm_response["fraud_findings"], list):
            fraud_findings = llm_response["fraud_findings"]
        else:
            fraud_findings = []
            for fe in state.fraud_events:
                event_id = fe.get("id", "FRAUD-000")
                event_type = fe.get("event_type", "unusual_transaction")
                severity = fe.get("severity", "medium")
                amount = fe.get("amount", 0)
                device_id = fe.get("device_id")
                account_id = fe.get("account_id")
                wallet_id = fe.get("wallet_id")

                evidence_fields = ["event_type", "amount"]
                obs_parts = [f"Fraud event {event_id} ({event_type}) recorded with severity {severity} and amount ₹{amount:,}."]

                if device_id:
                    evidence_fields.append("device_id")
                    obs_parts.append(f"Associated with device {device_id}.")
                if account_id:
                    evidence_fields.append("account_id")
                    obs_parts.append(f"Linked to account {account_id}.")
                if wallet_id:
                    evidence_fields.append("wallet_id")
                    obs_parts.append(f"Transferred to crypto wallet {wallet_id}.")

                fraud_findings.append({
                    "event_id": event_id,
                    "observation": " ".join(obs_parts),
                    "evidence": evidence_fields
                })

        state.fraud_results = fraud_findings
        logger.info("Fraud Analyzer Agent completed")
        return fraud_findings
