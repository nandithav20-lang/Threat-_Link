'use client';

import React from 'react';
import { Globe, CreditCard, ShieldCheck, Database, FileText } from 'lucide-react';

export function DarkWebFraudSection() {
  return (
    <section className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Dark Web & Financial Analytics
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            Connect Dark Web Intelligence with Banking Fraud
          </h3>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            ThreatLink AI can correlate authorized or simulated Dark Web indicators with banking and security events to help investigators understand connected threat activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Dark Web Card */}
          <div className="p-8 bg-slate-900/60 border border-purple-900/60 rounded-2xl space-y-5 hover:border-purple-600/60 transition-colors shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-950 border border-purple-800 rounded-xl text-purple-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-mono text-base font-bold text-white">Dark Web Threat Intelligence</h4>
                <p className="text-xs text-slate-400">Authorized & Synthetic Breach Datasets</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Identifies leaked employee emails, hashed credential indicators, and compromise severity without ever accessing illegal marketplaces or unauthorized private infrastructure.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Sample Dark Web Indicator:</span>
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span>emp001@company.test</span>
                <span className="text-rose-400">SEVERITY: CRITICAL</span>
              </div>
            </div>
          </div>

          {/* Fraud Detection Card */}
          <div className="p-8 bg-slate-900/60 border border-rose-900/60 rounded-2xl space-y-5 hover:border-rose-600/60 transition-colors shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-950 border border-rose-800 rounded-xl text-rose-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-mono text-base font-bold text-white">Banking Fraud Analytics</h4>
                <p className="text-xs text-slate-400">Transaction & Device Anomaly Detection</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Tracks high-value transaction spikes, un-recognized device fingerprints, anomalous IP logins, and destination crypto wallets associated with fraud events.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Sample Fraud Event:</span>
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <span>TXN-001 (₹85,000)</span>
                <span className="text-amber-400">NEW-DEVICE-01</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Notice */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 text-zinc-400">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="font-bold text-white uppercase tracking-wider">Authorized Data Sources:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-300">
            <span className="px-3 py-1 bg-slate-950 rounded border border-slate-800">Synthetic Data</span>
            <span className="px-3 py-1 bg-slate-950 rounded border border-slate-800">Authorized Data</span>
            <span className="px-3 py-1 bg-slate-950 rounded border border-slate-800">Public Threat Intelligence</span>
            <span className="px-3 py-1 bg-slate-950 rounded border border-slate-800">Historical Data</span>
          </div>
        </div>
      </div>
    </section>
  );
}
