'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-16 bg-[#060a12] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 bg-gradient-to-r from-[#091225] via-[#0d1a36] to-[#091225] border border-slate-800/80 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-zinc-950/20 relative overflow-hidden">
          {/* Subtle cyan glow behind button */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-zinc-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-left z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
              Ready to investigate connected threats?
            </h3>
            <p className="text-sm text-slate-300 font-sans">
              Start your investigation with ThreatLink AI.
            </p>
          </div>

          <div className="z-10 shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#e4e4e7] hover:bg-[#00d8ff] text-slate-950 font-bold text-sm rounded-full shadow-lg shadow-zinc-500/25 transition-all hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
