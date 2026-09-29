'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWebSocket } from '@/context/WebSocketContext';
import {
  Radio,
  ShieldAlert,
  Trash2,
  Cpu,
  DatabaseCheck,
  AlertTriangle,
  Building2,
  Send,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  BellRing,
  Lock,
} from 'lucide-react';

interface BankDispatchLog {
  id: string;
  bankName: string;
  incidentId: string;
  severity: string;
  status: 'DISPATCHED' | 'ACKNOWLEDGED';
  timestamp: string;
  ackHash: string;
}

const initialAlerts = [
  {
    id: 'ALT-001',
    title: 'SWIFT Wire Transfer Anomaly via TOR Exit Node',
    severity: 'CRITICAL',
    source: 'Banking Fraud Engine',
    details: 'Rapid $145,000 transfer originating from TOR IP 185.220.101.5 matching compromised account #88492019.',
    bankName: 'FinCorp Global SOC',
    status: 'Open',
    bankNotified: true,
    ackHash: 'ACK-FINCORP-88291',
    timestamp: '2026-09-26T22:15:00Z',
  },
  {
    id: 'ALT-002',
    title: 'Exposed Employee Credentials Spotted on Dark Web',
    severity: 'HIGH',
    source: 'Dark Web Crawler',
    details: 'Credential hash dump discovered on BreachForums matching corporate domain investigator@fincorp-global.com.',
    bankName: 'Core Banking Gateway',
    status: 'Open',
    bankNotified: false,
    timestamp: '2026-09-25T14:10:00Z',
  },
  {
    id: 'ALT-003',
    title: 'Typosquatted Phishing Domain Targeting Online Banking',
    severity: 'HIGH',
    source: 'DNS Threat Scanner',
    details: 'Domain fincorp-secure-login-verify.com registered to harvest employee login tokens.',
    bankName: 'SWIFT Security Operations',
    status: 'Active',
    bankNotified: true,
    ackHash: 'ACK-SWIFT-10928',
    timestamp: '2026-09-24T18:45:00Z',
  },
];

