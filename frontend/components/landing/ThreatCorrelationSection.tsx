'use client';

import React from 'react';
import {
  Network,
  User,
  Globe,
  LogIn,
  MapPin,
  CreditCard,
  ArrowRightLeft,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const nodeChain = [
  { label: 'Employee', sub: 'EMP001', icon: User, color: 'border-zinc-700 bg-zinc-950 text-zinc-400' },
  { label: 'Credential Exposure', sub: 'Dark Web Dump', icon: Globe, color: 'border-purple-700 bg-purple-950 text-purple-400' },
  { label: 'Login', sub: 'Suspicious Access', icon: LogIn, color: 'border-amber-700 bg-amber-950 text-amber-400' },
  { label: 'IP Address', sub: '198.51.100.45', icon: MapPin, color: 'border-zinc-700 bg-zinc-950 text-zinc-400' },
  { label: 'Bank Account', sub: 'ACC-884920', icon: CreditCard, color: 'border-rose-700 bg-rose-950 text-rose-400' },
  { label: 'Transaction', sub: 'TXN-001 (₹85,000)', icon: ArrowRightLeft, color: 'border-zinc-700 bg-zinc-950 text-zinc-400' },
  { label: 'Crypto Wallet', sub: 'WALLET-001', icon: Wallet, color: 'border-zinc-700 bg-zinc-950 text-zinc-400' },
];

export function ThreatCorrelationSection() {
  return (
    <section id="technology" className="py-20 bg-[#060a12] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs font-mono text-zinc-400">
            <Network className="w-3.5 h-3.5" />
            <span>Threat Correlation Graph</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            See the Complete Threat Chain
          </h3>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Connect related entities and events instead of investigating isolated alerts.
          </p>
        </div>

        {/* Visual Node Chain Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-zinc-400 font-bold">Threat Chain Graph:</span>
              <span>Multi-Hop Entity Linkage</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Attack Chain Correlated</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {nodeChain.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-full p-3.5 rounded-xl border space-y-1.5 text-center transition-transform hover:scale-105 ${item.color}`}>
                    <div className="w-7 h-7 mx-auto rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-mono text-xs font-bold text-white leading-tight">{item.label}</div>
                    <div className="font-mono text-[10px] text-slate-300 truncate">{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
