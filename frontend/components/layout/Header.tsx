'use client';

import React from 'react';
import { UserCheck, Activity, LogOut, Radio, Bell, Menu } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isConnected, alerts } = useWebSocket();

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800/80"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide font-mono hidden sm:block">THREATLINK <span className="text-zinc-400">AI</span></h2>
          <p className="text-[10px] sm:text-xs text-slate-400">Investigator Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* WebSocket Live Stream Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium ${
          isConnected 
            ? 'bg-zinc-950/60 border-zinc-800/50 text-zinc-300 shadow-sm shadow-zinc-500/20' 
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-[#e4e4e7] animate-pulse' : 'text-slate-500'}`} />
          <span className="hidden md:inline">{isConnected ? 'LIVE STREAM' : 'DISCONNECTED'}</span>
        </div>

        {/* Live Alerts Bell */}
        <Link
          href="/alerts"
          className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          title="View Live Alert Stream"
        >
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
              {alerts.length > 9 ? '9+' : alerts.length}
            </span>
          )}
        </Link>

        {/* System Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/60 border border-zinc-800/40 text-zinc-400 text-xs font-mono font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>SOC Active</span>
        </div>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold font-mono text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserCheck className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-200 block leading-tight font-mono">
                {user?.name || 'Investigator'}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-mono font-medium">
                {user?.role || 'INVESTIGATOR'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout of Investigator Account"
            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/60 transition-all ml-2 flex items-center justify-center group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
