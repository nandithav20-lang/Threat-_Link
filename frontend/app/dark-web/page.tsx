'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { darkWebService } from '@/services/darkWebService';
import { DarkWebIndicator, DarkWebIndicatorCreate } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Globe,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';

const initialFormData: DarkWebIndicatorCreate = {
  indicator: '',
  indicator_type: 'credential_exposure',
  source: 'Simulated Dark Web Feed',
  related_entity: 'EMP001',
  description: '',
  severity: 'high',
  status: 'new',
};

export default function DarkWebPage() {
  const [indicators, setIndicators] = useState<DarkWebIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingIndicator, setEditingIndicator] = useState<DarkWebIndicator | null>(null);
  const [viewingIndicator, setViewingIndicator] = useState<DarkWebIndicator | null>(null);
  const [deletingIndicator, setDeletingIndicator] = useState<DarkWebIndicator | null>(null);

  // Form state
  const [formData, setFormData] = useState<DarkWebIndicatorCreate>(initialFormData);

  const fetchIndicators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await darkWebService.getDarkWebIndicators();
      if (res && res.success && Array.isArray(res.data)) {
        setIndicators(res.data);
      } else {
        setError('Unable to load Dark Web indicators from backend server.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load Dark Web indicators. Please check FastAPI backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const handleOpenAddForm = () => {
    setEditingIndicator(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: DarkWebIndicator) => {
    setEditingIndicator(item);
    setFormData({
      indicator: item.indicator,
      indicator_type: item.indicator_type,
      source: item.source,
      related_entity: item.related_entity,
      description: item.description || '',
      severity: item.severity,
      status: item.status,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingIndicator) {
        const res = await darkWebService.updateDarkWebIndicator(editingIndicator.id, formData);
        if (res && res.success) {
          setSuccessMessage(`Dark Web Indicator ${editingIndicator.id} updated successfully.`);
          setIsFormOpen(false);
          fetchIndicators();
        } else {
          setError(res?.message || 'Unable to update Dark Web indicator.');
        }
      } else {
        const res = await darkWebService.createDarkWebIndicator(formData);
        if (res && res.success && res.data) {
          setSuccessMessage('New Dark Web indicator created successfully.');
          setIsFormOpen(false);
          const newDw = res.data;
          setIndicators((prev) => [newDw, ...prev.filter((d) => d.id !== newDw.id)]);
          fetchIndicators();
        } else {
          setError(res?.message || 'Unable to create Dark Web indicator.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingIndicator) return;
    setDeletingId(deletingIndicator.id);
    setError(null);

    try {
      const res = await darkWebService.deleteDarkWebIndicator(deletingIndicator.id);
      if (res && res.success) {
        setSuccessMessage(`Indicator ${deletingIndicator.id} deleted successfully.`);
        setDeletingIndicator(null);
        fetchIndicators();
      } else {
        setError(res?.message || 'Unable to delete Dark Web indicator.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to delete Dark Web indicator.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dark Web Intelligence"
        description="Monitoring simulated credential exposures, breach mentions, and unauthorized access signals stored in MongoDB."
        action={
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-600 text-white hover:bg-zinc-500 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Dark Web Indicator
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
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          <p className="text-sm font-medium">Loading Dark Web indicators...</p>
        </div>
      ) : indicators.length === 0 ? (
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="p-3 rounded-full bg-slate-800 text-slate-400">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Dark Web indicators found</h3>
            <p className="text-xs text-slate-400 mt-1">Add a simulated or authorized intelligence indicator to begin.</p>
          </div>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-600 text-white hover:bg-zinc-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Dark Web Indicator
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
                <th className="px-5 py-3.5 font-semibold">Related Entity</th>
                <th className="px-5 py-3.5 font-semibold">Severity</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Discovered</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {indicators.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-slate-800/40">
                  <td className="px-5 py-4 whitespace-nowrap font-mono text-xs font-bold text-purple-400">
                    {item.id}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap font-mono text-white font-medium">
                    {item.indicator}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap uppercase text-xs font-semibold text-slate-400">
                    {item.indicator_type.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-300">
                    {item.source}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-zinc-400">
                      {item.related_entity}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge value={item.severity} type="severity" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge value={item.status} type="status" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                    {item.discovered_at ? item.discovered_at.slice(0, 10) : 'N/A'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => setViewingIndicator(item)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-zinc-400 hover:bg-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditForm(item)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                      title="Edit Indicator"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingIndicator(item)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                      title="Delete Indicator"
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
                {editingIndicator ? `Edit Indicator (${editingIndicator.id})` : 'Add Dark Web Indicator'}
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
                  placeholder="e.g. employee001@example.test"
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
                    <option value="credential_exposure">credential_exposure</option>
                    <option value="email">email</option>
                    <option value="domain">domain</option>
                    <option value="username">username</option>
                    <option value="mention">mention</option>
                    <option value="other">other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Related Entity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP001"
                    value={formData.related_entity}
                    onChange={(e) => setFormData({ ...formData, related_entity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Simulated Dark Web Feed"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Simulated threat summary..."
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
                  {submitting ? 'Saving...' : editingIndicator ? 'Update Indicator' : 'Create Indicator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingIndicator && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Dark Web Indicator <span className="font-mono text-purple-400">({viewingIndicator.id})</span>
              </h3>
              <button
                onClick={() => setViewingIndicator(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Indicator:</span>
                <span className="font-mono text-zinc-400 font-bold">{viewingIndicator.indicator}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Type:</span>
                <span className="uppercase font-semibold text-slate-200">{viewingIndicator.indicator_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Related Entity:</span>
                <span className="font-mono text-zinc-400">{viewingIndicator.related_entity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Source:</span>
                <span>{viewingIndicator.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Severity:</span>
                <StatusBadge value={viewingIndicator.severity} type="severity" />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Status:</span>
                <StatusBadge value={viewingIndicator.status} type="status" />
              </div>
              <div className="py-1 border-b border-slate-800/60">
                <span className="text-slate-400 block mb-1">Description:</span>
                <p className="bg-slate-950 p-2.5 rounded text-slate-200 leading-relaxed font-sans">
                  {viewingIndicator.description || 'No description provided.'}
                </p>
              </div>
              <div className="flex justify-between py-1 text-[11px] text-slate-500 font-mono">
                <span>Discovered: {viewingIndicator.discovered_at || 'N/A'}</span>
                <span>Updated: {viewingIndicator.updated_at || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setViewingIndicator(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingIndicator && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Dark Web Indicator</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete indicator <strong className="text-purple-400 font-mono">{deletingIndicator.id}</strong> ({deletingIndicator.indicator})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => setDeletingIndicator(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === deletingIndicator.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                {deletingId === deletingIndicator.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deletingId === deletingIndicator.id ? 'Deleting...' : 'Delete Indicator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
