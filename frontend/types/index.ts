export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'low' | 'medium' | 'high' | 'critical';
export type VerificationStatus = 'Verified' | 'Unverified' | 'Pending' | 'Not Verified';
export type ItemStatus = 'Open' | 'Closed' | 'In Progress' | 'Active' | 'Pending' | 'Resolved' | 'new' | 'verified' | 'investigating' | 'resolved' | 'false_positive' | 'reviewing' | 'confirmed' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface Threat {
  id: string;
  indicator: string;
  indicator_type: string;
  source: string;
  description?: string;
  severity: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ThreatCreate {
  indicator: string;
  indicator_type: string;
  source: string;
  description: string;
  severity: string;
  status: string;
}

export interface ThreatUpdate {
  indicator?: string;
  indicator_type?: string;
  source?: string;
  description?: string;
  severity?: string;
  status?: string;
}

export interface DarkWebIndicator {
  id: string;
  indicator: string;
  indicator_type: string;
  source: string;
  related_entity: string;
  description?: string;
  severity: string;
  status: string;
  discovered_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DarkWebIndicatorCreate {
  indicator: string;
  indicator_type: string;
  source: string;
  related_entity: string;
  description: string;
  severity: string;
  status: string;
  discovered_at?: string;
}

export interface DarkWebIndicatorUpdate {
  indicator?: string;
  indicator_type?: string;
  source?: string;
  related_entity?: string;
  description?: string;
  severity?: string;
  status?: string;
  discovered_at?: string;
}

export interface FraudEvent {
  id: string;
  entity_id: string;
  account_id: string;
  event_type: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  device_id?: string;
  ip_address?: string;
  wallet_id?: string;
  description: string;
  severity: string;
  status: string;
  event_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FraudEventCreate {
  entity_id: string;
  account_id: string;
  event_type: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  device_id?: string;
  ip_address?: string;
  wallet_id?: string;
  description: string;
  severity: string;
  status: string;
  event_time?: string;
}

export interface FraudEventUpdate {
  entity_id?: string;
  account_id?: string;
  event_type?: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  device_id?: string;
  ip_address?: string;
  wallet_id?: string;
  description?: string;
  severity?: string;
  status?: string;
  event_time?: string;
}

export interface Relationship {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship_type: string;
  matched_field: string;
  created_at: string;
}

export interface CorrelationRunData {
  relationships_created: number;
}

export interface FindingItem {
  type: string;
  entity: string;
  severity: string;
  observation: string;
}

export interface VerificationItem {
  finding: string;
  status: 'supported' | 'partially_supported' | 'insufficient_evidence' | string;
  reason: string;
}

export interface FraudFindingItem {
  event_id: string;
  observation: string;
  evidence: string[];
}

export interface CorrelationFindingItem {
  source: string;
  target: string;
  relationship: string;
  explanation: string;
}

export interface AIAnalysisData {
  analysis_results: FindingItem[];
  verification_results: VerificationItem[];
  fraud_results: FraudFindingItem[];
  correlation_results: CorrelationFindingItem[];
}

export interface IncidentItem {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  created_at: string;
  updated_at: string;
}

export interface IncidentCreateInput {
  title: string;
  description: string;
}

export interface InvestigationData {
  id: string;
  incident_id: string;
  summary: string;
  key_findings: string[];
  risk_explanation: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimelineEvent {
  id: string;
  incident_id: string;
  event_type: string;
  event_title: string;
  description: string;
  timestamp: string;
  source_id?: string;
}

export interface Investigation {
  id: string;
  title: string;
  risk: SeverityLevel;
  status: ItemStatus;
  created: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: SeverityLevel;
  incident: string;
  status: ItemStatus;
  created: string;
}

export interface Evidence {
  id: string;
  incident_id: string;
  evidence_type: string;
  source_id?: string;
  description: string;
  content: string;
  sha256_hash: string;
  created_at: string;
  updated_at: string;
  blockchain_status?: 'NOT_ANCHORED' | 'ANCHORED' | string;
  transaction_hash?: string;
  blockchain_timestamp?: string;
  blockchain_hash?: string;
}

export interface EvidenceCreateInput {
  incident_id: string;
  evidence_type: string;
  source_id?: string;
  description: string;
  content: string;
}

export interface EvidenceVerificationData {
  evidence_id: string;
  integrity_status: 'VERIFIED' | 'MODIFIED' | string;
  stored_hash: string;
  current_hash: string;
  message: string;
}

export interface BlockchainStatusData {
  connected: boolean;
  chain_id?: number;
  contract_loaded: boolean;
  contract_address?: string;
  rpc_url?: string;
}

export interface BlockchainAnchorData {
  evidence_id: string;
  sha256_hash: string;
  transaction_hash: string;
  blockchain_status: string;
}

export interface BlockchainVerificationData {
  evidence_id: string;
  integrity_status: 'VERIFIED' | 'MODIFIED' | 'NOT_ANCHORED' | string;
  blockchain_status: string;
  message: string;
  blockchain_hash?: string;
  current_hash?: string;
}

export interface RiskFactorScores {
  threat: number;
  dark_web: number;
  fraud: number;
  correlation: number;
  verification: number;
}

export interface RiskAnalysisData {
  id?: string;
  incident_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  factor_scores: RiskFactorScores;
  explanation: string;
  created_at?: string;
}
