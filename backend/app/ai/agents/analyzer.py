import logging
import json
from typing import List, Dict, Any
from app.ai.state import AIState
from app.ai.llm import call_llm
from app.ai.prompts.analyzer_prompt import ANALYZER_SYSTEM_PROMPT

logger = logging.getLogger("threatlink.ai.analyzer")

class AnalyzerAgent:
    def run(self, state: AIState) -> List[Dict[str, Any]]:
        logger.info("Analyzer Agent started")
        
        user_prompt = json.dumps({
            "threats": state.threats,
            "dark_web_indicators": state.dark_web_indicators
        })

        llm_response = call_llm(ANALYZER_SYSTEM_PROMPT, user_prompt)

        if llm_response and "findings" in llm_response and isinstance(llm_response["findings"], list):
            findings = llm_response["findings"]
        else:
            # Deterministic fallback finding generation
            findings = []
            for dwi in state.dark_web_indicators:
                entity = dwi.get("related_entity") or "Unknown Entity"
                indicator = dwi.get("indicator") or dwi.get("id", "DWI")
                severity = dwi.get("severity", "medium")
                obs = f"Dark Web indicator {indicator} associated with entity {entity}."
                findings.append({
                    "type": dwi.get("indicator_type", "credential_exposure"),
                    "entity": entity,
                    "severity": severity,
                    "observation": obs
                })

            for t in state.threats:
                entity = t.get("indicator", "Threat Indicator")
                severity = t.get("severity", "medium")
                obs = f"Observed threat signal {t.get('indicator')} ({t.get('threat_type')})."
                findings.append({
                    "type": t.get("threat_type", "threat_signal"),
                    "entity": entity,
                    "severity": severity,
                    "observation": obs
                })

        state.analysis_results = findings
        logger.info("Analyzer Agent completed")
        return findings
