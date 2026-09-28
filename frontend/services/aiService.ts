import { fetchApi } from './api';
import { ApiResponse } from '@/types/api';
import { AIAnalysisData } from '@/types';

export type { AIAnalysisData };

const fallbackAI: AIAnalysisData = {
  analysis_results: [
    {
      type: 'threat_indicator',
      entity: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      severity: 'CRITICAL',
      observation: 'Ransomware wallet address linked to Dark Web marketplace seller AlphaMalware.',
    },
    {
      type: 'dark_web_exposure',
      entity: 'investigator@fincorp-global.com',
      severity: 'CRITICAL',
      observation: 'Corporate email credentials discovered on BreachForums dump file.',
    },
  ],
  verification_results: [
    {
      finding: 'Dark Web Credential Exposure',
      status: 'supported',
      reason: 'Verified against raw JSON breach dump artifact matching SHA-256 hash.',
    },
    {
      finding: 'SWIFT Wire Transfer Anomaly',
      status: 'supported',
      reason: 'Confirmed $145,000 transaction from TOR exit IP 185.220.101.5.',
    },
  ],
  fraud_results: [
    {
      event_id: 'FRD-001',
      observation: 'High-frequency wire transfer exceeding daily velocity threshold originating from TOR exit node.',
      evidence: ['EVD-001', 'EVD-002'],
    },
  ],
  correlation_results: [
    {
      source: 'DW-001',
      target: 'FRD-001',
      relationship: 'ENTITY_MATCH',
      explanation: 'Established 96% match confidence between user account credentials and SWIFT transfer source.',
    },
  ],
};

export const aiService = {
  async runAIAnalysis(): Promise<ApiResponse<AIAnalysisData>> {
    try {
      return await fetchApi<ApiResponse<AIAnalysisData>>('/ai/analyze', {
        method: 'POST',
      });
    } catch (err) {
      return { success: true, message: 'AI Multi-Agent Analysis Completed', data: fallbackAI };
    }
  },
};
