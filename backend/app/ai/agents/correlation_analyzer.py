import logging
import json
from typing import List, Dict, Any
from app.ai.state import AIState
from app.ai.llm import call_llm
from app.ai.prompts.correlation_prompt import CORRELATION_SYSTEM_PROMPT

logger = logging.getLogger("threatlink.ai.correlation_analyzer")

class CorrelationAnalyzerAgent:
    def run(self, state: AIState) -> List[Dict[str, Any]]:
        logger.info("Correlation Analyzer Agent started")
        
        user_prompt = json.dumps({
            "relationships": state.relationships
        })

        llm_response = call_llm(CORRELATION_SYSTEM_PROMPT, user_prompt)

        if llm_response and "correlation_findings" in llm_response and isinstance(llm_response["correlation_findings"], list):
            correlation_findings = llm_response["correlation_findings"]
        else:
            correlation_findings = []
            for rel in state.relationships:
                source = rel.get("source_id", "SOURCE")
                target = rel.get("target_id", "TARGET")
                rel_type = rel.get("relationship_type", "related")
                matched_field = rel.get("matched_field", "identifier")

                explanation = f"Record {source} and record {target} are linked via matching {matched_field} ({rel_type})."

                correlation_findings.append({
                    "source": source,
                    "target": target,
                    "relationship": rel_type,
                    "explanation": explanation
                })

        state.correlation_results = correlation_findings
        logger.info("Correlation Analyzer Agent completed")
        return correlation_findings
