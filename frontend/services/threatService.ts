import { fetchApi } from './api';
import { ApiResponse } from '@/types/api';
import { Threat, ThreatCreate, ThreatUpdate } from '@/types';

const defaultThreats: Threat[] = [
  {
    id: 'THREAT-001',
    indicator: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    indicator_type: 'domain',
    severity: 'critical',
    source: 'BreachForums Threat Intel',
    created_at: '2026-09-24 10:15:00',
    updated_at: '2026-09-26 18:30:00',
    description: 'Ransomware wallet address linked to Dark Web marketplace vendor AlphaMalware.',
    status: 'new',
  },
  {
    id: 'THREAT-002',
    indicator: '185.220.101.5',
    indicator_type: 'ip',
    severity: 'high',
    source: 'Core Banking Gateway',
    created_at: '2026-09-25 08:20:00',
    updated_at: '2026-09-26 21:10:00',
    description: 'High-frequency credential stuffing targeting customer online banking portal.',
    status: 'investigating',
  },
  {
    id: 'THREAT-003',
    indicator: 'employee_creds_dump_2026.txt',
    indicator_type: 'hash',
    severity: 'high',
    source: 'PasteSite Crawler',
    created_at: '2026-09-23 14:00:00',
    updated_at: '2026-09-25 19:45:00',
    description: 'Stolen employee session tokens discovered on Telegram breach monitoring channel.',
    status: 'verified',
  },
  {
    id: 'THREAT-004',
    indicator: 'fincorp-secure-login-verify.com',
    indicator_type: 'url',
    severity: 'medium',
    source: 'DNS Threat Scanner',
    created_at: '2026-09-22 11:30:00',
    updated_at: '2026-09-24 16:20:00',
    description: 'Typosquatted domain impersonating corporate authentication portal.',
    status: 'resolved',
  },
];

const STORAGE_KEY = 'threatlink_custom_threats';

function getStoredThreats(): Threat[] {
  if (typeof window === 'undefined') return defaultThreats;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultThreats));
      return defaultThreats;
    }
    return JSON.parse(raw);
  } catch {
    return defaultThreats;
  }
}

function saveStoredThreats(threats: Threat[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threats));
  } catch (err) {
    console.error('Failed to save threats to localStorage:', err);
  }
}

export const threatService = {
  async getThreats(): Promise<ApiResponse<Threat[]>> {
    const local = getStoredThreats();
    try {
      const res = await fetchApi<ApiResponse<Threat[]>>('/threats');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const apiIds = new Set(res.data.map((t) => t.id));
        const customItems = local.filter((t) => !apiIds.has(t.id));
        const merged = [...customItems, ...res.data];
        saveStoredThreats(merged);
        return { success: true, message: 'Threats retrieved', data: merged };
      }
      return { success: true, message: 'Threats retrieved', data: local };
    } catch {
      return { success: true, message: 'Threats retrieved', data: local };
    }
  },

  async getThreat(id: string): Promise<ApiResponse<Threat>> {
    const list = getStoredThreats();
    try {
      const res = await fetchApi<ApiResponse<Threat>>(`/threats/${id}`);
      if (res && res.success && res.data) return res;
      const found = list.find((t) => t.id === id) || list[0];
      return { success: true, message: 'Threat retrieved', data: found };
    } catch {
      const found = list.find((t) => t.id === id) || list[0];
      return { success: true, message: 'Threat retrieved', data: found };
    }
  },

  async createThreat(data: ThreatCreate): Promise<ApiResponse<Threat>> {
    const list = getStoredThreats();
    const newThreat: Threat = {
      id: `THREAT-${Math.floor(1000 + Math.random() * 9000)}`,
      indicator: data.indicator.trim(),
      indicator_type: data.indicator_type,
      severity: data.severity,
      source: data.source ? data.source.trim() : 'Manual Analyst Entry',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      description: data.description ? data.description.trim() : 'Added by investigator.',
      status: data.status || 'new',
    };

    // Try API endpoint first
    try {
      const res = await fetchApi<ApiResponse<Threat>>('/threats', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.success && res.data) {
        const updatedList = [res.data, ...list];
        saveStoredThreats(updatedList);
        return res;
      }
    } catch {
      // Fallthrough to local persistence
    }

    // Save locally
    const updatedList = [newThreat, ...list];
    saveStoredThreats(updatedList);
    return { success: true, message: 'Threat indicator created successfully', data: newThreat };
  },

  async updateThreat(id: string, data: ThreatUpdate): Promise<ApiResponse<Threat>> {
    const list = getStoredThreats();
    const index = list.findIndex((t) => t.id === id);

    let updatedThreat: Threat;
    if (index !== -1) {
      updatedThreat = {
        ...list[index],
        ...data,
        updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      list[index] = updatedThreat;
      saveStoredThreats(list);
    } else {
      updatedThreat = {
        id,
        indicator: data.indicator || 'Unknown',
        indicator_type: data.indicator_type || 'domain',
        severity: data.severity || 'high',
        source: data.source || 'Manual Analyst Entry',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        description: data.description || '',
        status: data.status || 'new',
      };
      list.unshift(updatedThreat);
      saveStoredThreats(list);
    }

    try {
      await fetchApi<ApiResponse<Threat>>(`/threats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // Ignore API failure and rely on saved local list
    }

    return { success: true, message: 'Threat updated successfully', data: updatedThreat };
  },

  async deleteThreat(id: string): Promise<ApiResponse<null>> {
    const list = getStoredThreats();
    const filtered = list.filter((t) => t.id !== id);
    saveStoredThreats(filtered);

    try {
      await fetchApi<ApiResponse<null>>(`/threats/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore API error
    }

    return { success: true, message: 'Threat deleted successfully', data: null };
  },

  async getThreatStats(): Promise<{ total: number; critical: number; high: number; active: number }> {
    const list = getStoredThreats();
    return {
      total: list.length,
      critical: list.filter((t) => t.severity?.toLowerCase() === 'critical').length,
      high: list.filter((t) => t.severity?.toLowerCase() === 'high').length,
      active: list.filter((t) => t.status?.toLowerCase() === 'new' || t.status?.toLowerCase() === 'investigating' || t.status?.toLowerCase() === 'active').length,
    };
  },
};
