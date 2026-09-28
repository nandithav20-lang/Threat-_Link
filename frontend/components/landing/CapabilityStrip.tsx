'use client';

import React from 'react';
import {
  Brain,
  Network,
  Globe,
  CreditCard,
  FileCheck,
  Boxes,
} from 'lucide-react';

const capabilities = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    desc: 'Structured reasoning pipeline with zero chain-of-thought leaks.',
    color: 'text-zinc-400 bg-zinc-950 border-zinc-800',
  },
  {
    icon: Network,
    title: 'Threat Correlation',
    desc: 'Deterministic entity link engine matching accounts, IPs, and devices.',
    color: 'text-zinc-400 bg-zinc-950 border-zinc-800',
  },
  {
    icon: Globe,
    title: 'Dark Web Intelligence',
    desc: 'Exposed credential indicators from authorized breach intelligence feeds.',
    color: 'text-purple-400 bg-purple-950 border-purple-800',
  },
  {
    icon: CreditCard,
    title: 'Fraud Detection',
    desc: 'Synthetic banking anomaly detection across transactions and wallets.',
    color: 'text-rose-400 bg-rose-950 border-rose-800',
  },
  {
    icon: FileCheck,
    title: 'Evidence Integrity',
    desc: 'Dynamic 64-character hex SHA-256 cryptographic hashing.',
    color: 'text-zinc-400 bg-zinc-950 border-zinc-800',
  },
  {
    icon: Boxes,
    title: 'Blockchain Verification',
    desc: 'Solidity EvidenceRegistry smart contract EVM anchoring.',
    color: 'text-zinc-400 bg-zinc-950 border-zinc-800',
  },
];

export function CapabilityStrip() {
  return (
    <section className="py-12 bg-slate-950/90 border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 bg-slate-900/60 border border-slate-800/90 rounded-xl space-y-2 hover:border-slate-700 transition-all hover:scale-[1.02]"
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${cap.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-mono text-xs font-bold text-slate-100">{cap.title}</h3>
                <p className="text-[11px] text-slate-400 leading-tight">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
