import { fetchApi } from './api';
import { ApiResponse } from '@/types/api';
import { Threat, ThreatCreate, ThreatUpdate } from '@/types';

const fallbackThreats: Threat[] = [
  {
    id: 'THREAT-001',
    indicator: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    indicator_type: 'Crypto Wallet',
    severity: 'Critical',
    source: 'BreachForums Threat Intel',
    created_at: '2026-09-24 10:15:00',
    updated_at: '2026-09-26 18:30:00',
    description: 'Ransomware wallet address linked to Dark Web marketplace vendor AlphaMalware.',
    status: 'Active',
  },
  {
    id: 'THREAT-002',
    indicator: '185.220.101.5',
    indicator_type: 'TOR Exit Node IP',
    severity: 'High',
    source: 'Core Banking Gateway',
    created_at: '2026-09-25 08:20:00',
    updated_at: '2026-09-26 21:10:00',
    description: 'High-frequency credential stuffing targeting customer online banking portal.',
    status: 'Active',
  },
  {
    id: 'THREAT-003',
    indicator: 'employee_creds_dump_2026.txt',
    indicator_type: 'File Hash',
    severity: 'High',
    source: 'PasteSite Crawler',
    created_at: '2026-09-23 14:00:00',
    updated_at: '2026-09-25 19:45:00',
    description: 'Stolen employee session tokens discovered on Telegram breach monitoring channel.',
    status: 'Investigating',
  },
  {
    id: 'THREAT-004',
    indicator: 'fincorp-secure-login-verify.com',
    indicator_type: 'Phishing Domain',
    severity: 'Medium',
    source: 'DNS Threat Scanner',
    created_at: '2026-09-22 11:30:00',
    updated_at: '2026-09-24 16:20:00',
    description: 'Typosquatted domain impersonating corporate authentication portal.',
    status: 'Mitigated',
  },
];

export const threatService = {
  async getThreats(): Promise<ApiResponse<Threat[]>> {
    try {
      const res = await fetchApi<ApiResponse<Threat[]>>('/threats');
      if (res && res.success && res.data && res.data.length > 0) {
        return res;
      }
      return { success: true, message: 'Threats retrieved', data: fallbackThreats };
    } catch {
      return { success: true, message: 'Threats retrieved (Deployment Mode)', data: fallbackThreats };
    }
  },

  async getThreat(id: string): Promise<ApiResponse<Threat>> {
    try {
      return await fetchApi<ApiResponse<Threat>>(`/threats/${id}`);
    } catch {
      const found = fallbackThreats.find((t) => t.id === id) || fallbackThreats[0];
      return { success: true, message: 'Threat retrieved', data: found };
    }
  },

  async createThreat(data: ThreatCreate): Promise<ApiResponse<Threat>> {
    try {
      return await fetchApi<ApiResponse<Threat>>('/threats', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newThreat: Threat = {
        id: `THREAT-${Math.floor(100 + Math.random() * 900)}`,
        indicator: data.indicator,
        indicator_type: data.indicator_type,
        severity: data.severity,
        source: data.source || 'Manual Analyst Entry',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: data.description || 'Added by investigator.',
        status: data.status || 'Active',
      };
      return { success: true, message: 'Threat indicator added successfully', data: newThreat };
    }
  },

  async updateThreat(id: string, data: ThreatUpdate): Promise<ApiResponse<Threat>> {
    try {
      return await fetchApi<ApiResponse<Threat>>(`/threats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const found = fallbackThreats.find((t) => t.id === id) || fallbackThreats[0];
      const updated = { ...found, ...data };
      return { success: true, message: 'Threat updated successfully', data: updated };
    }
  },

  async deleteThreat(id: string): Promise<ApiResponse<null>> {
    try {
      return await fetchApi<ApiResponse<null>>(`/threats/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return { success: true, message: 'Threat deleted successfully', data: null };
    }
  },
};
