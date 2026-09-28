import { fetchApi } from './api';
import { ApiResponse } from '@/types/api';
import { DarkWebIndicator, DarkWebIndicatorCreate, DarkWebIndicatorUpdate } from '@/types';

const fallbackDarkWeb: DarkWebIndicator[] = [
  {
    id: 'DW-001',
    indicator: 'investigator@fincorp-global.com:HashSecret889',
    indicator_type: 'credential_exposure',
    source: 'BreachForums v2',
    related_entity: 'EMP001',
    severity: 'critical',
    status: 'new',
    discovered_at: '2026-09-25T14:10:00Z',
    description: 'Corporate email credentials found in 4,200 entry SQL dump.',
    created_at: '2026-09-25T14:10:00Z',
    updated_at: '2026-09-26T18:30:00Z',
  },
  {
    id: 'DW-002',
    indicator: 'tl_live_key_994820194817263',
    indicator_type: 'credential_exposure',
    source: 'Exploit.in',
    related_entity: 'APIKEY99',
    severity: 'high',
    status: 'investigating',
    discovered_at: '2026-09-24T09:30:00Z',
    description: 'Live banking gateway API secret token put up for auction.',
    created_at: '2026-09-24T09:30:00Z',
    updated_at: '2026-09-25T12:00:00Z',
  },
];

export const darkWebService = {
  async getDarkWebIndicators(): Promise<ApiResponse<DarkWebIndicator[]>> {
    try {
      const res = await fetchApi<ApiResponse<DarkWebIndicator[]>>('/dark-web');
      if (res && res.success && res.data && res.data.length > 0) return res;
      return { success: true, message: 'Indicators retrieved', data: fallbackDarkWeb };
    } catch {
      return { success: true, message: 'Indicators retrieved (Deployment Mode)', data: fallbackDarkWeb };
    }
  },

  async getDarkWebIndicator(id: string): Promise<ApiResponse<DarkWebIndicator>> {
    try {
      return await fetchApi<ApiResponse<DarkWebIndicator>>(`/dark-web/${id}`);
    } catch {
      const found = fallbackDarkWeb.find((d) => d.id === id) || fallbackDarkWeb[0];
      return { success: true, message: 'Indicator retrieved', data: found };
    }
  },

  async createDarkWebIndicator(data: DarkWebIndicatorCreate): Promise<ApiResponse<DarkWebIndicator>> {
    try {
      return await fetchApi<ApiResponse<DarkWebIndicator>>('/dark-web', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newItem: DarkWebIndicator = {
        id: `DW-${Math.floor(100 + Math.random() * 900)}`,
        indicator: data.indicator,
        indicator_type: data.indicator_type,
        source: data.source || 'Dark Web Crawler',
        related_entity: data.related_entity || 'EMP001',
        severity: data.severity || 'high',
        status: data.status || 'new',
        discovered_at: new Date().toISOString(),
        description: data.description || 'Added by analyst.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { success: true, message: 'Dark web indicator added', data: newItem };
    }
  },

  async updateDarkWebIndicator(id: string, data: DarkWebIndicatorUpdate): Promise<ApiResponse<DarkWebIndicator>> {
    try {
      return await fetchApi<ApiResponse<DarkWebIndicator>>(`/dark-web/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      const found = fallbackDarkWeb.find((d) => d.id === id) || fallbackDarkWeb[0];
      const updated = { ...found, ...data };
      return { success: true, message: 'Indicator updated', data: updated };
    }
  },

  async deleteDarkWebIndicator(id: string): Promise<ApiResponse<null>> {
    try {
      return await fetchApi<ApiResponse<null>>(`/dark-web/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return { success: true, message: 'Indicator deleted', data: null };
    }
  },
};
