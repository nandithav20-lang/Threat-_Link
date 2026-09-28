'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { LiveAlertToast } from '@/components/ui/LiveAlertToast';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/register'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <WebSocketProvider>
        <div className="flex min-h-screen w-full bg-slate-950 text-slate-100 relative">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <LiveAlertToast />
            <main className="flex-1 p-6 overflow-y-auto bg-[#0b0f17]">
              {children}
            </main>
          </div>
        </div>
      </WebSocketProvider>
    </ProtectedRoute>
  );
}
