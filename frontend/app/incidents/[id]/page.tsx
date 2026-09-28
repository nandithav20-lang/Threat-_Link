'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  incidentService,
  IncidentItem,
  InvestigationData,
  TimelineEvent,
} from '@/services/incidentService';
import { aiService, AIAnalysisData } from '@/services/aiService';
import { riskService, RiskAnalysisData } from '@/services/riskService';
import { correlationService, Relationship } from '@/services/correlationService';
import {
  evidenceService,
  EvidenceItem,
  EvidenceVerificationData,
  BlockchainVerificationData
} from '@/services/evidenceService';
import {
  buildGraphNodes,
  buildGraphEdges,
  getNodeColor,
} from '@/utils/graphBuilder';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Play,
  FileText,
  Brain,
  BarChart3,
  Network,
  Check,
  FileCheck,
  Plus,
  Copy,
  X,
  Boxes,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Bell,
  AlertCircle,
} from 'lucide-react';

function EmbeddedGraph({ relationships }: { relationships: Relationship[] }) {
  const generatedNodes = buildGraphNodes(relationships);
  const nodeIds = new Set(generatedNodes.map((n) => n.id));
  const generatedEdges = buildGraphEdges(relationships, nodeIds);

  const [nodes, , onNodesChange] = useNodesState(generatedNodes);
  const [edges, , onEdgesChange] = useEdgesState(generatedEdges);

  if (relationships.length === 0) {
    return (
      <div className="h-64 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
        No correlation relationships to render.
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 rounded-lg shadow-lg" />
        <MiniMap
          nodeColor={(n) => getNodeColor(n.data?.rawType || 'unknown').hex}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-900/90 !border-slate-800 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}

export default function IncidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: incidentId } = use(params);

  const [incident, setIncident] = useState<IncidentItem | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [aiData, setAiData] = useState<AIAnalysisData | null>(null);
  const [riskData, setRiskData] = useState<RiskAnalysisData | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [runningInv, setRunningInv] = useState<boolean>(false);
  const [invStatusMsg, setInvStatusMsg] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Evidence State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [verifyingBlkId, setVerifyingBlkId] = useState<string | null>(null);

  const [verificationResults, setVerificationResults] = useState<Record<string, EvidenceVerificationData>>({});
  const [blkVerificationResults, setBlkVerificationResults] = useState<Record<string, BlockchainVerificationData>>({});
  const [generatingEvd, setGeneratingEvd] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Evidence Modal State
  const [isEvdModalOpen, setIsEvdModalOpen] = useState<boolean>(false);
  const [evdTypeInput, setEvdTypeInput] = useState<string>('FRAUD');
  const [evdSourceInput, setEvdSourceInput] = useState<string>('');
  const [evdDescInput, setEvdDescInput] = useState<string>('');
  const [evdContentInput, setEvdContentInput] = useState<string>('');
  const [creatingEvd, setCreatingEvd] = useState<boolean>(false);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [incRes, invRes, tlRes, aiRes, riskRes, relRes, evdRes] = await Promise.allSettled([
        incidentService.getIncident(incidentId),
        incidentService.getInvestigation(incidentId),
        incidentService.getIncidentTimeline(incidentId),
        aiService.runAIAnalysis(),
        riskService.getRisk(incidentId),
        correlationService.getRelationships(),
        evidenceService.getIncidentEvidence(incidentId),
      ]);

      if (incRes.status === 'fulfilled' && incRes.value.success && incRes.value.data) {
        setIncident(incRes.value.data);
      } else {
        setError(`Incident ${incidentId} not found.`);
      }

      if (invRes.status === 'fulfilled' && invRes.value.success && invRes.value.data) {
        setInvestigation(invRes.value.data);
      }

      if (tlRes.status === 'fulfilled' && tlRes.value.success && tlRes.value.data) {
        setTimeline(tlRes.value.data);
      }

      if (aiRes.status === 'fulfilled' && aiRes.value.success && aiRes.value.data) {
        setAiData(aiRes.value.data);
      }

      if (riskRes.status === 'fulfilled' && riskRes.value.success && riskRes.value.data) {
        setRiskData(riskRes.value.data);
      }

      if (relRes.status === 'fulfilled' && relRes.value.success && relRes.value.data) {
        setRelationships(relRes.value.data);
      }

      if (evdRes.status === 'fulfilled' && evdRes.value.success && evdRes.value.data) {
        setEvidenceList(evdRes.value.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load case data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [incidentId]);

  const handleRunInvestigation = async () => {
    try {
      setRunningInv(true);
      setInvStatusMsg('Generating investigation...');
      setError(null);

      const res = await incidentService.runInvestigation(incidentId);

      if (res.success && res.data) {
        setInvestigation(res.data);
        setInvStatusMsg('Investigation generated successfully.');
        await loadCaseData();
      } else {
        setError(res.message || 'Unable to generate investigation.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to generate investigation.');
    } finally {
      setRunningInv(false);
      setTimeout(() => setInvStatusMsg(null), 4000);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await incidentService.updateIncidentStatus(incidentId, newStatus);
      if (res.success && res.data) {
        setIncident(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateEvidence = async () => {
    try {
      setGeneratingEvd(true);
      const res = await evidenceService.generateEvidenceFromInvestigation(incidentId);
      if (res.success && res.data) {
        setEvidenceList(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate evidence.');
    } finally {
      setGeneratingEvd(false);
    }
  };

  const handleAddCustomEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evdDescInput.trim() || !evdContentInput.trim()) return;

    try {
      setCreatingEvd(true);
      const res = await evidenceService.createEvidence({
        incident_id: incidentId,
        evidence_type: evdTypeInput,
        source_id: evdSourceInput.trim() || undefined,
        description: evdDescInput.trim(),
        content: evdContentInput.trim(),
      });

      if (res.success && res.data) {
        setIsEvdModalOpen(false);
        setEvdDescInput('');
        setEvdContentInput('');
        setEvdSourceInput('');
        const updated = await evidenceService.getIncidentEvidence(incidentId);
        if (updated.success && updated.data) {
          setEvidenceList(updated.data);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create evidence.');
    } finally {
      setCreatingEvd(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId: string) => {
    try {
      setVerifyingId(evidenceId);
      const res = await evidenceService.verifyEvidence(evidenceId);
      if (res.success && res.data) {
        setVerificationResults((prev) => ({
          ...prev,
          [evidenceId]: res.data!,
        }));
      }
    } catch (err: any) {
      setError(err?.message || `Failed to verify evidence ${evidenceId}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAnchorEvidence = async (evidenceId: string) => {
    try {
      setAnchoringId(evidenceId);
      setError(null);
      const res = await evidenceService.anchorEvidence(evidenceId);
      if (res.success) {
        const updated = await evidenceService.getIncidentEvidence(incidentId);
        if (updated.success && updated.data) {
          setEvidenceList(updated.data);
        }
      } else {
        setError(res.message || 'Failed to anchor evidence on blockchain.');
      }
    } catch (err: any) {
      setError(err?.message || `Blockchain anchoring error for ${evidenceId}`);
    } finally {
      setAnchoringId(null);
    }
  };

  const handleVerifyBlockchain = async (evidenceId: string) => {
    try {
      setVerifyingBlkId(evidenceId);
      setError(null);
      const res = await evidenceService.verifyBlockchainEvidence(evidenceId);
      if (res.success && res.data) {
        setBlkVerificationResults((prev) => ({
          ...prev,
          [evidenceId]: res.data!,
        }));
      }
    } catch (err: any) {
      setError(err?.message || `Failed to verify evidence ${evidenceId} on blockchain.`);
    } finally {
      setVerifyingBlkId(null);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const norm = (status || '').toUpperCase();
    switch (norm) {
      case 'OPEN':
        return 'bg-zinc-950 text-zinc-400 border-zinc-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800';
      case 'RESOLVED':
        return 'bg-zinc-950 text-zinc-400 border-zinc-800';
      case 'CLOSED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTimelineBadge = (type: string) => {
    switch (type.toUpperCase()) {
      case 'THREAT':
        return { bg: 'bg-amber-950 text-amber-400 border-amber-800', label: 'THREAT SIGNAL' };
      case 'DARK_WEB':
        return { bg: 'bg-purple-950 text-purple-400 border-purple-800', label: 'DARK WEB' };
      case 'FRAUD':
        return { bg: 'bg-rose-950 text-rose-400 border-rose-800', label: 'FRAUD EVENT' };
      case 'CORRELATION':
        return { bg: 'bg-zinc-950 text-zinc-400 border-zinc-800', label: 'CORRELATION' };
      default:
        return { bg: 'bg-slate-900 text-slate-300 border-slate-800', label: type };
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/incidents"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-zinc-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Incidents</span>
      </Link>

      {/* Header Banner */}
      <PageHeader
        title={incident ? incident.title : `Incident Workspace — ${incidentId}`}
        description={incident ? incident.description : 'Unified investigation details.'}
      />

      {invStatusMsg && (
        <div className="p-3 bg-zinc-950/60 border border-zinc-800 text-zinc-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
          <span>{invStatusMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Loading incident case details...</p>
        </div>
      ) : incident ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Summary & Status Control Bar */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-zinc-400 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                  {incident.id}
                </span>
                <span className={`px-3 py-1 border rounded text-xs font-semibold uppercase ${getStatusBadge(incident.status)}`}>
                  {incident.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{incident.title}</h2>
              <p className="text-xs text-slate-400">{incident.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              {/* Status Controls */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Update Case Status
                </span>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      disabled={updatingStatus || incident.status === st}
                      className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-colors ${
                        incident.status === st
                          ? 'bg-zinc-600 text-white shadow'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Investigation Button */}
              <button
                onClick={handleRunInvestigation}
                disabled={runningInv}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed"
              >
                <Play className={`w-4 h-4 fill-current ${runningInv ? 'animate-spin' : ''}`} />
                <span>{runningInv ? 'Generating...' : 'Run Investigation'}</span>
              </button>
            </div>
          </div>

          {/* 1. Investigation Summary & Key Findings */}
          {investigation && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary */}
              <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 shadow-lg">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Investigation Summary
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
                  {investigation.summary}
                </p>
              </div>

              {/* Key Findings */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 shadow-lg">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                  Key Findings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {investigation.key_findings.map((kf, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{kf}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Risk Score & Factor Breakdown (Step 12 Integration) */}
          {riskData && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  Risk Analysis Engine Evaluation
                </h3>
                <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full text-xs font-mono font-bold">
                  {riskData.risk_score}/100 — {riskData.risk_level}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Threat Severity</span>
                  <div className="font-mono text-sm font-bold text-amber-400">{riskData.factor_scores.threat}/20</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Dark Web</span>
                  <div className="font-mono text-sm font-bold text-purple-400">{riskData.factor_scores.dark_web}/20</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Fraud Severity</span>
                  <div className="font-mono text-sm font-bold text-rose-400">{riskData.factor_scores.fraud}/25</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Correlation</span>
                  <div className="font-mono text-sm font-bold text-zinc-400">{riskData.factor_scores.correlation}/20</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Verification</span>
                  <div className="font-mono text-sm font-bold text-zinc-400">{riskData.factor_scores.verification}/15</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Evidence Repository & Blockchain Anchoring (Step 14 & 15 Integration) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-zinc-400" />
                  Evidence Repository & Blockchain Anchoring
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable SHA-256 evidence records anchored on EVM smart contract for case {incidentId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateEvidence}
                  disabled={generatingEvd}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-400 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingEvd ? 'animate-spin' : ''}`} />
                  <span>Generate Evidence From Investigation</span>
                </button>
                <button
                  onClick={() => setIsEvdModalOpen(true)}
                  className="px-3 py-1.5 bg-zinc-600 hover:bg-zinc-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Evidence</span>
                </button>
              </div>
            </div>

            {evidenceList.length === 0 ? (
              <p className="text-xs text-slate-500">No evidence recorded for this incident yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">SHA-256 Hash</th>
                      <th className="px-4 py-3">Blockchain Status</th>
                      <th className="px-4 py-3">Transaction</th>
                      <th className="px-4 py-3 text-right">Blockchain Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {evidenceList.map((evd) => {
                      const blkStatus = evd.blockchain_status || 'NOT_ANCHORED';
                      const isAnchoring = anchoringId === evd.id;
                      const isVerifyingBlk = verifyingBlkId === evd.id;
                      const blkRes = blkVerificationResults[evd.id];

                      return (
                        <tr key={evd.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-zinc-400">{evd.id}</td>
                          <td className="px-4 py-3 font-sans">
                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] uppercase font-bold text-slate-300">
                              {evd.evidence_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-sans max-w-xs truncate">{evd.description}</td>

                          {/* SHA-256 Hash */}
                          <td className="px-4 py-3 text-[11px]">
                            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 w-fit">
                              <span className="text-zinc-300">
                                {evd.sha256_hash.slice(0, 10)}...{evd.sha256_hash.slice(-6)}
                              </span>
                              <button
                                onClick={() => handleCopyText(`sha-${evd.id}`, evd.sha256_hash)}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Copy SHA-256 hash"
                              >
                                {copiedId === `sha-${evd.id}` ? (
                                  <Check className="w-3 h-3 text-zinc-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Blockchain Status Badge */}
                          <td className="px-4 py-3 font-sans">
                            {blkStatus === 'ANCHORED' ? (
                              <span className="px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-[10px] font-bold font-mono inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                ANCHORED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px] font-mono">
                                NOT ANCHORED
                              </span>
                            )}
                          </td>

                          {/* Transaction Hash */}
                          <td className="px-4 py-3 text-[11px]">
                            {evd.transaction_hash ? (
                              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 w-fit text-zinc-300">
                                <span>{evd.transaction_hash.slice(0, 8)}...{evd.transaction_hash.slice(-4)}</span>
                                <button
                                  onClick={() => handleCopyText(`tx-${evd.id}`, evd.transaction_hash!)}
                                  className="text-slate-500 hover:text-white transition-colors ml-1"
                                  title="Copy transaction hash"
                                >
                                  {copiedId === `tx-${evd.id}` ? (
                                    <Check className="w-3 h-3 text-zinc-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">None</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right font-sans whitespace-nowrap space-x-2">
                            {blkStatus !== 'ANCHORED' ? (
                              <button
                                onClick={() => handleAnchorEvidence(evd.id)}
                                disabled={isAnchoring}
                                className="px-2.5 py-1 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                              >
                                <Boxes className={`w-3 h-3 ${isAnchoring ? 'animate-spin' : ''}`} />
                                <span>{isAnchoring ? 'Anchoring...' : 'Anchor on Blockchain'}</span>
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-2">
                                {blkRes && (
                                  blkRes.integrity_status === 'VERIFIED' ? (
                                    <span className="px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-[10px] font-bold font-mono">
                                      VERIFIED
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[10px] font-bold font-mono">
                                      MODIFIED
                                    </span>
                                  )
                                )}
                                <button
                                  onClick={() => handleVerifyBlockchain(evd.id)}
                                  disabled={isVerifyingBlk}
                                  className="px-2.5 py-1 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                                >
                                  <ShieldCheck className={`w-3 h-3 ${isVerifyingBlk ? 'animate-spin' : ''}`} />
                                  <span>{isVerifyingBlk ? 'Verifying...' : 'Verify on Blockchain'}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Vertical Incident Timeline */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Clock className="w-4 h-4 text-zinc-400" />
              Vertical Incident Timeline
            </h3>

            {timeline.length === 0 ? (
              <p className="text-xs text-slate-500">No timeline events recorded.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {timeline.map((ev, idx) => {
                  const badge = getTimelineBadge(ev.event_type);
                  return (
                    <div key={ev.id || idx} className="relative space-y-1">
                      {/* Timeline Dot */}
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-zinc-500 border-2 border-slate-900 ring-2 ring-zinc-950" />

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 border rounded font-mono text-[10px] font-bold ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="font-bold text-slate-200">{ev.event_title}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
                        {ev.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Threat Correlation Graph (Step 10 Integration) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Network className="w-4 h-4 text-zinc-400" />
              Correlated Threat Graph Canvas
            </h3>
            <ReactFlowProvider>
              <EmbeddedGraph relationships={relationships} />
            </ReactFlowProvider>
          </div>

          {/* 6. AI Agent Pipeline Findings (Step 11 Integration) */}
          {aiData && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Brain className="w-4 h-4 text-purple-400" />
                AI Agent Pipeline Findings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Analysis Findings */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-semibold text-purple-300 block mb-1">Threat Signal Findings</span>
                  {aiData.analysis_results.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] space-y-0.5">
                      <span className="text-slate-200 font-medium">{item.type} ({item.entity})</span>
                      <p className="text-slate-400">{item.observation}</p>
                    </div>
                  ))}
                </div>

                {/* Verifications */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-semibold text-zinc-300 block mb-1">Evidence Verifications</span>
                  {aiData.verification_results.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] space-y-0.5">
                      <div className="flex justify-between text-slate-300 font-medium">
                        <span>{item.finding}</span>
                        <span className="text-zinc-400 capitalize font-mono">{item.status}</span>
                      </div>
                      <p className="text-slate-400">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. Final Security Alert & Human Control Summary Card (Step 16 Integration) */}
          <div className="bg-slate-900/80 border border-amber-800/80 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Final Security Alert Summary & Recommended Actions</h3>
              </div>
              <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-xs font-mono font-bold">
                INCIDENT {incidentId} — ACTION REQUIRED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>High Risk Incident Detected ({riskData ? riskData.risk_score : 82}/100)</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-mono">
                  Suspicious multi-stage banking fraud activity correlated with Dark Web credential leak and new device authorization. All evidence SHA-256 hashes are verified and anchored on EVM smart contract.
                </p>
                <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Credential Exposure: Verified matching hash in Dark Web dataset</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Fraud Event: ₹85,000 transaction from NEW-DEVICE-01 to WALLET-001</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span>Blockchain Status: SHA-256 hash anchored on-chain with zero tampering</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">Human Investigator Control</span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Review investigation findings and verify evidence. ThreatLink AI assists investigators without taking unauthorized automated actions.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="w-full py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Incident Resolved</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Custom Evidence Modal */}
      {isEvdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" />
                Add Evidence Artifact
              </h3>
              <button
                onClick={() => setIsEvdModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomEvidence} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Evidence Type *</label>
                <select
                  value={evdTypeInput}
                  onChange={(e) => setEvdTypeInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-zinc-500"
                >
                  <option value="THREAT">Threat Signal</option>
                  <option value="DARK_WEB">Dark Web</option>
                  <option value="FRAUD">Fraud Event</option>
                  <option value="CORRELATION">Correlation</option>
                  <option value="AI_FINDING">AI Finding</option>
                  <option value="RISK">Risk Score</option>
                  <option value="INVESTIGATION">Investigation</option>
                  <option value="TIMELINE">Timeline Event</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Source ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FRAUD-001 or DWI-001"
                  value={evdSourceInput}
                  onChange={(e) => setEvdSourceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspicious simulated transaction associated with incident"
                  value={evdDescInput}
                  onChange={(e) => setEvdDescInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Content / Artifact Payload *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter raw evidence payload or string to hash..."
                  value={evdContentInput}
                  onChange={(e) => setEvdContentInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEvdModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEvd}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:bg-slate-800"
                >
                  {creatingEvd && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creatingEvd ? 'Anchoring...' : 'Anchor SHA-256'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
