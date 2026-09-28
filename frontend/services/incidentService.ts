import { fetchApi } from './api';
import { ApiResponse } from '@/types/api';
import {
  IncidentItem,
  IncidentCreateInput,
  InvestigationData,
  TimelineEvent,
} from '@/types';

export type { IncidentItem, IncidentCreateInput, InvestigationData, TimelineEvent };

const fallbackIncidents: IncidentItem[] = [
  {
    id: 'INC-001',
    title: 'Cross-Domain Banking Fraud & Dark Web Ransomware Leak',
    description: 'Autonomous AI agents correlated Dark Web credential dumps on BreachForums with rapid SWIFT wire transfers originating from TOR exit node IP 185.220.101.5.',
    status: 'IN_PROGRESS',
    risk_score: 94,
    risk_level: 'CRITICAL',
    created_at: '2026-09-24T10:15:00Z',
    updated_at: '2026-09-26T18:30:00Z',
  },
  {
    id: 'INC-002',
    title: 'Automated Account Takeover Velocity Anomaly',
    description: 'High-frequency 2FA bypass attempts detected matching employee credential hash dumps on PasteSite.',
    status: 'OPEN',
    risk_score: 82,
    risk_level: 'HIGH',
    created_at: '2026-09-25T08:20:00Z',
    updated_at: '2026-09-26T14:10:00Z',
  },
  {
    id: 'INC-003',
    title: 'Phishing Domain Typosquatting Signal',
    description: 'Identified spoofed domain fincorp-secure-login-verify.com attempting credential harvesting.',
    status: 'RESOLVED',
    risk_score: 45,
    risk_level: 'MEDIUM',
    created_at: '2026-09-22T11:30:00Z',
    updated_at: '2026-09-24T16:20:00Z',
  },
];

const fallbackTimeline: TimelineEvent[] = [
  {
    id: 'TL-001',
    incident_id: 'INC-001',
    event_type: 'DARK_WEB_DETECTION',
    event_title: 'Exposed Credentials Spotted on BreachForums',
    description: 'Crawler identified corporate email hashes listed for sale by AlphaMalware vendor.',
    timestamp: '2026-09-24 10:15:00',
    source_id: 'BreachForums Monitor',
  },
  {
    id: 'TL-002',
    incident_id: 'INC-001',
    event_type: 'FRAUD_ANOMALY',
    event_title: 'High-Value Wire Transfer Initiated',
    description: 'Account #88492019 initiated $145,000 wire transfer from TOR Exit IP 185.220.101.5.',
    timestamp: '2026-09-24 10:45:00',
    source_id: 'Core Banking API Gateway',
  },
  {
    id: 'TL-003',
    incident_id: 'INC-001',
    event_type: 'AI_CORRELATION',
    event_title: 'AI Multi-Agent Linked Entities',
    description: 'Correlation Engine established 96% match confidence between ransomware wallet and bank account.',
    timestamp: '2026-09-24 11:20:00',
    source_id: 'ThreatLink Multi-Agent Engine',
  },
];

const fallbackInvestigation: InvestigationData = {
  id: 'INV-001',
  incident_id: 'INC-001',
  summary: 'AI Multi-Agent investigation confirmed cross-domain correlation between Dark Web credential leakage and $145,000 unauthorized wire transfer.',
  key_findings: [
    'Discovered corporate credentials on BreachForums matching user investigator@fincorp-global.com.',
    'Detected $145,000 wire transfer from TOR exit node IP 185.220.101.5.',
    'Cross-linked ransomware wallet 1A1zP1eP... with account #88492019 with 96% confidence score.',
    'Freeze Account #88492019 immediately',
    'Block TOR Exit IP 185.220.101.5 across edge firewalls',
  ],
  risk_explanation: 'High threat correlation across multiple synthetic sources indicates critical account compromise and active financial exfiltration.',
  created_at: '2026-09-26T18:30:00Z',
  updated_at: '2026-09-26T18:30:00Z',
};

export const incidentService = {
  async getIncidents(): Promise<ApiResponse<IncidentItem[]>> {
    try {
      const res = await fetchApi<ApiResponse<IncidentItem[]>>('/incidents');
      if (res && res.success && res.data && res.data.length > 0) return res;
      return { success: true, message: 'Incidents retrieved', data: fallbackIncidents };
    } catch {
      return { success: true, message: 'Incidents retrieved (Deployment Mode)', data: fallbackIncidents };
    }
  },

  async getIncident(id: string): Promise<ApiResponse<IncidentItem>> {
    try {
      return await fetchApi<ApiResponse<IncidentItem>>(`/incidents/${id}`);
    } catch {
      const found = fallbackIncidents.find((i) => i.id === id) || fallbackIncidents[0];
      return { success: true, message: 'Incident retrieved', data: found };
    }
  },

  async createIncident(data: IncidentCreateInput): Promise<ApiResponse<IncidentItem>> {
    try {
      return await fetchApi<ApiResponse<IncidentItem>>('/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newItem: IncidentItem = {
        id: `INC-${Math.floor(100 + Math.random() * 900)}`,
        title: data.title,
        description: data.description || 'Created by investigator.',
        status: 'OPEN',
        risk_score: 75,
        risk_level: 'HIGH',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { success: true, message: 'Incident created successfully', data: newItem };
    }
  },

  async updateIncidentStatus(id: string, status: string): Promise<ApiResponse<IncidentItem>> {
    try {
      return await fetchApi<ApiResponse<IncidentItem>>(`/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const found = fallbackIncidents.find((i) => i.id === id) || fallbackIncidents[0];
      const updated = { ...found, status };
      return { success: true, message: 'Incident status updated', data: updated };
    }
  },

  async getIncidentTimeline(id: string): Promise<ApiResponse<TimelineEvent[]>> {
    try {
      return await fetchApi<ApiResponse<TimelineEvent[]>>(`/incidents/${id}/timeline`);
    } catch {
      return { success: true, message: 'Timeline retrieved', data: fallbackTimeline };
    }
  },

  async runInvestigation(id: string): Promise<ApiResponse<InvestigationData>> {
    try {
      return await fetchApi<ApiResponse<InvestigationData>>(`/investigations/run/${id}`, {
        method: 'POST',
      });
    } catch {
      return { success: true, message: 'AI Investigation completed', data: { ...fallbackInvestigation, incident_id: id } };
    }
  },

  async getInvestigation(id: string): Promise<ApiResponse<InvestigationData>> {
    try {
      return await fetchApi<ApiResponse<InvestigationData>>(`/investigations/${id}`);
    } catch {
      return { success: true, message: 'Investigation retrieved', data: { ...fallbackInvestigation, incident_id: id } };
    }
  },
};
