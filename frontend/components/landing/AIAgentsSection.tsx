'use client';

import React from 'react';
import { Brain, CheckCircle2, ShieldAlert, Cpu, EyeOff } from 'lucide-react';

export function AIAgentsSection() {
  return (
    <section className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950 border border-purple-800 rounded-full text-xs font-mono text-purple-300">
              <Brain className="w-3.5 h-3.5" />
              <span>Multi-Agent Reasoning Pipeline</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              AI Analysis Built for Precision Cybersecurity & Fraud Response
            </h3>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Specialized AI agents process raw signals across Threat Intelligence, Dark Web breach dumps, and banking fraud events to formulate structured observations, verify hypotheses, and evaluate risk.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Structured Output Pipeline</h4>
                  <p className="text-slate-400 font-sans text-xs">Returns standardized finding objects for seamless incident correlation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <EyeOff className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Zero Chain-of-Thought Exposure</h4>
                  <p className="text-slate-400 font-sans text-xs">Hides internal agent chatter to present concise, actionable insights.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Human Investigator Control</h4>
                  <p className="text-slate-400 font-sans text-xs">Assists investigators without performing unapproved financial or account blocks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Finding Card Mockup */}
          <div className="p-6 bg-slate-900/80 border border-purple-900/60 rounded-2xl space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-300">
                <Brain className="w-4 h-4" />
                <span className="font-bold">AI Agent Pipeline Finding</span>
              </div>
              <span className="px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-[10px]">
                Confidence: 0.89
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-slate-300">
              <span className="text-zinc-400 font-bold">Observation:</span>
              <p className="text-xs leading-relaxed font-sans text-slate-300">
                Dark Web credential leak for EMP001 correlates directly with new device registration NEW-DEVICE-01 and subsequent ₹85,000 transaction anomaly to crypto WALLET-001.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 text-[11px]">Hypothesis Verification:</span>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Account Takeover Hypothesis</span>
                <span className="font-bold uppercase">Supported (100%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
