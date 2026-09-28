'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useWebSocket } from '@/context/WebSocketContext';
import { AlertTriangle, ShieldAlert, Cpu, DatabaseCheck, X, ArrowRight, Radio } from 'lucide-react';

export const LiveAlertToast: React.FC = () => {
  const { latestAlert, dismissLatestAlert, isConnected } = useWebSocket();

  useEffect(() => {
    if (latestAlert) {
      const timer = setTimeout(() => {
        dismissLatestAlert();
      }, 7000); // Auto dismiss toast after 7s
      return () => clearTimeout(timer);
    }
  }, [latestAlert, dismissLatestAlert]);

  if (!latestAlert) return null;

  const getIcon = () => {
    switch (latestAlert.event_type) {
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

  const getSeverityBadge = () => {
    switch (latestAlert.severity) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'MEDIUM':
        return 'bg-zinc-950/80 text-zinc-300 border-zinc-800/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-in slide-in-from-top-5 duration-300">
      <div className="p-4 rounded-2xl bg-slate-950/95 border border-zinc-500/40 shadow-2xl shadow-zinc-500/10 backdrop-blur-xl flex flex-col gap-3 relative overflow-hidden">
        {/* Top glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-500 via-rose-500 to-amber-500" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge()}`}>
                  {latestAlert.severity}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {latestAlert.source}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug mt-1 font-sans">
                {latestAlert.title}
              </h4>
            </div>
          </div>

          <button
            onClick={dismissLatestAlert}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-sans line-clamp-2 pl-1">
          {latestAlert.details}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">
            Target: <strong className="text-zinc-300 font-medium">{latestAlert.target_entity}</strong>
          </span>

          <Link
            href="/alerts"
            onClick={dismissLatestAlert}
            className="inline-flex items-center gap-1 text-[#e4e4e7] hover:underline font-semibold text-xs"
          >
            <span>View Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
