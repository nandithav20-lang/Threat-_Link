'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SystemStatus, StatusType } from '@/components/common/SystemStatus';
import { healthService } from '@/services/healthService';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function SystemPage() {
  const [backendStatus, setBackendStatus] = useState<StatusType>('loading');
  const [databaseStatus, setDatabaseStatus] = useState<StatusType>('loading');
  const [backendMessage, setBackendMessage] = useState<string>('Checking backend status...');
  const [databaseMessage, setDatabaseMessage] = useState<string>('Checking database status...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setBackendStatus('loading');
    setDatabaseStatus('loading');
    setBackendMessage('Connecting to FastAPI backend...');
    setDatabaseMessage('Checking MongoDB ping...');
    setErrorMessage(null);

    try {
      // Call backend health API
      const backendRes = await healthService.getBackendHealth();
      
      if (backendRes && (backendRes.success || backendRes.message)) {
        setBackendStatus('connected');
        setBackendMessage(backendRes.message || 'FastAPI backend is running');
      } else {
        setBackendStatus('disconnected');
        setBackendMessage('Backend service error');
      }

      // Call database health API
      try {
        const dbRes = await healthService.getDatabaseHealth();
        if (dbRes && dbRes.success && dbRes.data?.status === 'connected') {
          setDatabaseStatus('connected');
          setDatabaseMessage(`Database: ${dbRes.data.database} (connected)`);
        } else {
          setDatabaseStatus('disconnected');
          setDatabaseMessage('Database connection unavailable');
        }
      } catch (dbErr: any) {
        setDatabaseStatus('disconnected');
        setDatabaseMessage('Unable to reach database health check');
      }

    } catch (err: any) {
      setBackendStatus('disconnected');
      setDatabaseStatus('unknown');
      setBackendMessage('Unable to connect to backend server');
      setDatabaseMessage('Unknown (Backend unreachable)');
      setErrorMessage(
        'Unable to connect to the backend. Please make sure FastAPI is running on http://localhost:8000.'
      );
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ThreatLink AI System Status"
        description="Real-time operational health monitor for backend API services and MongoDB database connection."
        action={
          <button
            onClick={checkHealth}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Check Now
          </button>
        }
      />

      {/* Reusable System Status Component */}
      <SystemStatus
        backendStatus={backendStatus}
        databaseStatus={databaseStatus}
        backendMessage={backendMessage}
        databaseMessage={databaseMessage}
        onRefresh={checkHealth}
      />

      {/* Error alert box if backend is disconnected */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-200">Backend Connection Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Diagnostic details */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-white">Connection Architecture</h4>
        <p className="font-mono text-slate-400">
          Next.js Frontend (port 3000) → FastAPI REST API (port 8000) → MongoDB (port 27017 / Atlas)
        </p>
      </div>
    </div>
  );
}
