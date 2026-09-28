export * from './api';
export * from './healthService';
export * from './threatService';
export * from './darkWebService';
export * from './fraudEventService';
export * from './correlationService';
export * from './aiService';
export * from './riskService';
export * from './incidentService';
export * from './evidenceService';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
