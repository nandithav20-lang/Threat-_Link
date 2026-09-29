'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { incidentService, IncidentItem } from '@/services/incidentService';
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await incidentService.getIncidents();
      if (res.success && res.data) {
        setIncidents(res.data);
      } else {
        setError(res.message || 'Unable to load incidents.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !descInput.trim()) return;

    try {
      setCreating(true);
      setCreateError(null);

      const res = await incidentService.createIncident({
        title: titleInput.trim(),
        description: descInput.trim(),
      });

      if (res.success && res.data) {
        setIsModalOpen(false);
        setTitleInput('');
        setDescInput('');
        const newInc = res.data;
        setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
        await fetchIncidents();
      } else {
        setCreateError(res.message || 'Unable to create incident.');
      }
    } catch (err: any) {
      setCreateError(err?.message || 'Unable to create incident.');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const norm = (status || '').toUpperCase();
    switch (norm) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-xs font-semibold uppercase">
            OPEN
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 bg-yellow-950 text-yellow-400 border border-yellow-800 rounded text-xs font-semibold uppercase">
            IN PROGRESS
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-xs font-semibold uppercase">
            RESOLVED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-xs font-semibold uppercase">
            CLOSED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs font-semibold uppercase">
            {norm}
          </span>
        );
    }
  };

  const getRiskBadge = (level: string, score: number) => {
    const norm = (level || '').toUpperCase();
    let color = 'bg-slate-800 text-slate-400 border-slate-700';
    if (norm === 'CRITICAL') color = 'bg-rose-950 text-rose-400 border-rose-800';
    else if (norm === 'HIGH') color = 'bg-amber-950 text-amber-400 border-amber-800';
    else if (norm === 'MEDIUM') color = 'bg-yellow-950 text-yellow-400 border-yellow-800';
    else if (norm === 'LOW') color = 'bg-zinc-950 text-zinc-400 border-zinc-800';

    return (
      <span className={`px-2.5 py-0.5 border rounded text-xs font-mono font-bold flex items-center gap-1 w-fit ${color}`}>
        <span>{score}/100</span>
        <span>•</span>
        <span>{norm}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents & Case Management"
        description="Unified security incident workspace combining Threat Intelligence, Dark Web findings, Banking Fraud, Graph Correlation, AI Findings, and Risk Scoring."
      />

      {/* Action Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-950 border border-zinc-700/50 rounded-lg text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Active Security Cases</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {incidents.length} Registered Incidents
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create Incident</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Incident List Table */}
      {loading ? (
        <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Loading incidents...</p>
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-xl text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Incidents Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click &quot;Create Incident&quot; above to initialize a new security case workspace.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Title & Description</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Risk Score</th>
                  <th className="px-5 py-3.5">Created At</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-zinc-400 whitespace-nowrap">
                      {inc.id}
                    </td>
                    <td className="px-5 py-4 space-y-0.5">
                      <div className="font-semibold text-slate-100 text-sm">{inc.title}</div>
                      <div className="text-slate-400 line-clamp-1 text-[11px] max-w-md">
                        {inc.description}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(inc.status)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getRiskBadge(inc.risk_level, inc.risk_score)}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(inc.created_at).toLocaleDateString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white rounded transition-colors font-medium text-xs"
                      >
                        <span>View Case</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-400" />
                Create New Security Incident
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Incident Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspicious Access — EMP001"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide investigation scope and initial context..."
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:bg-slate-800"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{creating ? 'Creating...' : 'Create Case'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
