import logging
import json
from typing import List, Dict, Any
from app.ai.state import AIState
from app.ai.llm import call_llm
from app.ai.prompts.verifier_prompt import VERIFIER_SYSTEM_PROMPT

logger = logging.getLogger("threatlink.ai.verifier")

class VerifierAgent:
    def run(self, state: AIState) -> List[Dict[str, Any]]:
        logger.info("Verifier Agent started")
        
        user_prompt = json.dumps({
            "analysis_results": state.analysis_results,
            "relationships": state.relationships,
            "fraud_events": state.fraud_events
        })

        llm_response = call_llm(VERIFIER_SYSTEM_PROMPT, user_prompt)

        if llm_response and "verification" in llm_response and isinstance(llm_response["verification"], list):
            verifications = llm_response["verification"]
        else:
            verifications = []
            rel_entities = set()
            for rel in state.relationships:
                if rel.get("matched_field") == "entity_id":
                    rel_entities.add(rel.get("source_id"))
                    rel_entities.add(rel.get("target_id"))

            fraud_entities = {f.get("entity_id") for f in state.fraud_events if f.get("entity_id")}

            for finding in state.analysis_results:
                finding_type = finding.get("type", "finding")
                entity = finding.get("entity", "")
                
                if entity in fraud_entities:
                    status = "supported"
                    reason = f"The entity {entity} is associated with active fraud event(s) and dark web indicators."
                elif len(state.relationships) > 0:
                    status = "partially_supported"
                    reason = f"Correlation relationships exist involving entity/records for {entity}, but direct fraud verification is pending."
                else:
                    status = "insufficient_evidence"
                    reason = f"No active correlation relationships or fraud events found to verify finding for {entity}."

                verifications.append({
                    "finding": finding_type,
                    "status": status,
                    "reason": reason
                })

        state.verification_results = verifications
        logger.info("Verifier Agent completed")
        return verifications
