import logging
from typing import Dict, Any
from app.ai.state import AIState
from app.ai.agents.collector import CollectorAgent
from app.ai.agents.analyzer import AnalyzerAgent
from app.ai.agents.verifier import VerifierAgent
from app.ai.agents.fraud_analyzer import FraudAnalyzerAgent
from app.ai.agents.correlation_analyzer import CorrelationAnalyzerAgent

logger = logging.getLogger("threatlink.ai.pipeline")

def run_ai_pipeline() -> Dict[str, Any]:
    """
    Executes the 5 AI agents sequentially:
    Collector -> Analyzer -> Verifier -> Fraud Analyzer -> Correlation Analyzer
    """
    logger.info("AI pipeline started")
    state = AIState()

    # 1. Collector Agent
    collector = CollectorAgent()
    collector.run(state)
    logger.info("Collector completed")

    # 2. Analyzer Agent
    analyzer = AnalyzerAgent()
    analyzer.run(state)
    logger.info("Analyzer completed")

    # 3. Verifier Agent
    verifier = VerifierAgent()
    verifier.run(state)
    logger.info("Verifier completed")

    # 4. Fraud Analyzer Agent
    fraud_analyzer = FraudAnalyzerAgent()
    fraud_analyzer.run(state)
    logger.info("Fraud analyzer completed")

    # 5. Correlation Analyzer Agent
    correlation_analyzer = CorrelationAnalyzerAgent()
    correlation_analyzer.run(state)
    logger.info("Correlation analyzer completed")

    logger.info("AI pipeline completed")

    return {
        "analysis_results": state.analysis_results,
        "verification_results": state.verification_results,
        "fraud_results": state.fraud_results,
        "correlation_results": state.correlation_results,
    }
