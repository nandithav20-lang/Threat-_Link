export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface HealthData {
  database: 'connected' | 'disconnected' | string;
}

export interface DatabaseHealthData {
  database: string;
  status: 'connected' | 'disconnected' | string;
}
