import React, { useState } from 'react';
import { Language, Client } from '../types';
import { getTranslation } from '../locales/i18n';
import { Play, Copy, Check, Terminal, Bot, Sparkles, Send } from 'lucide-react';

interface QuickTesterProps {
  lang: Language;
  apiToken: string;
  clients: Client[];
  onLogUpdate: (data: any) => Promise<void>;
  onTopup: (data: any) => Promise<void>;
  onAddClient: (data: any) => Promise<void>;
  onRefreshLogs: () => void;
}

export const QuickTester: React.FC<QuickTesterProps> = ({
  lang,
  apiToken,
  clients,
  onLogUpdate,
  onTopup,
  onAddClient,
  onRefreshLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'curl'>('simulator');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [copiedCurlIndex, setCopiedCurlIndex] = useState<number | null>(null);

  const baseUrl = window.location.origin;

  const handleSimulateUpdate = async () => {
    setLoadingAction('update');
    setTestResult(null);
    try {
      const client = clients[0] || { id: 'client_1', name: 'Bengal E-Commerce Ltd' };
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          clientId: client.id,
          spentUSD: 125.00,
          impressions: 32000,
          clicks: 1100,
          leads: 42,
          campaignStatus: 'ACTIVE',
          notes: 'Simulated ChatGPT Action Update',
        }),
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
      onRefreshLogs();
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateTopup = async () => {
    setLoadingAction('topup');
    setTestResult(null);
    try {
      const client = clients[1] || clients[0] || { id: 'client_2', name: 'Shohoz Logistics' };
      const res = await fetch('/api/topups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          clientId: client.id,
          amountUSD: 500.00,
          notes: 'Simulated ChatGPT Top-up Deposit',
        }),
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
      onRefreshLogs();
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateAddClient = async () => {
    setLoadingAction('addClient');
    setTestResult(null);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          name: `Pran Marketing ${Math.floor(Math.random() * 1000)}`,
          company: 'Pran-RFL Group',
          initialBalanceUSD: 1000,
          usdToBdtRate: 122.5,
        }),
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
      onRefreshLogs();
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateUnauthorized = async () => {
    setLoadingAction('unauth');
    setTestResult(null);
    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer INVALID_TOKEN_123',
        },
        body: JSON.stringify({
          clientName: 'Bengal E-Commerce Ltd',
          spentUSD: 50,
        }),
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
      onRefreshLogs();
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoadingAction(null);
    }
  };

  const curlExamples = [
    {
      title: 'Fetch All Clients',
      cmd: `curl -X GET "${baseUrl}/api/clients" \\
  -H "Authorization: Bearer ${apiToken}"`,
    },
    {
      title: 'Log Campaign Ad Spend ($125 USD)',
      cmd: `curl -X POST "${baseUrl}/api/updates" \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"clientName":"Bengal E-Commerce Ltd","spentUSD":125,"impressions":32000,"clicks":1100,"leads":42,"campaignStatus":"ACTIVE"}'`,
    },
    {
      title: 'Top-up Client Balance ($500 USD)',
      cmd: `curl -X POST "${baseUrl}/api/topups" \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"clientName":"Shohoz Logistics","amountUSD":500,"notes":"Bank Wire Ref #9901"}'`,
    },
  ];

  const copyCurl = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCurlIndex(index);
    setTimeout(() => setCopiedCurlIndex(null), 2000);
  };

  return (
    <section id="quick-tester-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {getTranslation(lang, 'quickTesterTitle')}
              <Sparkles className="h-4 w-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate external ChatGPT Custom GPT or Gemini Agent calls instantly
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Interactive Simulator</span>
          </button>
          <button
            id="tab-curl"
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'curl'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>cURL Examples</span>
          </button>
        </div>
      </div>

      {/* Simulator View */}
      {activeTab === 'simulator' && (
        <div className="mt-5 space-y-4">
          <p className="text-xs text-slate-400">
            Click any button below to trigger real Express backend API endpoints with simulated agent payloads:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              id="sim-update-btn"
              onClick={handleSimulateUpdate}
              disabled={!!loadingAction}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                <span>1. Log $125 Ad Spend</span>
                <Send className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates ChatGPT logging $125 Meta ad spend for Bengal E-Commerce.
              </p>
            </button>

            <button
              id="sim-topup-btn"
              onClick={handleSimulateTopup}
              disabled={!!loadingAction}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-sky-400 group-hover:text-sky-300 flex items-center justify-between">
                <span>2. Top-up $500 Credit</span>
                <Send className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates ChatGPT topping up Shohoz Logistics account by $500.
              </p>
            </button>

            <button
              id="sim-add-client-btn"
              onClick={handleSimulateAddClient}
              disabled={!!loadingAction}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-teal-400 group-hover:text-teal-300 flex items-center justify-between">
                <span>3. Add New Client</span>
                <Send className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates GPT registering 'Pran Marketing' with $1,000 balance.
              </p>
            </button>

            <button
              id="sim-unauth-btn"
              onClick={handleSimulateUnauthorized}
              disabled={!!loadingAction}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-rose-400 group-hover:text-rose-300 flex items-center justify-between">
                <span>4. Invalid Token Test</span>
                <Send className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates call with invalid Bearer token to test 401 response.
              </p>
            </button>
          </div>

          {/* Test Result Inspector */}
          {testResult && (
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>API Execution Output:</span>
                <span className="text-[10px] text-emerald-400 font-mono">Status: Returned JSON</span>
              </div>
              <pre className="text-xs font-mono text-slate-200 overflow-x-auto max-h-56 scrollbar-thin">
                {testResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* cURL Examples View */}
      {activeTab === 'curl' && (
        <div className="mt-5 space-y-4">
          <p className="text-xs text-slate-400">
            Copy these pre-configured cURL commands to test directly from your terminal or Postman:
          </p>

          <div className="space-y-3">
            {curlExamples.map((ex, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200">{ex.title}</span>
                  <button
                    onClick={() => copyCurl(ex.cmd, idx)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded hover:bg-slate-700 transition-colors"
                  >
                    {copiedCurlIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy cURL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-900/80 rounded border border-slate-800/80">
                  {ex.cmd}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
};
