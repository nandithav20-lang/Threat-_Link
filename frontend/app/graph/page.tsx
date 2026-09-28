'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PageHeader } from '@/components/ui/PageHeader';
import {
  correlationService,
  Relationship,
} from '@/services/correlationService';
import {
  buildGraphNodes,
  buildGraphEdges,
  getNodeColor,
  EntityCategory,
} from '@/utils/graphBuilder';
import {
  Search,
  RefreshCw,
  Info,
  X,
  Shield,
  Globe,
  User,
  AlertTriangle,
  Building2,
  Activity,
  Smartphone,
  Wallet as WalletIcon,
  HelpCircle,
  Filter,
} from 'lucide-react';

const LEGEND_ITEMS = [
  { type: 'threat', label: 'Threat', icon: Shield, color: 'bg-amber-500' },
  { type: 'dark_web', label: 'Dark Web', icon: Globe, color: 'bg-purple-500' },
  { type: 'entity', label: 'Entity', icon: User, color: 'bg-zinc-500' },
  { type: 'fraud_event', label: 'Fraud Event', icon: AlertTriangle, color: 'bg-rose-500' },
  { type: 'account', label: 'Account', icon: Building2, color: 'bg-zinc-500' },
  { type: 'transaction', label: 'Transaction', icon: Activity, color: 'bg-zinc-500' },
  { type: 'device', label: 'Device', icon: Smartphone, color: 'bg-zinc-500' },
  { type: 'wallet', label: 'Wallet', icon: WalletIcon, color: 'bg-yellow-500' },
];

