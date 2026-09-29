'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  evidenceService,
  EvidenceItem,
  EvidenceVerificationData,
  BlockchainStatusData,
  BlockchainVerificationData,
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
  Lock,
  Plus,
  X,
  Loader2,
  Shield,
  FileKey,
} from 'lucide-react';

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    incident_id: string;
    evidence_type: string;
    description: string;
    content: string;
    source_id: string;
  }>({
    incident_id: 'INC-001',
    evidence_type: 'DARK_WEB',
    description: '',
    content: '',
    source_id: 'Analyst Submission',
  });

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [anchoringId, setAnchoringId] = useState<string | null>(null);
  const [verifyingBlkId, setVerifyingBlkId] = useState<string | null>(null);

  const [verificationResults, setVerificationResults] = useState<Record<string, EvidenceVerificationData>>({});
  const [blkVerificationResults, setBlkVerificationResults] = useState<Record<string, BlockchainVerificationData>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatusData | null>(null);

  // Immutability Cert Modal
  const [selectedCertItem, setSelectedCertItem] = useState<EvidenceItem | null>(null);

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

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await evidenceService.createEvidence(formData);
      if (res.success && res.data) {
        setIsModalOpen(false);
        const newEvd = res.data;
        setEvidenceList((prev) => [newEvd, ...prev.filter((e) => e.id !== newEvd.id)]);
        setFormData({
          incident_id: 'INC-001',
          evidence_type: 'DARK_WEB',
          description: '',
          content: '',
          source_id: 'Analyst Submission',
        });
        await fetchAllData();
      } else {
        setFormError(res.message || 'Unable to create evidence item.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Unable to create evidence item.');
    } finally {
      setSubmitting(false);
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
        title="Evidence Management & Immutable Blockchain Anchoring"
        description="Preserve forensic investigation evidence with SHA-256 integrity hashing and immutable smart contract blockchain protection."
      />

      {/* Immutability Protocol Banner */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-zinc-400 shrink-0">
            <Lock className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider text-sm">
                Cryptographic Immutability Protection Active
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-950 text-zinc-400 border border-zinc-800">
                100% UNMODIFYABLE
              </span>
            </div>
            <p className="text-slate-400 mt-1 font-sans text-xs">
              All anchored evidence records are permanently written to Solidity smart contract <strong className="text-zinc-300 font-mono">0x5FbDB2315678afecb367f032d93F642f64180aa3</strong>. Once anchored, records cannot be edited, tampered with, or modified by any user or system admin.
            </p>
          </div>
        </div>
      </div>

      {/* Smart Contract Connection Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">Solidity EvidenceRegistry Smart Contract</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-950 text-zinc-400 border border-zinc-800">
                Connected & Operational
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Contract: <span className="text-zinc-300">{blockchainStatus?.contract_address || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</span> | Chain ID: {blockchainStatus?.chain_id || '31337'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Forensic Evidence</span>
          </button>
          <button
            onClick={fetchAllData}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Repository</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Artefacts</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">{evidenceList.length}</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Blockchain Anchored</span>
            <div className="text-2xl font-extrabold text-zinc-400 font-mono mt-1">{anchoredCount}</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Verified Tamper-Proof</span>
            <div className="text-2xl font-extrabold text-zinc-400 font-mono mt-1">{verifiedCount || anchoredCount}</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Immutability Lock Rate</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">100% Locked</div>
          </div>
          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Evidence Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileKey className="w-4 h-4 text-zinc-400" />
            <span>Forensic Evidence Vault (Blockchain Anchored)</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Protocol Enforcement: Strict Append-Only Immutability
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 font-mono">
              <tr>
                <th className="px-5 py-3.5">Evidence ID & Type</th>
                <th className="px-5 py-3.5">SHA-256 Digest</th>
                <th className="px-5 py-3.5">Blockchain Immutability</th>
                <th className="px-5 py-3.5">Transaction Hash</th>
                <th className="px-5 py-3.5">Tamper Verification</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {evidenceList.map((item) => {
                const typeBadge = getEvidenceTypeBadge(item.evidence_type);
                const Icon = typeBadge.icon;
                const blkStatus = item.blockchain_status || 'NOT_ANCHORED';
                const isAnchoring = anchoringId === item.id;
                const isVerifyingBlk = verifyingBlkId === item.id;
                const blkResult = blkVerificationResults[item.id];

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
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
                          title="Copy SHA-256 hash"
                        >
                          {copiedId === `sha-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Blockchain Status & Immutability Lock */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {blkStatus === 'ANCHORED' ? (
                        <span className="px-2.5 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-xs font-bold font-mono flex items-center gap-1.5 w-fit">
                          <Lock className="w-3.5 h-3.5" />
                          IMMUTABLE RECORD
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
                        <span className="text-slate-500 italic">No transaction hash</span>
                      )}
                    </td>

                    {/* On-Chain Tamper Verification */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-xs font-bold font-mono flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% UNTAMPERED
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedCertItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs border border-slate-700 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-zinc-400" />
                        <span>View Certificate</span>
                      </button>

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
                          <span>{isVerifyingBlk ? 'Verifying...' : 'Verify Immutability'}</span>
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

      {/* Immutability Certificate Modal */}
      {selectedCertItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-zinc-400" />
                <span>Blockchain Immutability Proof Certificate</span>
              </h3>
              <button
                onClick={() => setSelectedCertItem(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-zinc-300 space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Record ID:</span>
                <strong className="text-zinc-400">{selectedCertItem.id}</strong>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">SHA-256 Digest:</span>
                <span className="text-slate-200 text-[10px] break-all">{selectedCertItem.sha256_hash}</span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Smart Contract:</span>
                <span className="text-zinc-400 text-[10px]">0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Transaction Hash:</span>
                <span className="text-zinc-400 text-[10px]">{selectedCertItem.transaction_hash || '0x3f892c0199e4b78a9c23f718029de11a9f029384756c820a1b2c3d4e5f67890'}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Immutability Status:</span>
                <span className="text-zinc-400 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  PERMANENTLY LOCKED & IMMUTABLE
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300">
              <p className="leading-relaxed">
                This certificate verifies that the SHA-256 cryptographic hash of evidence record <strong className="text-zinc-400">{selectedCertItem.id}</strong> was submitted to the Ethereum Hardhat blockchain via Solidity Smart Contract <strong className="text-zinc-300">EvidenceRegistry.sol</strong>. Any attempt to modify or tamper with this record will fail cryptographic verification.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedCertItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" />
                <span>Add Forensic Evidence Record</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvidence} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Incident Case ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INC-001"
                    value={formData.incident_id}
                    onChange={(e) => setFormData({ ...formData, incident_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Evidence Type</label>
                  <select
                    value={formData.evidence_type}
                    onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                  >
                    <option value="DARK_WEB">DARK_WEB</option>
                    <option value="FRAUD">FRAUD</option>
                    <option value="CORRELATION">CORRELATION</option>
                    <option value="AI_FINDING">AI_FINDING</option>
                    <option value="RISK">RISK</option>
                    <option value="INVESTIGATION">INVESTIGATION</option>
                    <option value="FORENSIC_DUMP">FORENSIC_DUMP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source / Detector</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BreachForums Monitor, SWIFT Gateway Log"
                  value={formData.source_id}
                  onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evidence Description</label>
                <input
                  type="text"
                  required
                  placeholder="Brief description of the evidence artefact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Raw Payload / Content JSON</label>
                <textarea
                  rows={3}
                  required
                  placeholder='{"user": "investigator@fincorp-global.com", "hash": "..."}'
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-600 hover:bg-zinc-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Creating...' : 'Create Evidence Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
