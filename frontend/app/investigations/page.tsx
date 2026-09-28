'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Investigation } from '@/types';
import { Eye, Plus } from 'lucide-react';

const staticInvestigations: Investigation[] = [
  {
    id: 'INV-001',
    title: 'EMP001 Credential Investigation',
    risk: 'Critical',
    status: 'Open',
    created: '2026-09-25',
  },
  {
    id: 'INV-002',
    title: 'Suspicious Wire Transfer ACC089',
    risk: 'High',
    status: 'Open',
    created: '2026-09-24',
  },
  {
    id: 'INV-003',
    title: 'Corporate VPN Access Breach Analysis',
    risk: 'Medium',
    status: 'In Progress',
    created: '2026-09-22',
  },
  {
    id: 'INV-004',
    title: 'Unrecognized Wallet Transfer Investigation',
    risk: 'High',
    status: 'Closed',
    created: '2026-09-20',
  },
];

export default function InvestigationsPage() {
  const handleView = (id: string) => {
    alert(`View Investigation ${id} (Static UI Demo - Detail view in Step 13)`);
  };

  const columns: Column<Investigation>[] = [
    {
      header: 'Investigation ID',
      cell: (item) => (
        <span className="font-mono text-zinc-400 font-bold">{item.id}</span>
      ),
    },
    {
      header: 'Title',
      cell: (item) => <span className="font-medium text-white">{item.title}</span>,
    },
    {
      header: 'Risk',
      cell: (item) => <StatusBadge value={item.risk} type="severity" />,
    },
    {
      header: 'Status',
      cell: (item) => <StatusBadge value={item.status} type="status" />,
    },
    {
      header: 'Created',
      cell: (item) => <span className="text-slate-400 text-xs font-mono">{item.created}</span>,
    },
    {
      header: 'Action',
      cell: (item) => (
        <button
          onClick={() => handleView(item.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investigations Case Management"
        description="Active and archived fraud investigations correlation cases managed by security analysts."
        action={
          <button
            onClick={() => alert('New Investigation clicked (UI Demo)')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-600 text-white hover:bg-zinc-500 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Case
          </button>
        }
      />

      <DataTable columns={columns} data={staticInvestigations} />
    </div>
  );
}
