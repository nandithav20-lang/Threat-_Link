'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWebSocket } from '@/context/WebSocketContext';
import { Radio, ShieldAlert, Trash2, Cpu, DatabaseCheck, AlertTriangle } from 'lucide-react';

const staticAlerts = [
  {
    id: 'ALT-001',
    title: 'Possible credential-related banking fraud',
    severity: 'CRITICAL',
    source: 'Banking Fraud Engine',
    details: 'Credential replay attack detected matching dark web leak identifiers.',
    status: 'Open',
    timestamp: '2026-09-25T14:20:00Z',
  },
  {
    id: 'ALT-002',
    title: 'Anomalous high-value fund transfer outside business hours',
    severity: 'HIGH',
    source: 'Core Banking Gateway',
    details: 'Unusual transfer pattern originating from high-risk IP block.',
    status: 'Open',
    timestamp: '2026-09-24T18:45:00Z',
  },
  {
    id: 'ALT-003',
    title: 'Employee credential hash detected in paste site breach dump',
    severity: 'HIGH',
    source: 'Dark Web Monitor',
    details: 'Stolen employee session tokens discovered on Telegram breach channel.',
    status: 'Active',
    timestamp: '2026-09-23T11:10:00Z',
  },
];

export default function AlertsPage() {
  const { isConnected, alerts, clearAlerts } = useWebSocket();

  const getIcon = (type: string) => {
    switch (type) {
      case 'DARK_WEB_LEAK':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'BANKING_FRAUD':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'AI_AGENT_CORRELATION':
        return <Cpu className="w-5 h-5 text-zinc-400" />;
      case 'BLOCKCHAIN_ANCHOR':
        return <DatabaseCheck className="w-5 h-5 text-zinc-400" />;
      default:
        return <Radio className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Live Security Alerts Stream"
          description="Real-time threat notifications, dark web leak detection, banking fraud events, and blockchain evidence anchors."
        />

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium ${
            isConnected ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-[#e4e4e7] animate-pulse' : 'text-slate-500'}`} />
            <span>{isConnected ? 'LIVE WEBSOCKET STREAMING' : 'STREAM DISCONNECTED'}</span>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-xs font-mono transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Live Stream ({alerts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Incoming Stream Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e4e4e7] animate-ping" />
            Live Incoming Broadcasts ({alerts.length})
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-zinc-500/30 hover:border-zinc-500/60 shadow-lg shadow-zinc-500/5 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mt-0.5">
                    {getIcon(item.event_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-zinc-400 font-bold">{item.id}</span>
                      <StatusBadge value={item.severity} type="severity" />
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.source}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      {item.details}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 mt-2">
                      Target Entity: <strong className="text-slate-200">{item.target_entity}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 font-bold">
                      REALTIME
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Static Security Alerts */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
          Historical Incident Signals
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {staticAlerts.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-slate-400">{item.id}</span>
                    <StatusBadge value={item.severity} type="severity" />
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
                      {item.source}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 font-sans mt-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    {item.details}
                  </p>
                </div>
              </div>

              <div className="text-right whitespace-nowrap">
                <StatusBadge value={item.status} type="status" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
