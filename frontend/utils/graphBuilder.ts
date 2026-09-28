import { Relationship } from '@/services/correlationService';
import { Node, Edge } from 'reactflow';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export type EntityCategory =
  | 'all'
  | 'threat'
  | 'dark_web'
  | 'entity'
  | 'fraud_event'
  | 'account'
  | 'transaction'
  | 'device'
  | 'wallet';

export function getNodeType(id: string, customType?: string): string {
  if (customType) {
    const norm = customType.toLowerCase();
    if (norm.includes('dark_web')) return 'dark_web';
    if (norm.includes('fraud')) return 'fraud_event';
    if (norm.includes('threat')) return 'threat';
    if (norm.includes('entity') || norm.includes('emp')) return 'entity';
    if (norm.includes('account')) return 'account';
    if (norm.includes('transaction') || norm.includes('txn')) return 'transaction';
    if (norm.includes('device')) return 'device';
    if (norm.includes('wallet')) return 'wallet';
  }

  const upper = id.toUpperCase();
  if (upper.startsWith('DWI-')) return 'dark_web';
  if (upper.startsWith('FRAUD-')) return 'fraud_event';
  if (upper.startsWith('THREAT-')) return 'threat';
  if (upper.startsWith('EMP')) return 'entity';
  if (upper.startsWith('ACC-')) return 'account';
  if (upper.startsWith('TXN-')) return 'transaction';
  if (upper.startsWith('DEVICE-') || upper.startsWith('DEV-')) return 'device';
  if (upper.startsWith('WALLET-') || upper.startsWith('0X')) return 'wallet';

  return 'unknown';
}

export function getNodeLabel(type: string, id: string): string {
  switch (type) {
    case 'threat':
      return `Threat: ${id}`;
    case 'dark_web':
      return `Dark Web: ${id}`;
    case 'entity':
      return `Entity: ${id}`;
    case 'fraud_event':
      return `Fraud: ${id}`;
    case 'account':
      return `Account: ${id}`;
    case 'transaction':
      return `Transaction: ${id}`;
    case 'device':
      return `Device: ${id}`;
    case 'wallet':
      return `Wallet: ${id}`;
    default:
      return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${id}`;
  }
}

export function getNodeColor(type: string): { bg: string; border: string; text: string; hex: string } {
  switch (type) {
    case 'threat':
      return { bg: 'bg-amber-950/80', border: 'border-amber-500', text: 'text-amber-300', hex: '#f59e0b' };
    case 'dark_web':
      return { bg: 'bg-purple-950/80', border: 'border-purple-500', text: 'text-purple-300', hex: '#a855f7' };
    case 'entity':
      return { bg: 'bg-zinc-950/80', border: 'border-zinc-500', text: 'text-zinc-300', hex: '#e4e4e7' };
    case 'fraud_event':
      return { bg: 'bg-rose-950/80', border: 'border-rose-500', text: 'text-rose-300', hex: '#f43f5e' };
    case 'account':
      return { bg: 'bg-zinc-950/80', border: 'border-zinc-500', text: 'text-zinc-300', hex: '#e4e4e7' };
    case 'transaction':
      return { bg: 'bg-zinc-950/80', border: 'border-zinc-500', text: 'text-zinc-300', hex: '#e4e4e7' };
    case 'device':
      return { bg: 'bg-zinc-950/80', border: 'border-zinc-500', text: 'text-zinc-300', hex: '#6366f1' };
    case 'wallet':
      return { bg: 'bg-yellow-950/80', border: 'border-yellow-500', text: 'text-yellow-300', hex: '#eab308' };
    default:
      return { bg: 'bg-slate-900', border: 'border-slate-600', text: 'text-slate-300', hex: '#64748b' };
  }
}

export function buildGraphNodes(relationships: Relationship[]): Node[] {
  const nodeMap = new Map<string, { id: string; type: string }>();

  relationships.forEach((rel) => {
    if (rel.source_id && !nodeMap.has(rel.source_id)) {
      nodeMap.set(rel.source_id, {
        id: rel.source_id,
        type: getNodeType(rel.source_id, rel.source_type),
      });
    }
    if (rel.target_id && !nodeMap.has(rel.target_id)) {
      nodeMap.set(rel.target_id, {
        id: rel.target_id,
        type: getNodeType(rel.target_id, rel.target_type),
      });
    }
  });

  const typeLayers: Record<string, number> = {
    threat: 0,
    dark_web: 0,
    entity: 1,
    fraud_event: 2,
    account: 3,
    device: 3,
    transaction: 3,
    wallet: 3,
    unknown: 4,
  };

  const layerCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

  const nodes: Node[] = Array.from(nodeMap.values()).map((nodeItem) => {
    const layer = typeLayers[nodeItem.type] ?? 4;
    const indexInLayer = layerCounts[layer]++;
    const colors = getNodeColor(nodeItem.type);

    const x = 120 + indexInLayer * 280;
    const y = 80 + layer * 160;

    return {
      id: nodeItem.id,
      type: 'default',
      position: { x, y },
      data: {
        label: getNodeLabel(nodeItem.type, nodeItem.id),
        rawType: nodeItem.type,
        rawId: nodeItem.id,
      },
      style: {
        background: colors.bg.includes('bg-') ? '#0f172a' : colors.bg,
        backgroundColor: '#0f172a',
        color: colors.hex,
        borderColor: colors.hex,
        borderWidth: '2px',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '13px',
        fontWeight: '600',
        width: 220,
        boxShadow: `0 4px 14px 0 ${colors.hex}33`,
      },
    };
  });

  return nodes;
}

export function buildGraphEdges(relationships: Relationship[], existingNodeIds: Set<string>): Edge[] {
  const edgeSet = new Set<string>();
  const edges: Edge[] = [];

  relationships.forEach((rel, index) => {
    // Edge validation: check source and target exist
    if (!existingNodeIds.has(rel.source_id) || !existingNodeIds.has(rel.target_id)) {
      return; // Skip invalid edge
    }

    const edgeKey = `${rel.source_id}_${rel.target_id}_${rel.relationship_type}`;
    const reverseKey = `${rel.target_id}_${rel.source_id}_${rel.relationship_type}`;

    if (edgeSet.has(edgeKey) || edgeSet.has(reverseKey)) {
      return; // Prevent duplicate edges
    }

    edgeSet.add(edgeKey);

    edges.push({
      id: `edge-${rel.id || index}-${rel.source_id}-${rel.target_id}`,
      source: rel.source_id,
      target: rel.target_id,
      label: rel.relationship_type,
      animated: true,
      style: { stroke: '#38bdf8', strokeWidth: 2 },
      labelStyle: { fill: '#94a3b8', fontSize: 11, fontWeight: 500 },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9, rx: 4, ry: 4 },
      labelBgPadding: [6, 4],
    });
  });

  return edges;
}
