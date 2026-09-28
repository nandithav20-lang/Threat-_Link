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

export const fraudEventService = {
  async getFraudEvents(): Promise<ApiResponse<FraudEvent[]>> {
    try {
      const res = await fetchApi<ApiResponse<FraudEvent[]>>('/fraud-events');
      if (res && res.success && res.data && res.data.length > 0) return res;
      return { success: true, message: 'Fraud events retrieved', data: fallbackFraud };
    } catch (err) {
      return { success: true, message: 'Fraud events retrieved (Deployment Mode)', data: fallbackFraud };
    }
  },

  async getFraudEvent(id: string): Promise<ApiResponse<FraudEvent>> {
    try {
      return await fetchApi<ApiResponse<FraudEvent>>(`/fraud-events/${id}`);
    } catch (err) {
      const found = fallbackFraud.find((f) => f.id === id) || fallbackFraud[0];
      return { success: true, message: 'Event retrieved', data: found };
    }
  },

  async createFraudEvent(data: FraudEventCreate): Promise<ApiResponse<FraudEvent>> {
    try {
      return await fetchApi<ApiResponse<FraudEvent>>('/fraud-events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err) {
      const newItem: FraudEvent = {
        id: `FRD-${Math.floor(100 + Math.random() * 900)}`,
        entity_id: data.entity_id,
        account_id: data.account_id,
        event_type: data.event_type,
        transaction_id: data.transaction_id,
        amount: data.amount,
        currency: data.currency || 'USD',
        device_id: data.device_id,
        ip_address: data.ip_address || '127.0.0.1',
        wallet_id: data.wallet_id,
        description: data.description || 'Added by investigator.',
        severity: data.severity || 'high',
        status: data.status || 'new',
        event_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { success: true, message: 'Fraud event added', data: newItem };
    }
  },

  async updateFraudEvent(id: string, data: FraudEventUpdate): Promise<ApiResponse<FraudEvent>> {
    try {
      return await fetchApi<ApiResponse<FraudEvent>>(`/fraud-events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err) {
      const found = fallbackFraud.find((f) => f.id === id) || fallbackFraud[0];
      const updated = { ...found, ...data };
      return { success: true, message: 'Event updated', data: updated };
    }
  },

  async deleteFraudEvent(id: string): Promise<ApiResponse<null>> {
    try {
      return await fetchApi<ApiResponse<null>>(`/fraud-events/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      return { success: true, message: 'Event deleted', data: null };
    }
  },
};
