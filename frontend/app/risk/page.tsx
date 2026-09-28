'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { riskService, RiskAnalysisData } from '@/services/riskService';
import {
  ShieldAlert,
  Calculator,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  FileText,
  Zap,
  Globe,
  CreditCard,
  Network,
  CheckCheck,
} from 'lucide-react';

export default function RiskAnalysisPage() {
  const [riskData, setRiskData] = useState<RiskAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await riskService.getRisk('INC-DEMO-001');
      if (res.success && res.data) {
        setRiskData(res.data);
      } else {
        setError(res.message || 'Unable to load risk analysis.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load risk analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  const handleCalculateRisk = async () => {
    try {
      setCalculating(true);
      setError(null);
      const res = await riskService.calculateRisk('INC-DEMO-001');
      if (res.success && res.data) {
        setRiskData(res.data);
      } else {
        setError(res.message || 'Unable to calculate risk score.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to calculate risk score.');
    } finally {
      setCalculating(false);
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const norm = (level || '').toUpperCase();
    switch (norm) {
      case 'CRITICAL':
        return (
          <span className="px-3.5 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-rose-950/50">
            <AlertTriangle className="w-4 h-4" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-3.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-amber-950/50">
            <AlertTriangle className="w-4 h-4" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-3.5 py-1 bg-yellow-950 text-yellow-400 border border-yellow-800 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            LOW
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-rose-500 stroke-rose-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    if (score >= 25) return 'text-yellow-500 stroke-yellow-500';
    return 'text-zinc-500 stroke-zinc-500';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Analysis"
        description="Explainable deterministic risk score calculation based on threat severity, dark web signals, banking fraud, relationship correlation, and AI evidence verification."
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-950 border border-zinc-700/50 rounded-lg text-zinc-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Risk Evaluation Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Incident Ref: <span className="font-mono text-zinc-400">INC-DEMO-001</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleCalculateRisk}
          disabled={calculating}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
          <span>{calculating ? 'Calculating Risk...' : 'Calculate Risk'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm font-medium">Calculating risk metrics...</p>
        </div>
      ) : riskData ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Card */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between shadow-lg">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Risk Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold font-mono ${getScoreColor(riskData.risk_score)}`}>
                    {riskData.risk_score}
                  </span>
                  <span className="text-slate-500 font-mono text-lg">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Deterministic weight summation across 5 evidence categories
                </p>
              </div>

              {/* Score Gauge Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`stroke-current ${getScoreColor(riskData.risk_score)}`}
                    strokeDasharray={`${riskData.risk_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute font-mono font-bold text-sm ${getScoreColor(riskData.risk_score)}`}>
                  {riskData.risk_score}%
                </span>
              </div>
            </div>

            {/* Level Card */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between shadow-lg space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Evaluated Risk Level
                </span>
                <div>{getRiskLevelBadge(riskData.risk_level)}</div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] text-center font-mono">
                <div className={`p-1.5 rounded border ${riskData.risk_level === 'LOW' ? 'bg-zinc-950/80 border-zinc-500 text-zinc-400 font-bold' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  0-24 LOW
                </div>
                <div className={`p-1.5 rounded border ${riskData.risk_level === 'MEDIUM' ? 'bg-yellow-950/80 border-yellow-500 text-yellow-400 font-bold' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  25-49 MED
                </div>
                <div className={`p-1.5 rounded border ${riskData.risk_level === 'HIGH' ? 'bg-amber-950/80 border-amber-500 text-amber-400 font-bold' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  50-74 HIGH
                </div>
                <div className={`p-1.5 rounded border ${riskData.risk_level === 'CRITICAL' ? 'bg-rose-950/80 border-rose-500 text-rose-400 font-bold' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>
                  75-100 CRIT
                </div>
              </div>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                Risk Factor Breakdown
              </h3>
              <span className="text-xs text-slate-400">Score Weights (Sum: 100 Points Max)</span>
            </div>

            <div className="space-y-4">
              {/* Factor 1: Threat Severity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Threat Severity
                  </span>
                  <span className="font-mono text-slate-200">
                    {riskData.factor_scores.threat} / 20
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(riskData.factor_scores.threat / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 2: Dark Web Evidence */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    Dark Web Evidence
                  </span>
                  <span className="font-mono text-slate-200">
                    {riskData.factor_scores.dark_web} / 20
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${(riskData.factor_scores.dark_web / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 3: Fraud Severity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                    Fraud Severity
                  </span>
                  <span className="font-mono text-slate-200">
                    {riskData.factor_scores.fraud} / 25
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${(riskData.factor_scores.fraud / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 4: Correlation Strength */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <Network className="w-3.5 h-3.5 text-zinc-400" />
                    Correlation Strength
                  </span>
                  <span className="font-mono text-slate-200">
                    {riskData.factor_scores.correlation} / 20
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-zinc-500 transition-all duration-500"
                    style={{ width: `${(riskData.factor_scores.correlation / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 5: Verification Status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-2">
                    <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />
                    Verification Status
                  </span>
                  <span className="font-mono text-slate-200">
                    {riskData.factor_scores.verification} / 15
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-zinc-500 transition-all duration-500"
                    style={{ width: `${(riskData.factor_scores.verification / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Explanation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3 shadow-lg">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-zinc-400" />
              Risk Explanation & Investigation Context
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
              {riskData.explanation}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