function GraphCanvas({
  rawRelationships,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  searchQuery,
  selectedCategory,
  onRunCorrelation,
  isCorrelating,
}: {
  rawRelationships: Relationship[];
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  searchQuery: string;
  selectedCategory: EntityCategory;
  onRunCorrelation: () => void;
  isCorrelating: boolean;
}) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const { fitView } = useReactFlow();

  // Filter nodes and edges based on search query & category filter
  const { filteredNodes, filteredEdges } = useMemo(() => {
    let currentNodes = [...nodes];

    // Category filter
    if (selectedCategory !== 'all') {
      currentNodes = currentNodes.filter((node) => {
        const rawType = node.data?.rawType;
        if (selectedCategory === 'threat') return rawType === 'threat';
        if (selectedCategory === 'dark_web') return rawType === 'dark_web';
        if (selectedCategory === 'entity') return rawType === 'entity';
        if (selectedCategory === 'fraud_event') return rawType === 'fraud_event';
        if (selectedCategory === 'account') return rawType === 'account';
        if (selectedCategory === 'transaction') return rawType === 'transaction';
        if (selectedCategory === 'device') return rawType === 'device';
        if (selectedCategory === 'wallet') return rawType === 'wallet';
        return true;
      });
    }

    const validNodeIds = new Set(currentNodes.map((n) => n.id));

    // Highlight or filter by Search Query
    const q = searchQuery.trim().toLowerCase();
    currentNodes = currentNodes.map((node) => {
      const matchesSearch =
        q.length > 0 &&
        (node.id.toLowerCase().includes(q) ||
          String(node.data?.label || '').toLowerCase().includes(q));

      if (matchesSearch) {
        return {
          ...node,
          style: {
            ...node.style,
            boxShadow: '0 0 25px 6px #38bdf8',
            borderColor: '#38bdf8',
            borderWidth: '3px',
          },
        };
      }
      return node;
    });

    // Valid edges for visible nodes
    const currentEdges = edges.filter(
      (edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
    );

    return { filteredNodes: currentNodes, filteredEdges: currentEdges };
  }, [nodes, edges, searchQuery, selectedCategory]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const selectedNodeRelationships = useMemo(() => {
    if (!selectedNode) return [];
    return rawRelationships.filter(
      (rel) => rel.source_id === selectedNode.id || rel.target_id === selectedNode.id
    );
  }, [selectedNode, rawRelationships]);

  const selectedEdgeDetail = useMemo(() => {
    if (!selectedEdge) return null;
    return rawRelationships.find(
      (rel) =>
        (rel.source_id === selectedEdge.source && rel.target_id === selectedEdge.target) ||
        (rel.source_id === selectedEdge.target && rel.target_id === selectedEdge.source)
    );
  }, [selectedEdge, rawRelationships]);

  return (
    <div className="relative w-full h-[650px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 !fill-slate-300 rounded-lg overflow-hidden shadow-lg" />
        <MiniMap
          nodeColor={(node) => {
            const rawType = node.data?.rawType || 'unknown';
            return getNodeColor(rawType).hex;
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-900/90 !border-slate-800 rounded-lg"
        />
      </ReactFlow>

      {/* Detail Overlay Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md z-10 text-slate-200 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-400" />
              Entity Details
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Entity ID</span>
              <span className="font-mono text-sm font-semibold text-zinc-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                {selectedNode.id}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Entity Type</span>
              <span className="capitalize font-medium text-slate-200 bg-slate-800/80 px-2 py-1 rounded inline-block">
                {selectedNode.data?.rawType?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">
                Connected Relationships ({selectedNodeRelationships.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedNodeRelationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="p-2 bg-slate-950 rounded border border-slate-800/80 text-[11px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono text-zinc-300">{rel.relationship_type}</span>
                      <span>{rel.matched_field}</span>
                    </div>
                    <div className="text-slate-300 font-mono">
                      {rel.source_id === selectedNode.id ? (
                        <>→ {rel.target_id} ({rel.target_type})</>
                      ) : (
                        <>← {rel.source_id} ({rel.source_type})</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEdge && selectedEdgeDetail && (
        <div className="absolute top-4 right-4 w-80 bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md z-10 text-slate-200 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Relationship Details
            </h3>
            <button
              onClick={() => setSelectedEdge(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Relationship Type</span>
              <span className="font-mono text-sm font-semibold text-purple-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                {selectedEdgeDetail.relationship_type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Matched Field</span>
              <span className="font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                {selectedEdgeDetail.matched_field}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Source ({selectedEdgeDetail.source_type})</span>
                <span className="font-mono text-zinc-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 block truncate">
                  {selectedEdgeDetail.source_id}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Target ({selectedEdgeDetail.target_type})</span>
                <span className="font-mono text-zinc-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 block truncate">
                  {selectedEdgeDetail.target_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThreatCorrelationGraphPage() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrelating, setIsCorrelating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<EntityCategory>('all');

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await correlationService.getRelationships();
      if (res.success && res.data) {
        setRelationships(res.data);

        const generatedNodes = buildGraphNodes(res.data);
        const nodeIds = new Set(generatedNodes.map((n) => n.id));
        const generatedEdges = buildGraphEdges(res.data, nodeIds);

        setNodes(generatedNodes);
        setEdges(generatedEdges);
      } else {
        setError(res.message || 'Unable to load correlation graph. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load correlation graph. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const handleRunCorrelation = async () => {
    try {
      setIsCorrelating(true);
      setStatusMessage('Running correlation...');
      setError(null);

      const res = await correlationService.runCorrelation();
      if (res.success) {
        setStatusMessage('Correlation completed. Graph updated.');
        await fetchGraphData();
      } else {
        setError(res.message || 'Unable to run correlation.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to run correlation.');
    } finally {
      setIsCorrelating(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Threat Correlation Graph"
        description="Visual representation of connected threat and fraud entities."
      />

      {/* Status / Message Banners */}
      {statusMessage && (
        <div className="p-3 bg-zinc-950/60 border border-zinc-800 text-zinc-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl backdrop-blur-sm shadow-md">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search graph (e.g. EMP001, DWI-001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EntityCategory)}
              aria-label="Filter entity category"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-zinc-500"
            >
              <option value="all">All Categories</option>
              <option value="threat">Threats</option>
              <option value="dark_web">Dark Web</option>
              <option value="entity">Entities</option>
              <option value="fraud_event">Fraud Events</option>
              <option value="account">Accounts</option>
              <option value="transaction">Transactions</option>
              <option value="device">Devices</option>
              <option value="wallet">Wallets</option>
            </select>
          </div>
        </div>

        {/* Run Correlation Trigger */}
        <button
          onClick={handleRunCorrelation}
          disabled={isCorrelating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCorrelating ? 'animate-spin' : ''}`} />
          <span>{isCorrelating ? 'Running correlation...' : 'Run Correlation'}</span>
        </button>
      </div>

      {/* Main Canvas Area */}
      {loading ? (
        <div className="h-[650px] bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Loading threat correlation graph...</p>
        </div>
      ) : relationships.length === 0 ? (
        <div className="h-[400px] bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-600" />
          <h3 className="text-base font-semibold text-slate-200">No relationships found.</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Run correlation after adding threat, Dark Web, or fraud data to generate connected entity node networks.
          </p>
          <button
            onClick={handleRunCorrelation}
            disabled={isCorrelating}
            className="mt-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Run Correlation Now
          </button>
        </div>
      ) : (
        <ReactFlowProvider>
          <GraphCanvas
            rawRelationships={relationships}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onRunCorrelation={handleRunCorrelation}
            isCorrelating={isCorrelating}
          />
        </ReactFlowProvider>
      )}

      {/* Legend */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Node Legend
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {LEGEND_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                className="flex items-center gap-2 p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-xs"
              >
                <div className={`p-1 rounded ${item.color} text-slate-950`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-300 font-medium truncate">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
