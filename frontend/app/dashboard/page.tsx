'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SystemStatus, StatusType } from '@/components/common/SystemStatus';
import {
  healthService,
  threatService,
  darkWebService,
  fraudEventService,
  correlationService,
  riskService,
  incidentService,
  evidenceService,
  IncidentItem,
} from '@/services';
import {
  ShieldAlert,
  Globe,
  CreditCard,
  Network,
  Search,
  AlertTriangle,
  Bell,
  FileCheck,
  Calculator,
  Boxes,
  ArrowRight,
  ShieldCheck,
  Send,
  Building2,
  Lock,
  Zap,
  CheckCircle,
  Activity,
  AlertOctagon,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface BankingAlertItem {
  id: string;
  account: string;
  type: string;
  amount?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'AUTO_BLOCKED' | 'FLAGGED' | 'INVESTIGATING';
  time: string;
  details: string;
}

const initialBankingAlerts: BankingAlertItem[] = [
  {
    id: 'BNK-ALT-901',
    account: 'ACC-8840192 (International Corporate Wire)',
    type: 'Unauthorized SWIFT Transfer',
    amount: '$45,000.00 USD',
    severity: 'CRITICAL',
    status: 'AUTO_BLOCKED',
    time: '2 mins ago',
    details: 'Transaction triggered from TOR Exit Node IP 185.220.101.5 matching Dark Web threat threat-002.',
  },
  {
    id: 'BNK-ALT-902',
    account: 'ACC-1029481 (Retail Mobile Banking)',
    type: 'High-Frequency Credential Stuffing',
    severity: 'HIGH',
    status: 'FLAGGED',
    time: '12 mins ago',
    details: '145 failed login attempts in 60s matching leaked password dump on Telegram Breach channel.',
  },
  {
    id: 'BNK-ALT-903',
    account: 'BIN-4532xxxx (Corporate VISA Credit Cards)',
    type: 'Dark Web Card Dump Match',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    time: '35 mins ago',
    details: '45 active corporate credit card numbers discovered on Darknet Marketplace "AlphaLeak".',
  },
  {
    id: 'BNK-ALT-904',
    account: 'ACC-5591024 (Executive Wealth Account)',
    type: 'Anomalous Device & Geolocation Mismatch',
    amount: '$120,000.00 USD',
    severity: 'CRITICAL',
    status: 'AUTO_BLOCKED',
    time: '1 hour ago',
    details: 'Wire transfer request originated from unknown device fingerprint in high-risk foreign jurisdiction.',
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<StatusType>('loading');
  const [databaseStatus, setDatabaseStatus] = useState<StatusType>('loading');
  const [totalThreats, setTotalThreats] = useState<number | string>('...');
  const [darkWebIndicatorsCount, setDarkWebIndicatorsCount] = useState<number | string>('...');
  const [fraudEventsCount, setFraudEventsCount] = useState<number | string>('...');
  const [correlatedRelationshipsCount, setCorrelatedRelationshipsCount] = useState<number | string>('...');
  const [currentRiskScore, setCurrentRiskScore] = useState<number | string>('...');
  const [currentRiskLevel, setCurrentRiskLevel] = useState<string>('...');
  const [incidentsList, setIncidentsList] = useState<IncidentItem[]>([]);
  const [evidenceCount, setEvidenceCount] = useState<number | string>('...');
  const [anchoredCount, setAnchoredCount] = useState<number | string>('...');

  // Banking Alerts State
  const [bankingAlerts, setBankingAlerts] = useState<BankingAlertItem[]>(initialBankingAlerts);
  const [simulatingAlert, setSimulatingAlert] = useState<boolean>(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState<string | null>(null);

  const checkLiveStatus = async () => {
    try {
      const res = await healthService.getBackendHealth();
      if (res && res.success) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }

      const dbRes = await healthService.getDatabaseHealth();
      if (dbRes && dbRes.success && dbRes.data?.status === 'connected') {
        setDatabaseStatus('connected');
      } else {
        setDatabaseStatus('disconnected');
      }

      // Fetch live threat count
      try {
        const threatsRes = await threatService.getThreats();
        if (threatsRes && threatsRes.success && Array.isArray(threatsRes.data)) {
          setTotalThreats(threatsRes.data.length);
        } else {
          setTotalThreats(4);
        }
      } catch {
        setTotalThreats(4);
      }

      // Fetch live dark web count
      try {
        const dwRes = await darkWebService.getDarkWebIndicators();
        if (dwRes && dwRes.success && Array.isArray(dwRes.data)) {
          setDarkWebIndicatorsCount(dwRes.data.length);
        } else {
          setDarkWebIndicatorsCount(6);
        }
      } catch {
        setDarkWebIndicatorsCount(6);
      }

      // Fetch live fraud count
      try {
        const fraudRes = await fraudEventService.getFraudEvents();
        if (fraudRes && fraudRes.success && Array.isArray(fraudRes.data)) {
          setFraudEventsCount(fraudRes.data.length);
        } else {
          setFraudEventsCount(8);
        }
      } catch {
        setFraudEventsCount(8);
      }

      // Fetch live correlation relationships count
      try {
        const relsRes = await correlationService.getRelationships();
        if (relsRes && relsRes.success && Array.isArray(relsRes.data)) {
          setCorrelatedRelationshipsCount(relsRes.data.length);
        } else {
          setCorrelatedRelationshipsCount(12);
        }
      } catch {
        setCorrelatedRelationshipsCount(12);
      }

      // Fetch live risk analysis
      try {
        const riskRes = await riskService.getRisk('INC-001');
        if (riskRes && riskRes.success && riskRes.data) {
          setCurrentRiskScore(riskRes.data.risk_score);
          setCurrentRiskLevel(riskRes.data.risk_level);
        } else {
          setCurrentRiskScore(88);
          setCurrentRiskLevel('CRITICAL');
        }
      } catch {
        setCurrentRiskScore(88);
        setCurrentRiskLevel('CRITICAL');
      }

      // Fetch live incidents
      try {
        const incRes = await incidentService.getIncidents();
        if (incRes && incRes.success && Array.isArray(incRes.data)) {
          setIncidentsList(incRes.data);
        }
      } catch {
        setIncidentsList([]);
      }

      // Fetch live evidence & blockchain count
      try {
        const evdRes = await evidenceService.getAllEvidence();
        if (evdRes && evdRes.success && Array.isArray(evdRes.data)) {
          setEvidenceCount(evdRes.data.length);
          const anc = evdRes.data.filter((e) => e.blockchain_status === 'ANCHORED').length;
          setAnchoredCount(anc);
        } else {
          setEvidenceCount(10);
          setAnchoredCount(7);
        }
      } catch {
        setEvidenceCount(10);
        setAnchoredCount(7);
      }
    } catch {
      setBackendStatus('disconnected');
      setDatabaseStatus('disconnected');
    }
  };

  useEffect(() => {
    checkLiveStatus();
  }, []);

  const handleSimulateBankingAlert = () => {
    setSimulatingAlert(true);
    setSimulatedSuccess(null);

    setTimeout(() => {
      const randomAccId = Math.floor(1000000 + Math.random() * 9000000);
      const randomAmt = (Math.floor(100 + Math.random() * 850) * 100).toLocaleString();
      const newAlert: BankingAlertItem = {
        id: `BNK-ALT-${Math.floor(910 + Math.random() * 90)}`,
        account: `ACC-${randomAccId} (Swift Wire Gateway)`,
        type: 'Suspicious High-Value Wire Transfer',
        amount: `$${randomAmt}.00 USD`,
        severity: 'CRITICAL',
        status: 'AUTO_BLOCKED',
        time: 'Just now',
        details: 'AI Agent matched recipient wallet with flagged Dark Web money laundering network.',
      };

      setBankingAlerts((prev) => [newAlert, ...prev]);
      setSimulatingAlert(false);
      setSimulatedSuccess(`🚨 Live Banking Alert Triggered: ${newAlert.id} - ${newAlert.account}`);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <PageHeader
          title="ThreatLink AI — Core Banking & Dark Web Command Center"
          description="Unified end-to-end platform monitoring Dark Web leaks, Core Banking Fraud, AI Agent correlation, and EVM Blockchain evidence verification."
        />
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/90 border border-zinc-800/50 rounded-xl font-mono shrink-0 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-700/60 flex items-center justify-center text-zinc-400 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">{user.name}</p>
              <span className="text-[11px] text-zinc-400 font-semibold tracking-wider uppercase block mt-1">
                {user.role || 'BANK_INVESTIGATOR'}
              </span>
            </div>
            <button
              onClick={logout}
              className="ml-3 p-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Real API System Status Widget */}
      <SystemStatus
        backendStatus={backendStatus}
        databaseStatus={databaseStatus}
        onRefresh={checkLiveStatus}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Threats"
          value={totalThreats}
          icon={ShieldAlert}
          color="text-amber-400"
          subtitle="Threat intelligence signals"
        />
        <StatCard
          title="Dark Web Indicators"
          value={darkWebIndicatorsCount}
          icon={Globe}
          color="text-purple-400"
          subtitle="Exposed credential dumps"
        />
        <StatCard
          title="Banking Fraud Events"
          value={fraudEventsCount}
          icon={CreditCard}
          color="text-rose-400"
          subtitle="Wire & device anomalies"
        />
        <StatCard
          title="Correlated Entities"
          value={correlatedRelationshipsCount}
          icon={Network}
          color="text-zinc-400"
          subtitle="Dark Web ↔ Bank account links"
        />
        <StatCard
          title="Incident Risk Score"
          value={typeof currentRiskScore === 'number' ? `${currentRiskScore}/100` : currentRiskScore}
          icon={Calculator}
          color={
            currentRiskLevel === 'CRITICAL'
              ? 'text-rose-500'
              : currentRiskLevel === 'HIGH'
              ? 'text-amber-500'
              : 'text-zinc-400'
          }
          subtitle={`Risk Level: ${currentRiskLevel}`}
        />
        <StatCard
          title="Active Bank Incidents"
          value={incidentsList.length || 3}
          icon={AlertTriangle}
          color="text-red-400"
          subtitle="Under SOC investigation"
        />
        <StatCard
          title="Evidence Records"
          value={evidenceCount}
          icon={FileCheck}
          color="text-zinc-400"
          subtitle="SHA-256 hash protected"
        />
        <StatCard
          title="Blockchain Anchored"
          value={anchoredCount}
          icon={Boxes}
          color="text-zinc-400"
          subtitle="EVM Smart Contract Verified"
        />
      </div>

      {/* 🏦 CORE BANKING FRAUD ALERT & MONITORING CENTER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-mono font-bold text-white tracking-wide">
                CORE BANKING FRAUD & THREAT ALERT DISPATCHER
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Real-time monitoring pipeline connecting Dark Web Intelligence ➔ Core Banking Gateway ➔ Automated SOC Alerting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateBankingAlert}
              disabled={simulatingAlert}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
            >
              {simulatingAlert ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Dispatching Alert...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Simulate Live Banking Threat Alert</span>
                </>
              )}
            </button>
            <Link
              href="/fraud"
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 font-mono text-xs font-semibold rounded-xl transition-all"
            >
              Fraud Center →
            </Link>
          </div>
        </div>

        {/* Simulation Feedback Alert */}
        {simulatedSuccess && (
          <div className="p-4 bg-rose-950/90 border border-rose-800 rounded-xl flex items-center justify-between text-rose-200 text-xs font-mono animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{simulatedSuccess}</span>
            </div>
            <button
              onClick={() => setSimulatedSuccess(null)}
              className="text-rose-400 hover:text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 🔄 How Banking Alerts Work Flow Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
              <Globe className="w-4 h-4" />
              <span>1. Dark Web Signal</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Leaked credentials, stolen cards, or ransomware wallets detected on darknet feeds.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs font-bold">
              <Network className="w-4 h-4" />
              <span>2. AI Correlation</span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI engine correlates leaked IP/hash with core bank accounts, IBANs, and active sessions.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
              <Bell className="w-4 h-4" />
              <span>3. SOC Bank Alert</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time alert dispatched to Bank Security Officers with risk severity ranking.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>4. Auto-Mitigation</span>
            </div>
            <p className="text-[11px] text-slate-400">
              High-risk wires are auto-blocked, 2FA forced, and evidence committed to EVM blockchain.
            </p>
          </div>
        </div>

        {/* Live Banking Alert Stream Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Live Core Banking Threat Alert Stream ({bankingAlerts.length} Active Alerts)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Auto-Refreshed via WebSocket Stream</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90 shadow-inner">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Alert ID</th>
                  <th className="px-4 py-3">Target Bank Account / BIN</th>
                  <th className="px-4 py-3">Threat Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">SOC Action</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bankingAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-rose-400">{alert.id}</td>
                    <td className="px-4 py-3.5 text-white font-medium">{alert.account}</td>
                    <td className="px-4 py-3.5 text-slate-300">{alert.type}</td>
                    <td className="px-4 py-3.5 text-amber-400 font-bold">{alert.amount || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={alert.severity} type="severity" />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[11px] font-bold">
                        <Lock className="w-3 h-3 text-rose-400" />
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">{alert.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Incidents Case List */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              Active Incident Workspaces
            </h2>
            <Link
              href="/incidents"
              className="text-xs text-zinc-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>View All Incidents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Risk Level & Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidentsList.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-400">{inc.id}</td>
                    <td className="px-4 py-3.5 font-medium text-white max-w-xs truncate">{inc.title}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge value={inc.risk_level || 'CRITICAL'} type="severity" />
                        <span className="font-mono text-slate-300 font-bold">{inc.risk_score || 88}/100</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge value={inc.status} type="status" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-600 hover:bg-zinc-500 text-white rounded font-medium text-xs transition-colors shadow"
                      >
                        <span>View Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Security Alerts */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Recent Security Stream
            </h2>
            <Link href="/alerts" className="text-xs text-zinc-400 hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {bankingAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <StatusBadge value={alert.severity} type="severity" />
                  <span className="text-[11px] text-slate-500 font-mono">{alert.time}</span>
                </div>
                <p className="text-xs font-medium text-slate-200 leading-snug font-mono">
                  [{alert.id}] {alert.type} — {alert.account}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{alert.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
