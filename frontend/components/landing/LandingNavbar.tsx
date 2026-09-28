'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, ArrowRight, Menu, X, LogOut, UserCheck } from 'lucide-react';

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#060a12]/95 backdrop-blur-md border-b border-slate-800/60 py-3.5 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-950/80 border border-zinc-500/50 flex items-center justify-center text-zinc-400 shadow-md shadow-zinc-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-zinc-400/20" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-white">
              THREATLINK <span className="text-[#e4e4e7]">AI</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-[#e4e4e7] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#e4e4e7] transition-colors">
              How It Works
            </a>
            <a href="#technology" className="hover:text-[#e4e4e7] transition-colors">
              Technology
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3.5 text-sm font-medium">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-950/60 border border-zinc-800/60 rounded-full text-zinc-300 font-medium">
                  <UserCheck className="w-4 h-4 text-[#e4e4e7]" />
                  <span>Welcome, {user.name}</span>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#e4e4e7] hover:bg-[#00d8ff] text-slate-950 font-bold rounded-full shadow-lg shadow-zinc-500/25 transition-all hover:scale-105"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-white transition-all font-medium"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-full bg-[#e4e4e7] hover:bg-[#00d8ff] text-slate-950 font-bold shadow-lg shadow-zinc-500/25 transition-all hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-5 bg-[#0b1329] border border-slate-800 rounded-2xl space-y-4 text-sm text-slate-300 animate-in fade-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 hover:text-[#e4e4e7]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 hover:text-[#e4e4e7]"
            >
              How It Works
            </a>
            <a
              href="#technology"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 hover:text-[#e4e4e7]"
            >
              Technology
            </a>

            {isAuthenticated && user ? (
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <div className="text-zinc-300 font-semibold">Welcome, {user.name}</div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#e4e4e7] text-slate-950 font-bold rounded-full"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-full font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 border border-slate-800 text-white font-medium rounded-full"
                >
                  <span>Login</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#e4e4e7] text-slate-950 font-bold rounded-full"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
