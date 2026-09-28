'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  evidenceService,
  EvidenceItem,
  EvidenceVerificationData,
  BlockchainStatusData,
  BlockchainVerificationData
} from '@/services/evidenceService';
import {
  FileCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Globe,
  CreditCard,
  Network,
  Brain,
  BarChart3,
  FileText,
  Boxes,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [verifyingBlkId, setVerifyingBlkId] = useState<string | null>(null);

  const [verificationResults, setVerificationResults] = useState<Record<string, EvidenceVerificationData>>({});
  const [blkVerificationResults, setBlkVerificationResults] = useState<Record<string, BlockchainVerificationData>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatusData | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [evdRes, blkRes] = await Promise.all([
        evidenceService.getAllEvidence(),
        evidenceService.getBlockchainStatus(),
      ]);

      if (evdRes.success && evdRes.data) {
        setEvidenceList(evdRes.data);
      } else {
        setError(evdRes.message || 'Unable to load evidence items.');
      }

      if (blkRes.success && blkRes.data) {
        setBlockchainStatus(blkRes.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load evidence repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleVerifyHash = async (evidenceId: string) => {
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

  const handleAnchor = async (evidenceId: string) => {
    try {
      setAnchoringId(evidenceId);
      setError(null);
      const res = await evidenceService.anchorEvidence(evidenceId);
      if (res.success) {
        await fetchAllData();
      } else {
        setError(res.message || 'Failed to anchor evidence on blockchain.');
      }
    } catch (err: any) {
      setError(err?.message || `Error anchoring evidence ${evidenceId} on blockchain.`);
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

  const getEvidenceTypeBadge = (type: string) => {
    const t = (type || '').toUpperCase();
    switch (t) {
      case 'DARK_WEB':
        return { bg: 'bg-purple-950 text-purple-400 border-purple-800', icon: Globe };
      case 'FRAUD':
        return { bg: 'bg-rose-950 text-rose-400 border-rose-800', icon: CreditCard };
      case 'CORRELATION':
        return { bg: 'bg-zinc-950 text-zinc-400 border-zinc-800', icon: Network };
      case 'AI_FINDING':
        return { bg: 'bg-zinc-950 text-zinc-400 border-zinc-800', icon: Brain };
      case 'RISK':
        return { bg: 'bg-amber-950 text-amber-400 border-amber-800', icon: BarChart3 };
      case 'INVESTIGATION':
        return { bg: 'bg-zinc-950 text-zinc-400 border-zinc-800', icon: FileText };
      default:
        return { bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: ShieldAlert };
    }
  };

  const verifiedCount = Object.values(verificationResults).filter(
    (v) => v.integrity_status === 'VERIFIED'
  ).length;

  const anchoredCount = evidenceList.filter((e) => e.blockchain_status === 'ANCHORED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Management & Blockchain Anchoring"
        description="Preserve investigation evidence with SHA-256 hashing and immutable smart contract blockchain anchoring."
      />

      {/* Blockchain Status Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">Solidity EvidenceRegistry Smart Contract</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                blockchainStatus?.connected ? 'bg-zinc-950 text-zinc-400 border border-zinc-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {blockchainStatus?.connected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Contract: <span className="text-zinc-300">{blockchainStatus?.contract_address || 'Not loaded'}</span> | Chain ID: {blockchainStatus?.chain_id || '31337'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllData}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Records</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">{evidenceList.length}</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Anchored on Chain</span>
            <div className="text-2xl font-extrabold text-zinc-400 font-mono mt-1">{anchoredCount}</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">SHA-256 Verified</span>
            <div className="text-2xl font-extrabold text-zinc-400 font-mono mt-1">{verifiedCount}</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Tamper Alerts</span>
            <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">
              {Object.values(blkVerificationResults).filter((v) => v.integrity_status === 'MODIFIED').length}
            </div>
          </div>
          <div className="p-2.5 bg-rose-950 border border-rose-800 rounded-lg text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Evidence List Table */}
      {loading ? (
        <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Loading evidence repository & blockchain state...</p>
        </div>
      ) : evidenceList.length === 0 ? (
        <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-xl text-center space-y-3">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Evidence Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Navigate to an Incident details page to create or auto-generate evidence records.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Evidence ID & Type</th>
                  <th className="px-5 py-3.5">SHA-256 Hash</th>
                  <th className="px-5 py-3.5">Blockchain Status</th>
                  <th className="px-5 py-3.5">Transaction Hash</th>
                  <th className="px-5 py-3.5">On-Chain Integrity</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {evidenceList.map((item) => {
                  const typeBadge = getEvidenceTypeBadge(item.evidence_type);
                  const Icon = typeBadge.icon;
                  const blkStatus = item.blockchain_status || 'NOT_ANCHORED';
                  const isAnchoring = anchoringId === item.id;
                  const isVerifyingBlk = verifyingBlkId === item.id;
                  const blkResult = blkVerificationResults[item.id];

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Evidence ID & Type */}
                      <td className="px-5 py-4 space-y-1 whitespace-nowrap">
                        <div className="font-mono font-bold text-zinc-400 text-sm">{item.id}</div>
                        <span className={`px-2 py-0.5 border rounded font-mono text-[10px] font-semibold flex items-center gap-1 w-fit ${typeBadge.bg}`}>
                          <Icon className="w-3 h-3" />
                          {item.evidence_type}
                        </span>
                      </td>

                      {/* SHA-256 Hash */}
                      <td className="px-5 py-4 font-mono text-[11px]">
                        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 w-fit">
                          <span className="text-zinc-300 font-mono tracking-tight">
                            {item.sha256_hash.slice(0, 12)}...{item.sha256_hash.slice(-6)}
                          </span>
                          <button
                            onClick={() => handleCopyText(`sha-${item.id}`, item.sha256_hash)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedId === `sha-${item.id}` ? (
                              <Check className="w-3.5 h-3.5 text-zinc-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Blockchain Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {blkStatus === 'ANCHORED' ? (
                          <span className="px-2.5 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-xs font-bold font-mono flex items-center gap-1 w-fit">
                            <Lock className="w-3.5 h-3.5" />
                            ANCHORED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs font-mono font-medium">
                            NOT ANCHORED
                          </span>
                        )}
                      </td>

                      {/* Transaction Hash */}
                      <td className="px-5 py-4 font-mono text-[11px] whitespace-nowrap">
                        {item.transaction_hash ? (
                          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-fit text-zinc-300">
                            <span>{item.transaction_hash.slice(0, 10)}...{item.transaction_hash.slice(-6)}</span>
                            <button
                              onClick={() => handleCopyText(`tx-${item.id}`, item.transaction_hash!)}
                              className="text-slate-400 hover:text-white transition-colors ml-1"
                              title="Copy transaction hash"
                            >
                              {copiedId === `tx-${item.id}` ? (
                                <Check className="w-3.5 h-3.5 text-zinc-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No transaction</span>
                        )}
                      </td>

                      {/* On-Chain Integrity Verification */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {blkResult ? (
                          blkResult.integrity_status === 'VERIFIED' ? (
                            <span className="px-2.5 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-xs font-bold font-mono flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-xs font-bold font-mono flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              MODIFIED
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">Unchecked</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                        {blkStatus !== 'ANCHORED' ? (
                          <button
                            onClick={() => handleAnchor(item.id)}
                            disabled={isAnchoring}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white rounded font-medium text-xs transition-colors shadow"
                          >
                            <Boxes className={`w-3.5 h-3.5 ${isAnchoring ? 'animate-spin' : ''}`} />
                            <span>{isAnchoring ? 'Anchoring...' : 'Anchor on Blockchain'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyBlockchain(item.id)}
                            disabled={isVerifyingBlk}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white rounded font-medium text-xs transition-colors shadow"
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${isVerifyingBlk ? 'animate-spin' : ''}`} />
                            <span>{isVerifyingBlk ? 'Verifying...' : 'Verify on Blockchain'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
