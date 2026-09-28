'use client';

import React from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[100svh] md:min-h-[850px] overflow-hidden text-white bg-transparent">
        <div className="flex h-full min-h-[100svh] items-center w-full pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Hero Text Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-block text-[11px] font-mono font-bold tracking-[0.25em] text-[#e4e4e7] uppercase">
              AI-POWERED THREAT INTELLIGENCE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] font-sans">
              <span className="text-white">
                CONNECT THREATS.
              </span><br />
              <span className="bg-gradient-to-r from-blue-100 via-white to-purple-100 bg-clip-text text-transparent">
                DETECT FRAUD.
              </span><br />
              <span className="bg-gradient-to-r from-indigo-100 via-white to-cyan-100 bg-clip-text text-transparent">
                PROTECT EVIDENCE.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
              ThreatLink AI connects threat intelligence, Dark Web indicators, banking fraud signals, AI analysis, threat correlation and blockchain-backed evidence into one investigation platform.
            </p>

            <div className="flex items-center gap-4 pt-4 font-sans">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#e4e4e7] hover:bg-[#00d8ff] text-slate-950 font-bold rounded-full shadow-lg shadow-zinc-500/30 transition-all hover:scale-105"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-[#0e172a]/90 hover:bg-[#1e293b] text-white font-medium rounded-full border border-slate-700/80 transition-all"
              >
                <span>Login</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Diagram (Matching Exact Mockup Globe & Linked Cards) */}
          <div className="lg:col-span-7 relative flex items-center justify-center py-4">
            <div className="w-full relative flex items-center justify-between gap-2">
              
              {/* Left Column (4 Connected Cards) */}
              <div className="space-y-5 z-20 w-44 shrink-0">
                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Threat Intelligence</span>
                  {/* Connection Node */}
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                </div>

                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Dark Web Intelligence</span>
                  {/* Connection Node */}
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                </div>

                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">AI Analysis</span>
                  {/* Connection Node */}
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                </div>

                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Fraud Detection</span>
                  {/* Connection Node */}
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                </div>
              </div>

              {/* Center Cyber Globe (Exact 3D Graphic Match) */}
              <div className="z-10 flex flex-col items-center justify-center my-auto relative shrink-0" style={{ perspective: '1000px' }}>
                <motion.div 
                  className="relative w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 rounded-full border-2 border-[#e4e4e7]/60 shadow-[0_0_70px_rgba(0,240,255,0.35)] overflow-hidden flex items-center justify-center group bg-[#060e1d]"
                  animate={{
                    y: [-10, 10, -10],
                    rotateX: [4, -4, 4],
                    rotateY: [-4, 4, -4],
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
                    className="w-full h-full object-cover rounded-full"
                    animate={{
                      scale: [1.05, 1.12, 1.05],
                      rotateZ: [0, 2, 0]
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  {/* Radial Overlay Glow */}
                  <div className="absolute inset-0 rounded-full bg-radial from-transparent via-zinc-950/10 to-[#060a12]/60 pointer-events-none" />
                </motion.div>
              </div>

              {/* Right Column (4 Connected Cards) */}
              <div className="space-y-5 z-20 w-44 shrink-0">
                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  {/* Connection Node */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <Network className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Threat Correlation</span>
                </div>

                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  {/* Connection Node */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Risk Analysis</span>
                </div>

                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  {/* Connection Node */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">Investigation</span>
                </div>

                <div className="relative p-3 bg-[#081226]/95 border border-zinc-500/40 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-md hover:border-zinc-400 transition-all group">
                  {/* Connection Node */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] border border-yellow-200" />
                  <div className="w-8 h-8 rounded-lg bg-zinc-950/90 border border-zinc-700/80 flex items-center justify-center text-[#e4e4e7] shrink-0 shadow-sm shadow-zinc-500/30">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-white group-hover:text-zinc-300 leading-tight">SHA-256 + Blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
