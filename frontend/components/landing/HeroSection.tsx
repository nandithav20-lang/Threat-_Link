'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Globe,
  Brain,
  CreditCard,
  Network,
  BarChart3,
  Search,
  Boxes,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { OrbitalHeroSection } from '@/components/ui/orbital-hero-section';

function useNarrow(query = '(max-width: 767px)') {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, [query]);
  return narrow;
}

export function HeroSection() {
  const narrow = useNarrow();

  return (
    <section className="relative w-full min-h-[100svh] md:min-h-[850px] overflow-hidden text-white bg-slate-950">
      <OrbitalHeroSection
        focus={narrow ? [0.5, 0.86] : [0.74, 0.42]}
        scrim={narrow ? 'top' : 'left'}
        scrimStrength={narrow ? 0.94 : 0.92}
        viewRadius={narrow ? 2.1 : 3.1}
        lead={narrow ? 0.05 : 0.12}
        glow={narrow ? 0.5 : 1}
      >
        <div className="flex h-full min-h-[100svh] items-center w-full pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Hero Text Content */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono font-bold tracking-[0.2em] text-[#e4e4e7] uppercase backdrop-blur-md shadow-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>AI-POWERED THREAT INTELLIGENCE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] font-sans">
                <span className="text-white">
                  CONNECT THREATS.
                </span><br />
                <span className="bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                  DETECT FRAUD.
                </span><br />
                <span className="bg-gradient-to-r from-indigo-200 via-white to-cyan-200 bg-clip-text text-transparent">
                  PROTECT EVIDENCE.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                ThreatLink AI connects threat intelligence, Dark Web indicators, banking fraud signals, AI analysis, threat correlation, and EVM blockchain-backed evidence into one investigation platform.
              </p>

              <div className="flex items-center gap-4 pt-4 font-sans">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-zinc-200 text-slate-950 font-extrabold rounded-full shadow-xl shadow-zinc-500/20 transition-all hover:scale-105"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-semibold rounded-full border border-slate-700/90 transition-all backdrop-blur-md"
                >
                  <span>Login</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Diagram Cards */}
            <div className="lg:col-span-7 relative flex items-center justify-center py-4">
              <div className="w-full relative flex items-center justify-between gap-2">
                {/* Left Column (4 Connected Cards) */}
                <div className="space-y-5 z-20 w-44 shrink-0">
                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Threat Intelligence</span>
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                  </div>

                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Dark Web Intelligence</span>
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                  </div>

                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">AI Analysis</span>
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                  </div>

                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Fraud Detection</span>
                    <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                  </div>
                </div>

                {/* Center Cyber Globe Node */}
                <div className="z-10 flex flex-col items-center justify-center my-auto relative shrink-0" style={{ perspective: '1000px' }}>
                  <motion.div 
                    className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-88 lg:h-88 rounded-full border-2 border-slate-600/80 shadow-[0_0_80px_rgba(0,216,255,0.4)] overflow-hidden flex items-center justify-center group bg-slate-950/80"
                    animate={{
                      y: [-8, 8, -8],
                      rotateX: [3, -3, 3],
                      rotateY: [-3, 3, -3],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.img
                      src="/hero_cyber_globe.jpg"
                      alt="ThreatLink AI Cyber Globe"
                      className="w-full h-full object-cover rounded-full opacity-90"
                      animate={{
                        scale: [1.05, 1.1, 1.05],
                        rotateZ: [0, 2, 0]
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-radial from-transparent via-slate-950/20 to-slate-950/80 pointer-events-none" />
                  </motion.div>
                </div>

                {/* Right Column (4 Connected Cards) */}
                <div className="space-y-5 z-20 w-44 shrink-0">
                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <Network className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Threat Correlation</span>
                  </div>

                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Risk Analysis</span>
                  </div>

                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Investigation</span>
                  </div>

                  <div className="relative p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md hover:border-slate-500 transition-all group">
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#facc15] border border-amber-200" />
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-[#e4e4e7] shrink-0">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">SHA-256 + Blockchain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </OrbitalHeroSection>
    </section>
  );
}
