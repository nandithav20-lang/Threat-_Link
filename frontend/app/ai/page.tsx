'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { aiService, AIAnalysisData } from '@/services/aiService';
import {
  Brain,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Search,
  CreditCard,
  Network,
  ArrowRight,
  Tag,
  Check,
} from 'lucide-react';

type AIStatus = 'Not Run' | 'Running' | 'Completed' | 'Unavailable' | 'Failed';

export default function AIInvestigationPage() {
  const [status, setStatus] = useState<AIStatus>('Not Run');
  const [data, setData] = useState<AIAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    try {
      setStatus('Running');
      setError(null);

      const res = await aiService.runAIAnalysis();

      if (res.success && res.data) {
        setData(res.data);
        setStatus('Completed');
      } else {
        setError(res.message || 'AI analysis service is currently unavailable.');
        setStatus('Unavailable');
      }
    } catch (err: any) {
      setError(err?.message || 'AI analysis service is currently unavailable.');
      setStatus('Failed');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'Not Run':
        return (
          <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Not Run
          </span>
        );
      case 'Running':
        return (
          <span className="px-3 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Running Pipeline...
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'Unavailable':
        return (
          <span className="px-3 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Unavailable
          </span>
        );
      case 'Failed':
        return (
          <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
    }
  };

  const getVerificationStatusBadge = (verStatus: string) => {
    const s = verStatus.toLowerCase();
    if (s === 'supported') {
      return (
        <span className="px-2.5 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
          <Check className="w-3 h-3" />
          Supported
        </span>
      );
    }
    if (s === 'partially_supported') {
      return (
        <span className="px-2.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3 h-3" />
          Partially Supported
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 w-fit">
        <HelpCircle className="w-3 h-3" />
        Insufficient Evidence
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Investigation Analysis"
        description="Run 5-stage evidence-based AI agent pipeline to analyze threats, dark web exposures, fraud events, and correlation chains."
      />

      {/* Action Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-950 border border-zinc-700/50 rounded-lg text-zinc-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-white">AI Agent Pipeline</h2>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Collector → Analyzer → Verifier → Fraud Analyzer → Correlation Analyzer
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={status === 'Running'}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-600 hover:bg-zinc-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          {status === 'Running' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run AI Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <p className="font-semibold text-rose-200">AI Service Error</p>
            <p className="text-slate-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Initial Empty / Not Run State */}
      {status === 'Not Run' && !data && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-full text-slate-500">
            <Brain className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-slate-200">AI Pipeline Ready</h3>
            <p className="text-xs text-slate-400">
              Click &quot;Run AI Analysis&quot; above to initiate automated multi-agent analysis over your current dataset and correlated findings.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results Sections */}
      {data && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Analysis Findings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">1. Analysis Findings</h3>
              <span className="text-xs font-mono text-slate-500 ml-auto">
                {data.analysis_results.length} Findings
              </span>
            </div>

            {data.analysis_results.length === 0 ? (
              <p className="text-xs text-slate-500">No threat or dark web findings detected.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.analysis_results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 capitalize">
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono text-[10px] uppercase font-bold">
                        {item.severity}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Entity: <span className="font-mono text-zinc-300 font-medium">{item.entity}</span>
                    </div>
                    <p className="text-slate-300 text-xs bg-slate-900/80 p-2.5 rounded border border-slate-800/60">
                      {item.observation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Verification Findings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Search className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-white">2. Verification Findings</h3>
              <span className="text-xs font-mono text-slate-500 ml-auto">
                {data.verification_results.length} Verifications
              </span>
            </div>

            {data.verification_results.length === 0 ? (
              <p className="text-xs text-slate-500">No verification results available.</p>
            ) : (
              <div className="space-y-3">
                {data.verification_results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-200 capitalize block">
                        {item.finding.replace('_', ' ')}
                      </span>
                      <p className="text-slate-400 text-xs">{item.reason}</p>
                    </div>
                    <div>{getVerificationStatusBadge(item.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Fraud Findings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <CreditCard className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">3. Fraud Event Findings</h3>
              <span className="text-xs font-mono text-slate-500 ml-auto">
                {data.fraud_results.length} Patterns
              </span>
            </div>

            {data.fraud_results.length === 0 ? (
              <p className="text-xs text-slate-500">No fraud findings detected.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.fraud_results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/50">
                        {item.event_id}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{item.observation}</p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1 mr-1">
                        <Tag className="w-3 h-3" /> Evidence:
                      </span>
                      {item.evidence.map((ev, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-2 py-0.5 bg-slate-900 text-slate-300 font-mono text-[10px] rounded border border-slate-800"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Correlation Findings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Network className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">4. Correlation Findings</h3>
              <span className="text-xs font-mono text-slate-500 ml-auto">
                {data.correlation_results.length} Explanations
              </span>
            </div>

            {data.correlation_results.length === 0 ? (
              <p className="text-xs text-slate-500">No correlation findings available.</p>
            ) : (
              <div className="space-y-3">
                {data.correlation_results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded">
                        {item.source}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded">
                        {item.relationship}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded">
                        {item.target}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs bg-slate-900/80 p-2.5 rounded border border-slate-800/60">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
