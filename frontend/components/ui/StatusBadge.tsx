import React from 'react';
import { SeverityLevel, VerificationStatus, ItemStatus } from '@/types';

interface StatusBadgeProps {
  value: SeverityLevel | VerificationStatus | ItemStatus | string;
  type?: 'severity' | 'status' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, type = 'default' }) => {
  const getBadgeStyle = () => {
    const val = value.toLowerCase();
    
    // Severity colors
    if (val === 'critical') return 'bg-red-950/70 text-red-400 border-red-800/60';
    if (val === 'high') return 'bg-amber-950/70 text-amber-400 border-amber-800/60';
    if (val === 'medium') return 'bg-yellow-950/70 text-yellow-400 border-yellow-800/60';
    if (val === 'low') return 'bg-zinc-950/70 text-zinc-400 border-zinc-800/60';
    
    // Status colors
    if (val === 'verified' || val === 'closed' || val === 'confirmed' || val === 'resolved') {
      return 'bg-zinc-950/70 text-zinc-400 border-zinc-800/60';
    }
    if (val === 'unverified' || val === 'open' || val === 'active') {
      return 'bg-zinc-950/70 text-zinc-400 border-zinc-800/60';
    }
    if (val === 'pending' || val === 'in progress') {
      return 'bg-purple-950/70 text-purple-400 border-purple-800/60';
    }
    if (val === 'failed' || val === 'not verified') {
      return 'bg-rose-950/70 text-rose-400 border-rose-800/60';
    }
    
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {value}
    </span>
  );
};