export default function AlertsPage() {
  const { isConnected, alerts: liveAlerts, clearAlerts } = useWebSocket();
  const [staticAlertList, setStaticAlertList] = useState(initialAlerts);

  // Bank alert modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('FinCorp Global SOC');
  const [dispatchChannel, setDispatchChannel] = useState<string>('ISO 20022 Encrypted API');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History logs
  const [dispatchHistory, setDispatchHistory] = useState<BankDispatchLog[]>([
    {
      id: 'DISP-001',
      bankName: 'FinCorp Global SOC',
      incidentId: 'ALT-001',
      severity: 'CRITICAL',
      status: 'ACKNOWLEDGED',
      timestamp: '2026-09-26 22:16:10',
      ackHash: '0x8f2910a9c8b7e6d5a4b3c2d1e0f98765',
    },
    {
      id: 'DISP-002',
      bankName: 'SWIFT Security Operations',
      incidentId: 'ALT-003',
      severity: 'HIGH',
      status: 'ACKNOWLEDGED',
      timestamp: '2026-09-24 18:47:05',
      ackHash: '0xe104928172901a84f3e2d1c0b9a8f7e6',
    },
  ]);

  const handleOpenDispatchModal = (alertItem: any) => {
    setSelectedAlert(alertItem);
    setSelectedBank(alertItem.bankName || 'FinCorp Global SOC');
    setAnalystNotes(`Immediate security intervention requested for ${alertItem.id}. Freeze target accounts and block associated indicators.`);
    setDispatchModalOpen(true);
  };

  const handleSendBankAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setIsSending(true);

    setTimeout(() => {
      const ackCode = `ACK-${selectedBank.split(' ')[0].toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newLog: BankDispatchLog = {
        id: `DISP-${Math.floor(100 + Math.random() * 900)}`,
        bankName: selectedBank,
        incidentId: selectedAlert.id,
        severity: selectedAlert.severity || 'HIGH',
        status: 'ACKNOWLEDGED',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ackHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      };

      setDispatchHistory((prev) => [newLog, ...prev]);

      // Mark alert as bankNotified
      setStaticAlertList((prev) =>
        prev.map((item) =>
          item.id === selectedAlert.id
            ? { ...item, bankNotified: true, ackHash: ackCode }
            : item
        )
      );

      setIsSending(false);
      setDispatchModalOpen(false);
      setToastMessage(`Alert dispatched successfully to ${selectedBank}! Delivery ACK: ${ackCode}`);

      setTimeout(() => setToastMessage(null), 5000);
    }, 1200);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'DARK_WEB_LEAK':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'BANKING_FRAUD':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'AI_AGENT_CORRELATION':
        return <Cpu className="w-5 h-5 text-zinc-400" />;
      case 'BLOCKCHAIN_ANCHOR':
        return <DatabaseCheck className="w-5 h-5 text-zinc-400" />;
      default:
        return <Radio className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Live Incident Alerts & Bank Dispatch Center"
          description="Real-time threat broadcasts with automated ISO 20022 SOC incident notifications to impacted banking institutions."
        />

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium ${
              isConnected
                ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isConnected ? 'text-[#e4e4e7] animate-pulse' : 'text-slate-500'
              }`}
            />
            <span>{isConnected ? 'LIVE WEBSOCKET STREAMING' : 'STREAM ACTIVE'}</span>
          </div>

          {liveAlerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-xs font-mono transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stream ({liveAlerts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-zinc-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Live Incoming Stream Section */}
      {liveAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 font-mono tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e4e4e7] animate-ping" />
            Real-Time Broadcast Signals ({liveAlerts.length})
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {liveAlerts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-zinc-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mt-0.5">
                    {getIcon(item.event_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs text-zinc-400 font-bold">{item.id}</span>
                      <StatusBadge value={item.severity} type="severity" />
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {item.source}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans mt-1">{item.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 font-sans">{item.details}</p>
                    <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Impacted Bank: <strong className="text-zinc-200">FinCorp Global SOC</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenDispatchModal(item)}
                    className="px-3.5 py-1.5 bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-colors"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Alert Respected Bank</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incident Alerts Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center gap-2">
          <BellRing className="w-4 h-4 text-zinc-400" />
          Active Security Incidents requiring Bank Dispatch
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {staticAlertList.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs text-zinc-400 font-bold">{item.id}</span>
                    <StatusBadge value={item.severity} type="severity" />
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.source}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-sans mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 font-sans">{item.details}</p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      Target Institution: <strong className="text-slate-200">{item.bankName}</strong>
                    </span>

                    {item.bankNotified ? (
                      <span className="inline-flex items-center gap-1 text-zinc-400 font-semibold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        <CheckCircle2 className="w-3 h-3" />
                        BANK NOTIFIED ({item.ackHash || 'ACK-200'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        <Clock className="w-3 h-3 animate-pulse" />
                        DISPATCH PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => handleOpenDispatchModal(item)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow flex items-center gap-1.5 transition-colors ${
                    item.bankNotified
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-zinc-600 hover:bg-zinc-500 text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{item.bankNotified ? 'Re-Dispatch Alert' : 'Alert Respected Bank'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Alert Dispatch Audit Log */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
          <Building2 className="w-4 h-4 text-zinc-400" />
          Respected Bank Dispatch Audit Trail
        </h3>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Dispatch ID</th>
                  <th className="px-4 py-3">Target Bank / Institution</th>
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Delivery Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Cryptographic ACK Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {dispatchHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-zinc-400">{log.id}</td>
                    <td className="px-4 py-3 text-white font-sans font-semibold flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      {log.bankName}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{log.incidentId}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={log.severity} type="severity" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-zinc-400 font-semibold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="px-4 py-3 text-slate-400 text-[10px] font-mono">{log.ackHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dispatch Bank Alert Modal */}
      {dispatchModalOpen && selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <span>Dispatch Incident Alert to Respected Bank</span>
              </h3>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">
                Incident ID: <strong className="text-zinc-400">{selectedAlert.id}</strong>
              </div>
              <div className="text-slate-200 font-sans font-bold text-xs">{selectedAlert.title}</div>
              <div className="text-slate-400 font-sans">{selectedAlert.details}</div>
            </div>

            <form onSubmit={handleSendBankAlert} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Banking Institution</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="FinCorp Global SOC">FinCorp Global SOC (Primary Hub)</option>
                  <option value="Core Banking Gateway Operations">Core Banking Gateway Operations</option>
                  <option value="SWIFT International Fraud Network">SWIFT International Fraud Network</option>
                  <option value="Federal Reserve Banking Cyber Unit">Federal Reserve Banking Cyber Unit</option>
                  <option value="National Interbank SOC Network">National Interbank SOC Network</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notification Protocol & Channel</label>
                <select
                  value={dispatchChannel}
                  onChange={(e) => setDispatchChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="ISO 20022 Encrypted API">ISO 20022 Encrypted API Webhook (Automated)</option>
                  <option value="High-Priority SOC Pager Protocol">High-Priority SOC Pager Protocol</option>
                  <option value="Automated Account Freeze Trigger">Automated Account Freeze Protocol</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Analyst Directives & Notes</label>
                <textarea
                  rows={3}
                  required
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-sans focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="p-3 bg-zinc-950/60 border border-zinc-800/40 rounded-lg text-[11px] text-zinc-300 space-y-1">
                <span className="font-semibold block text-zinc-200">ISO 20022 Compliance Notice</span>
                <p>This automated alert dispatch creates a cryptographic proof log and notifies the bank's Security Operations Center instantly.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-600 hover:bg-zinc-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {isSending ? 'Dispatching Alert...' : 'Confirm & Dispatch to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
