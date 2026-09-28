'use client';

import React from 'react';
import {
  Shield,
  Globe,
  Brain,
  CreditCard,
  Network,
  BarChart3,
  Clock,
  Boxes,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Threat Intelligence',
    description: 'Get real-time threat feeds and IOC enrichment from multiple sources.',
  },
  {
    icon: Globe,
    title: 'Dark Web Intelligence',
    description: 'Monitor dark web indicators and connect them with real-world events.',
  },
  {
    icon: Brain,
    title: 'AI Agents',
    description: 'AI-powered agents analyze patterns, detect anomalies and find hidden connections.',
  },
  {
    icon: CreditCard,
    title: 'Banking Fraud Detection',
    description: 'Identify and investigate banking fraud and financial crime signals.',
  },
  {
    icon: Network,
    title: 'Threat Correlation Graph',
    description: 'Visualize connections between entities, events and indicators.',
  },
  {
    icon: BarChart3,
    title: 'Risk Analysis',
    description: 'Assess risk levels and prioritize investigations.',
  },
  {
    icon: Clock,
    title: 'Investigation Timeline',
    description: 'Build detailed timelines and track the full attack chain.',
  },
  {
    icon: Boxes,
    title: 'Blockchain Evidence',
    description: 'Verify evidence integrity with SHA-256 and blockchain technology.',
  },
];

export function ProblemSection() {
  return (
    <section id="features" className="py-20 bg-[#060a12] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <div className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#e4e4e7] uppercase">
            POWERFUL INVESTIGATION CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
            Powerful Investigation Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 bg-[#0c1427]/80 border border-slate-800/80 rounded-2xl space-y-3.5 hover:border-zinc-500/50 transition-all hover:shadow-xl hover:shadow-zinc-950/20 group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center text-[#e4e4e7] group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-sans group-hover:text-zinc-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
