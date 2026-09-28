'use client';

import React from 'react';
import { BarChart3, Clock, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

export function RiskInvestigationSection() {
  return (
    <section className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Risk Scoring Showcase */}
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <BarChart3 className="w-5 h-5" />
                <h4 className="font-mono text-sm font-bold text-white uppercase">Deterministic Risk Scoring</h4>
              </div>
              <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full font-mono text-xs font-bold">
                82/100 — HIGH
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">Threat Factor</span>
                <div className="font-bold text-amber-400">18/20</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">Dark Web Factor</span>
                <div className="font-bold text-purple-400">19/20</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">Fraud Factor</span>
                <div className="font-bold text-rose-400">22/25</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">Correlation Factor</span>
                <div className="font-bold text-zinc-400">18/20</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400">Verification Factor</span>
                <div className="font-bold text-zinc-400">15/15</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Risk scores are computed using explainable mathematical logic, guaranteeing consistent results across every investigation.
            </p>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs font-mono text-zinc-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Unified Case Management</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Explainable Risk & Chronological Case Timeline
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Investigators gain complete clarity over what happened, why it is suspicious, and how events unfolded over time with our vertical incident timeline and automated investigation summaries.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>Transparent scoring formulas without black-box metrics</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>Single-click case investigation generation & status updates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>Vertical timeline ordering threat signals from detection to resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
