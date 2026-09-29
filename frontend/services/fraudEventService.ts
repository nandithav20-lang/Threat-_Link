import { fetchApi } from './api';
import { ApiResponse } from '@/types/api';
import { FraudEvent, FraudEventCreate, FraudEventUpdate } from '@/types';

const fallbackFraud: FraudEvent[] = [
  {
    id: 'FRD-001',
    entity_id: 'EMP001',
    account_id: 'ACC-88492019',
    event_type: 'unusual_transaction',
    transaction_id: 'TXN-SWIFT-991',
    amount: 145000,
    currency: 'USD',
    device_id: 'DEV-ZURICH-01',
    ip_address: '185.220.101.5',
    wallet_id: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    description: 'Rapid wire transfer exceeding daily velocity threshold originating from TOR exit node.',
    severity: 'critical',
    status: 'new',
    event_time: '2026-09-26T22:15:00Z',
    created_at: '2026-09-26T22:15:00Z',
    updated_at: '2026-09-26T22:15:00Z',
  },
  {
    id: 'FRD-002',
    entity_id: 'EMP002',
    account_id: 'ACC-99201844',
    event_type: 'suspicious_login',
    transaction_id: 'TXN-SWIFT-992',
    amount: 49000,
    currency: 'USD',
    device_id: 'DEV-RO-99',
    ip_address: '194.26.29.11',
    wallet_id: '185.220.101.5',
    description: 'Device fingerprint mismatch with 5 consecutive failed PIN entries.',
    severity: 'high',
    status: 'reviewing',
    event_time: '2026-09-25T18:40:00Z',
    created_at: '2026-09-25T18:40:00Z',
    updated_at: '2026-09-25T18:40:00Z',
  },
];

const STORAGE_KEY = 'threatlink_custom_fraud';

function getStoredFraudEvents(): FraudEvent[] {
  if (typeof window === 'undefined') return fallbackFraud;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackFraud));
      return fallbackFraud;
    }
    return JSON.parse(raw);
  } catch {
    return fallbackFraud;
  }
}

function saveStoredFraudEvents(items: FraudEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save fraud events to localStorage:', err);
  }
}

export const fraudEventService = {
  async getFraudEvents(): Promise<ApiResponse<FraudEvent[]>> {
    const local = getStoredFraudEvents();
    try {
      const res = await fetchApi<ApiResponse<FraudEvent[]>>('/fraud-events');
      if (res && res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const apiIds = new Set(res.data.map((f) => f.id));
        const customItems = local.filter((f) => !apiIds.has(f.id));
        const merged = [...customItems, ...res.data];
        saveStoredFraudEvents(merged);
        return { success: true, message: 'Fraud events retrieved', data: merged };
      }
      return { success: true, message: 'Fraud events retrieved', data: local };
    } catch {
      return { success: true, message: 'Fraud events retrieved', data: local };
    }
  },

  async getFraudEvent(id: string): Promise<ApiResponse<FraudEvent>> {
    const list = getStoredFraudEvents();
    try {
      const res = await fetchApi<ApiResponse<FraudEvent>>(`/fraud-events/${id}`);
      if (res && res.success && res.data) return res;
      const found = list.find((f) => f.id === id) || list[0];
      return { success: true, message: 'Event retrieved', data: found };
    } catch {
      const found = list.find((f) => f.id === id) || list[0];
      return { success: true, message: 'Event retrieved', data: found };
    }
  },

  async createFraudEvent(data: FraudEventCreate): Promise<ApiResponse<FraudEvent>> {
    const list = getStoredFraudEvents();
    const newItem: FraudEvent = {
      id: `FRD-${Math.floor(100 + Math.random() * 900)}`,
      entity_id: data.entity_id ? data.entity_id.trim() : 'EMP001',
      account_id: data.account_id ? data.account_id.trim() : 'ACC-990001',
      event_type: data.event_type,
      transaction_id: data.transaction_id ? data.transaction_id.trim() : `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      device_id: data.device_id ? data.device_id.trim() : 'DEV-UNKNOWN',
      ip_address: data.ip_address ? data.ip_address.trim() : '127.0.0.1',
      wallet_id: data.wallet_id ? data.wallet_id.trim() : undefined,
      description: data.description ? data.description.trim() : 'Added by investigator.',
      severity: data.severity || 'high',
      status: data.status || 'new',
      event_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetchApi<ApiResponse<FraudEvent>>('/fraud-events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.success && res.data) {
        const createdObj = res.data.event_type ? res.data : { ...newItem, ...res.data };
        const updatedList = [createdObj, ...list];
        saveStoredFraudEvents(updatedList);
        return { success: true, message: 'Fraud event added', data: createdObj };
      }
    } catch {
      // Fallback
    }

    const updatedList = [newItem, ...list];
    saveStoredFraudEvents(updatedList);
    return { success: true, message: 'Fraud event added', data: newItem };
  },

  async updateFraudEvent(id: string, data: FraudEventUpdate): Promise<ApiResponse<FraudEvent>> {
    const list = getStoredFraudEvents();
    const index = list.findIndex((f) => f.id === id);

    let updated: FraudEvent;
    if (index !== -1) {
      updated = { ...list[index], ...data, updated_at: new Date().toISOString() };
      list[index] = updated;
      saveStoredFraudEvents(list);
    } else {
      updated = { ...list[0], id, ...data, updated_at: new Date().toISOString() };
    }

    try {
      await fetchApi<ApiResponse<FraudEvent>>(`/fraud-events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // Ignore API error
    }

    return { success: true, message: 'Event updated', data: updated };
  },

  async deleteFraudEvent(id: string): Promise<ApiResponse<null>> {
    const list = getStoredFraudEvents();
    const filtered = list.filter((f) => f.id !== id);
    saveStoredFraudEvents(filtered);

    try {
      await fetchApi<ApiResponse<null>>(`/fraud-events/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore API error
    }

    return { success: true, message: 'Event deleted', data: null };
  },
};
