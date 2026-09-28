'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { threatService } from '@/services/threatService';
import { Threat, ThreatCreate } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';

const initialFormData: ThreatCreate = {
  indicator: '',
  indicator_type: 'domain',
  source: 'Simulated Threat Feed',
  description: '',
  severity: 'high',
  status: 'new',
};

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingThreat, setEditingThreat] = useState<Threat | null>(null);
  const [viewingThreat, setViewingThreat] = useState<Threat | null>(null);
  const [deletingThreat, setDeletingThreat] = useState<Threat | null>(null);

  // Form state
  const [formData, setFormData] = useState<ThreatCreate>(initialFormData);

  const fetchThreats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await threatService.getThreats();
      if (res && res.success && Array.isArray(res.data)) {
        setThreats(res.data);
      } else {
        setError('Unable to load threats from backend server.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load threats. Please check FastAPI backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  const handleOpenAddForm = () => {
    setEditingThreat(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (threat: Threat) => {
    setEditingThreat(threat);
    setFormData({
      indicator: threat.indicator,
      indicator_type: threat.indicator_type,
      source: threat.source,
      description: threat.description || '',
      severity: threat.severity,
      status: threat.status,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingThreat) {
        // Update existing threat
        const res = await threatService.updateThreat(editingThreat.id, formData);
        if (res && res.success) {
          setSuccessMessage(`Threat ${editingThreat.id} updated successfully.`);
          setIsFormOpen(false);
          fetchThreats();
        } else {
          setError(res?.message || 'Unable to update threat.');
        }
      } else {
        // Create new threat
        const res = await threatService.createThreat(formData);
        if (res && res.success) {
          setSuccessMessage('New threat created successfully.');
          setIsFormOpen(false);
          fetchThreats();
        } else {
          setError(res?.message || 'Unable to create threat.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingThreat) return;
    setDeletingId(deletingThreat.id);
    setError(null);

    try {
      const res = await threatService.deleteThreat(deletingThreat.id);
      if (res && res.success) {
        setSuccessMessage(`Threat ${deletingThreat.id} deleted successfully.`);
        setDeletingThreat(null);
        fetchThreats();
      } else {
        setError(res?.message || 'Unable to delete threat.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to delete threat.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Threat Intelligence"
        description="Manage synthetic threat indicators, severity rankings, and investigation statuses stored in MongoDB."
        action={
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-600 text-white hover:bg-zinc-500 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Threat
          </button>
        }
      />

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-zinc-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Table & States */}
      {loading ? (
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Loading threats from MongoDB backend...</p>
        </div>
      ) : threats.length === 0 ? (
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="p-3 rounded-full bg-slate-800 text-slate-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No threats found</h3>
            <p className="text-xs text-slate-400 mt-1">Add your first threat indicator to begin monitoring.</p>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-600 text-white hover:bg-zinc-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Threat
          </button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-sm">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Indicator</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Source</th>
                <th className="px-5 py-3.5 font-semibold">Severity</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Created</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {threats.map((threat) => (
                <tr key={threat.id} className="transition-colors hover:bg-slate-800/40">
                  <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-zinc-400">
                    {threat.id}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-mono text-white font-medium">
                    {threat.indicator}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap uppercase text-xs font-semibold text-slate-400">
                    {threat.indicator_type}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-300">
                    {threat.source}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge value={threat.severity} type="severity" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge value={threat.status} type="status" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                    {threat.created_at ? threat.created_at.slice(0, 10) : 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => setViewingThreat(threat)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-zinc-400 hover:bg-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditForm(threat)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                      title="Edit Threat"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingThreat(threat)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                      title="Delete Threat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingThreat ? `Edit Threat (${editingThreat.id})` : 'Add New Threat Indicator'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Indicator</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. example-malicious-domain.test or 192.0.2.10"
                  value={formData.indicator}
                  onChange={(e) => setFormData({ ...formData, indicator: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Indicator Type</label>
                  <select
                    value={formData.indicator_type}
                    onChange={(e) => setFormData({ ...formData, indicator_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                  >
                    <option value="domain">domain</option>
                    <option value="ip">ip</option>
                    <option value="email">email</option>
                    <option value="url">url</option>
                    <option value="hash">hash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Source</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Simulated Threat Feed"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of the threat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                  >
                    <option value="new">new</option>
                    <option value="verified">verified</option>
                    <option value="investigating">investigating</option>
                    <option value="resolved">resolved</option>
                    <option value="false_positive">false_positive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
                  {submitting ? 'Saving...' : editingThreat ? 'Update Threat' : 'Create Threat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingThreat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Threat Record <span className="font-mono text-zinc-400">({viewingThreat.id})</span>
              </h3>
              <button
                onClick={() => setViewingThreat(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Indicator:</span>
                <span className="font-mono text-zinc-400 font-bold">{viewingThreat.indicator}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Type:</span>
                <span className="uppercase font-semibold text-slate-200">{viewingThreat.indicator_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Source:</span>
                <span>{viewingThreat.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Severity:</span>
                <StatusBadge value={viewingThreat.severity} type="severity" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <StatusBadge value={viewingThreat.status} type="status" />
              </div>
              <div className="py-1 border-b border-slate-800/60">
                <span className="text-slate-400 block mb-1">Description:</span>
                <p className="bg-slate-950 p-2.5 rounded text-slate-200 leading-relaxed font-sans">
                  {viewingThreat.description || 'No description provided.'}
                </p>
              </div>
              <div className="flex justify-between py-1 text-[11px] text-slate-500 font-mono">
                <span>Created: {viewingThreat.created_at || 'N/A'}</span>
                <span>Updated: {viewingThreat.updated_at || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setViewingThreat(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingThreat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Threat Record</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete threat <strong className="text-zinc-400 font-mono">{deletingThreat.id}</strong> ({deletingThreat.indicator})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => setDeletingThreat(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === deletingThreat.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                {deletingId === deletingThreat.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deletingId === deletingThreat.id ? 'Deleting...' : 'Delete Threat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
