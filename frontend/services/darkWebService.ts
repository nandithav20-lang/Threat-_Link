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

const STORAGE_KEY = 'threatlink_custom_darkweb';

function getStoredDarkWeb(): DarkWebIndicator[] {
  if (typeof window === 'undefined') return fallbackDarkWeb;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackDarkWeb));
      return fallbackDarkWeb;
    }
    return JSON.parse(raw);
  } catch {
    return fallbackDarkWeb;
  }
}

function saveStoredDarkWeb(items: DarkWebIndicator[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save dark web items to localStorage:', err);
  }
}

export const darkWebService = {
  async getDarkWebIndicators(): Promise<ApiResponse<DarkWebIndicator[]>> {
    const local = getStoredDarkWeb();
    try {
      const res = await fetchApi<ApiResponse<DarkWebIndicator[]>>('/dark-web');
      if (res && res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const apiIds = new Set(res.data.map((d) => d.id));
        const customItems = local.filter((d) => !apiIds.has(d.id));
        const merged = [...customItems, ...res.data];
        saveStoredDarkWeb(merged);
        return { success: true, message: 'Indicators retrieved', data: merged };
      }
      return { success: true, message: 'Indicators retrieved', data: local };
    } catch {
      return { success: true, message: 'Indicators retrieved', data: local };
    }
  },

  async getDarkWebIndicator(id: string): Promise<ApiResponse<DarkWebIndicator>> {
    const list = getStoredDarkWeb();
    try {
      const res = await fetchApi<ApiResponse<DarkWebIndicator>>(`/dark-web/${id}`);
      if (res && res.success && res.data) return res;
      const found = list.find((d) => d.id === id) || list[0];
      return { success: true, message: 'Indicator retrieved', data: found };
    } catch {
      const found = list.find((d) => d.id === id) || list[0];
      return { success: true, message: 'Indicator retrieved', data: found };
    }
  },

  async createDarkWebIndicator(data: DarkWebIndicatorCreate): Promise<ApiResponse<DarkWebIndicator>> {
    const list = getStoredDarkWeb();
    const newItem: DarkWebIndicator = {
      id: `DW-${Math.floor(100 + Math.random() * 900)}`,
      indicator: data.indicator.trim(),
      indicator_type: data.indicator_type,
      source: data.source ? data.source.trim() : 'Dark Web Crawler',
      related_entity: data.related_entity ? data.related_entity.trim() : 'EMP001',
      severity: data.severity || 'high',
      status: data.status || 'new',
      discovered_at: new Date().toISOString(),
      description: data.description ? data.description.trim() : 'Added by analyst.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetchApi<ApiResponse<DarkWebIndicator>>('/dark-web', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.success && res.data) {
        const createdObj = res.data.indicator ? res.data : { ...newItem, ...res.data };
        const updatedList = [createdObj, ...list];
        saveStoredDarkWeb(updatedList);
        return { success: true, message: 'Dark web indicator added', data: createdObj };
      }
    } catch {
      // Fallback
    }

    const updatedList = [newItem, ...list];
    saveStoredDarkWeb(updatedList);
    return { success: true, message: 'Dark web indicator added', data: newItem };
  },

  async updateDarkWebIndicator(id: string, data: DarkWebIndicatorUpdate): Promise<ApiResponse<DarkWebIndicator>> {
    const list = getStoredDarkWeb();
    const index = list.findIndex((d) => d.id === id);

    let updated: DarkWebIndicator;
    if (index !== -1) {
      updated = { ...list[index], ...data, updated_at: new Date().toISOString() };
      list[index] = updated;
      saveStoredDarkWeb(list);
    } else {
      updated = { ...list[0], id, ...data, updated_at: new Date().toISOString() };
    }

    try {
      await fetchApi<ApiResponse<DarkWebIndicator>>(`/dark-web/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // Ignore API error
    }

    return { success: true, message: 'Indicator updated', data: updated };
  },

  async deleteDarkWebIndicator(id: string): Promise<ApiResponse<null>> {
    const list = getStoredDarkWeb();
    const filtered = list.filter((d) => d.id !== id);
    saveStoredDarkWeb(filtered);

    try {
      await fetchApi<ApiResponse<null>>(`/dark-web/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore API error
    }

    return { success: true, message: 'Indicator deleted', data: null };
  },
};
