import React from 'react';
import { Activity, Database, Server, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export type StatusType = 'connected' | 'disconnected' | 'loading' | 'unknown';

interface SystemStatusProps {
  backendStatus: StatusType;
  databaseStatus: StatusType;
  backendMessage?: string;
  databaseMessage?: string;
  onRefresh?: () => void;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  backendStatus,
  databaseStatus,
  backendMessage,
  databaseMessage,
  onRefresh,
}) => {
  const renderIndicator = (status: StatusType) => {
    if (status === 'loading') {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking...
        </span>
      );
    }
    if (status === 'connected') {
      return (
        <span className="inline-flex items-center gap-1.5 text-zinc-400 font-medium text-xs bg-zinc-950/60 border border-zinc-800/40 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Connected
        </span>
      );
    }
    if (status === 'disconnected') {
      return (
        <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium text-xs bg-rose-950/60 border border-rose-800/40 px-2.5 py-1 rounded-full">
          <XCircle className="w-3.5 h-3.5" />
          Disconnected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium text-xs bg-slate-800 px-2.5 py-1 rounded-full">
        Unknown
      </span>
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" />
          <h3 className="text-base font-semibold text-white">System Status</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            Refresh Status
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Backend Card */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-800/50">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">FastAPI Backend</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{backendMessage || 'http://localhost:8000/api/v1'}</p>
            </div>
          </div>
          <div>{renderIndicator(backendStatus)}</div>
        </div>

        {/* Database Card */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/50">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">MongoDB Database</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{databaseMessage || 'threatlink_ai'}</p>
            </div>
          </div>
          <div>{renderIndicator(databaseStatus)}</div>
        </div>
      </div>
    </div>
  );
};
