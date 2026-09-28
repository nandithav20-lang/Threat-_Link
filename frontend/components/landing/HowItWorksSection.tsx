'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Detect',
    desc: 'Collect threat and fraud signals.',
  },
  {
    step: '02',
    title: 'Analyze',
    desc: 'AI agents analyze the signals.',
  },
  {
    step: '03',
    title: 'Correlate',
    desc: 'Connect related entities and events.',
  },
  {
    step: '04',
    title: 'Investigate',
    desc: 'Generate risk, timeline and findings.',
  },
  {
    step: '05',
    title: 'Verify',
    desc: 'Protect selected evidence using SHA-256 and blockchain.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#060a12] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#e4e4e7] uppercase">
            SIMPLE PROCESS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            How ThreatLink AI Works
          </h2>
        </div>

        {/* 5 Circular Steps in Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
          {steps.map((item, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center text-center space-y-3 max-w-[200px] group">
                <div className="w-14 h-14 rounded-full bg-[#0c1427] border-2 border-zinc-500/60 flex items-center justify-center text-[#e4e4e7] font-bold text-base shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="font-sans text-base font-bold text-white group-hover:text-zinc-300 transition-colors">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center text-slate-600">
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
