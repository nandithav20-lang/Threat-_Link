'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { correlationService } from '@/services/correlationService';
import { Relationship } from '@/types';
import {
  Play,
  Network,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle2,
  UserCheck,
  ArrowRight
} from 'lucide-react';

export default function CorrelationPage() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Entity search state
  const [searchEntity, setSearchEntity] = useState<string>('EMP001');
  const [entityRels, setEntityRels] = useState<Relationship[]>([]);
  const [entityLoading, setEntityLoading] = useState<boolean>(false);

  const fetchRelationships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await correlationService.getRelationships();
      if (res && res.success && Array.isArray(res.data)) {
        setRelationships(res.data);
      } else {
        setError('Unable to load relationships from backend.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load relationships.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEntityRelationships = useCallback(async (entityId: string) => {
    if (!entityId.trim()) return;
    setEntityLoading(true);
    try {
      const res = await correlationService.getEntityRelationships(entityId.trim());
      if (res && res.success && Array.isArray(res.data)) {
        setEntityRels(res.data);
      }
    } catch {
      setEntityRels([]);
    } finally {
      setEntityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelationships();
    fetchEntityRelationships('EMP001');
  }, [fetchRelationships, fetchEntityRelationships]);

  const handleRunCorrelation = async () => {
    setRunning(true);
    setError(null);
    setStatusMessage('Running correlation rules engine...');

    try {
      const res = await correlationService.runCorrelation();
      if (res && res.success) {
        const count = res.data?.relationships_created ?? 0;
        setStatusMessage(`Correlation completed successfully. ${count} new relationships created.`);
        await fetchRelationships();
        if (searchEntity) {
          fetchEntityRelationships(searchEntity);
        }
      } else {
        setError(res?.message || 'Correlation run failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to execute correlation engine.');
    } finally {
      setRunning(false);
    }
  };

  const handleEntitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntityRelationships(searchEntity);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Threat Correlation Engine"
        description="Deterministic rule-based correlation linking dark web indicators, threat feeds, and banking fraud events."
        action={
          <button
            onClick={handleRunCorrelation}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-600 hover:bg-zinc-500 text-white shadow-md transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {running ? 'Running correlation...' : 'Run Correlation'}
          </button>
        }
      />

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-zinc-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Relationships Found</h2>
          <span className="text-3xl font-bold text-white mt-1 block">{relationships.length}</span>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/50 text-zinc-400">
          <Network className="w-6 h-6" />
        </div>
      </div>

      {/* Relationships Table Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white">Correlated Relationships List</h3>

        {loading ? (
          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-sm font-medium">Loading relationships...</p>
          </div>
        ) : relationships.length === 0 ? (
          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <Network className="w-8 h-8 text-slate-500" />
            <div>
              <h4 className="text-base font-semibold text-white">No relationships found</h4>
              <p className="text-xs text-slate-400 mt-1">Click &quot;Run Correlation&quot; to execute deterministic rule matching across intelligence modules.</p>
            </div>
            <button
              onClick={handleRunCorrelation}
              disabled={running}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-600 text-white hover:bg-zinc-500 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Correlation
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-sm">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Rel ID</th>
                  <th className="px-5 py-3.5 font-semibold">Source</th>
                  <th className="px-5 py-3.5 font-semibold">Source ID</th>
                  <th className="px-5 py-3.5 font-semibold">Relationship Type</th>
                  <th className="px-5 py-3.5 font-semibold">Target</th>
                  <th className="px-5 py-3.5 font-semibold">Target ID</th>
                  <th className="px-5 py-3.5 font-semibold">Matched Field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {relationships.map((rel) => (
                  <tr key={rel.id} className="transition-colors hover:bg-slate-800/40">
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-zinc-400">
                      {rel.id}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold uppercase text-purple-400">
                      {rel.source_type}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-white">
                      {rel.source_id}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-zinc-950 text-zinc-400 border border-zinc-800/60">
                        {rel.relationship_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold uppercase text-rose-400">
                      {rel.target_type}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-white">
                      {rel.target_id}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                      {rel.matched_field}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 22: Entity Relationship View */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-zinc-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Entity Relationship View</h3>
              <p className="text-xs text-slate-400">Inspect all correlated records connected to a specific entity or indicator ID.</p>
            </div>
          </div>

          <form onSubmit={handleEntitySearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. EMP001"
              value={searchEntity}
              onChange={(e) => setSearchEntity(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </form>
        </div>

        {entityLoading ? (
          <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            Fetching entity connections...
          </div>
        ) : entityRels.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-2">
            No correlated relationships found for entity &quot;{searchEntity}&quot;. Run correlation or check entity ID.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-300">
              Connected Records for <span className="font-mono text-zinc-400">{searchEntity}</span>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entityRels.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-purple-400 font-bold">{r.source_id}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-rose-400 font-bold">{r.target_id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 text-[10px] font-mono border border-zinc-800/40">
                    {r.relationship_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
