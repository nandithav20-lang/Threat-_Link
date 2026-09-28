'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/register'];

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, loading, isPublicRoute, pathname, router]);

  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 font-mono">
        <div className="w-16 h-16 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center mb-6 shadow-2xl shadow-zinc-500/20">
          <Shield className="w-8 h-8 text-zinc-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 text-zinc-400 text-sm font-semibold tracking-wider uppercase mb-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying Investigator Credentials</span>
        </div>
        <p className="text-xs text-slate-400">ThreatLink AI Security Control System</p>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
};
