'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  LayoutDashboard,
  ShieldAlert,
  Globe,
  CreditCard,
  Network,
  Search,
  Bell,
  FileCheck,
  Activity,
  Shield,
  Brain,
  BarChart3,
  FileText,
  LogOut,
  UserCheck
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Threat Intelligence', href: '/threats', icon: ShieldAlert },
  { name: 'Dark Web', href: '/dark-web', icon: Globe },
  { name: 'Fraud Detection', href: '/fraud', icon: CreditCard },
  { name: 'Threat Correlation', href: '/correlation', icon: Network },
  { name: 'Threat Graph', href: '/graph', icon: Network },
  { name: 'AI Analysis', href: '/ai', icon: Brain },
  { name: 'Risk Analysis', href: '/risk', icon: BarChart3 },
  { name: 'Incidents', href: '/incidents', icon: Search },
  { name: 'Investigations', href: '/incidents/INC-001', icon: FileText },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Evidence', href: '/evidence', icon: FileCheck },
  { name: 'System Status', href: '/system', icon: Activity },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col flex-shrink-0 h-screen sticky top-0">
      {/* Brand Logo */}
      <Link href="/" className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors group">
        <div className="p-2 bg-zinc-950 border border-zinc-700/50 rounded-lg text-zinc-400 group-hover:scale-105 transition-transform">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-white text-base block leading-none font-mono">
            THREATLINK <span className="text-zinc-400">AI</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mt-1 block font-mono">
            Intel Platform
          </span>
        </div>
      </Link>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto font-mono text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-zinc-950/80 text-zinc-400 border border-zinc-800/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Investigator Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 font-mono">
        {user ? (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{user.role || 'INVESTIGATOR'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            <p className="font-mono text-[11px]">v0.1.0-alpha</p>
            <p className="text-[10px] text-slate-600 mt-0.5">ThreatLink AI Foundation</p>
          </div>
        )}
      </div>
    </aside>
  );
};
