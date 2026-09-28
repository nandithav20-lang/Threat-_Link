'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="py-10 bg-[#04070d] border-t border-slate-900/80 text-slate-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-950/80 border border-zinc-500/50 flex items-center justify-center text-zinc-400">
                <Shield className="w-4 h-4 fill-zinc-400/20" />
              </div>
              <span className="font-sans text-sm font-bold text-white tracking-tight">
                THREATLINK <span className="text-[#e4e4e7]">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-sm pt-0.5">
              AI-Agentic Threat Intelligence & Banking Fraud Investigation Platform.
            </p>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
            <a href="#features" className="hover:text-[#e4e4e7] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#e4e4e7] transition-colors">
              How It Works
            </a>
            <a href="#technology" className="hover:text-[#e4e4e7] transition-colors">
              Technology
            </a>
            <Link href="/login" className="hover:text-[#e4e4e7] transition-colors">
              Login
            </Link>
            <Link href="/signup" className="hover:text-[#e4e4e7] transition-colors">
              Sign Up
            </Link>
          </div>

          {/* Right Copyright */}
          <div className="text-xs text-slate-500 font-medium">
            &copy; 2026 ThreatLink AI
          </div>
        </div>
      </div>
    </footer>
  );
}
