'use client';

import React from 'react';
import { Boxes, ShieldCheck, Lock, FileCheck, CheckCircle2, Hash, ArrowRight } from 'lucide-react';

const flowSteps = [
  { label: 'Evidence', sub: 'Original File / Data', icon: FileCheck, color: 'text-zinc-400 bg-zinc-950 border-zinc-800' },
  { label: 'SHA-256', sub: 'Hashing Function', icon: Hash, color: 'text-purple-400 bg-purple-950 border-purple-800' },
  { label: 'Hash', sub: '64-Char Hex Digest', icon: Lock, color: 'text-zinc-400 bg-zinc-950 border-zinc-800' },
  { label: 'Blockchain', sub: 'Solidity Smart Contract', icon: Boxes, color: 'text-zinc-400 bg-zinc-950 border-zinc-800' },
  { label: 'Verification', sub: 'Tamper-Proof Audit', icon: ShieldCheck, color: 'text-zinc-400 bg-zinc-950 border-zinc-800' },
];

export function BlockchainEvidenceSection() {
  return (
    <section id="blockchain" className="py-20 bg-slate-950 text-white relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs font-mono text-zinc-300">
            <Boxes className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cryptographic Integrity</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            Evidence You Can Verify
          </h3>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Selected evidence can be hashed and anchored on blockchain so its integrity can later be verified.
          </p>
        </div>

        {/* Verification Pipeline Flow */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 font-mono">
            {flowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className="w-full p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 text-center transition-transform hover:scale-105">
                    <div className={`w-9 h-9 mx-auto rounded-lg border flex items-center justify-center ${step.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white">{step.label}</div>
                    <div className="text-[10px] text-slate-400">{step.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 text-center">
            🔒 <strong className="text-zinc-300">Privacy Notice:</strong> Sensitive investigation data is never stored on blockchain. Only the SHA-256 cryptographic digest is anchored.
          </div>
        </div>
      </div>
    </section>
  );
}
