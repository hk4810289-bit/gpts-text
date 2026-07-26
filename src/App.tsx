import React, { useState, useEffect, useCallback } from 'react';
import { Client, ApiLog, Language } from './types';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { ClientTable } from './components/ClientTable';
import { AddClientModal } from './components/AddClientModal';
import { LogCampaignModal } from './components/LogCampaignModal';
import { TopupModal } from './components/TopupModal';
import { ApiLogsSection } from './components/ApiLogsSection';
import { QuickTester } from './components/QuickTester';
import { OpenApiDrawer } from './components/OpenApiDrawer';
import { getTranslation } from './locales/i18n';
import { ShieldAlert, Sparkles } from 'lucide-react';

const API_TOKEN = 'MY_SECRET_TOKEN';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState({
    totalClients: 0,
    totalSpentUSD: 0,
    totalSpentBDT: 0,
    totalRemainingBalanceUSD: 0,
    totalRemainingBalanceBDT: 0,
    activeCampaigns: 0,
  });
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isLogUpdateOpen, setIsLogUpdateOpen] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isOpenApiOpen, setIsOpenApiOpen] = useState(false);
  const [selectedClientForModal, setSelectedClientForModal] = useState<Client | null>(null);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Clients
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        if (data.clients) setClients(data.clients);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  }, []);

  // Fetch API Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setApiLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }, []);

  // Initial Load & Polling
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      await Promise.all([fetchClients(), fetchLogs()]);
      setLoading(false);
    }
    loadInitial();

    // Poll logs and clients every 2.5 seconds for live real-time API feedback
    const interval = setInterval(() => {
      fetchClients();
      fetchLogs();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchClients, fetchLogs]);

  // Handlers
  const handleAddClient = async (data: {
    name: string;
    company?: string;
    initialBalanceUSD?: number;
    usdToBdtRate?: number;
  }) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || 'Failed to add client');
    }

    await Promise.all([fetchClients(), fetchLogs()]);
    showToast(getTranslation(lang, 'clientAddedSuccess'));
  };

  const handleLogCampaignUpdate = async (data: {
    clientId: string;
    spentUSD: number;
    impressions?: number;
    clicks?: number;
    leads?: number;
    campaignStatus?: any;
    notes?: string;
  }) => {
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || 'Failed to log campaign update');
    }

    await Promise.all([fetchClients(), fetchLogs()]);
    showToast(getTranslation(lang, 'updateLoggedSuccess'));
  };

  const handleTopup = async (data: { clientId: string; amountUSD: number; notes?: string }) => {
    const res = await fetch('/api/topups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || 'Failed to top-up balance');
    }

    await Promise.all([fetchClients(), fetchLogs()]);
    showToast(getTranslation(lang, 'topupSuccess'));
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      await fetchLogs();
      showToast('API logs cleared.');
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all clients to initial benchmark dataset?')) {
      try {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });
        await Promise.all([fetchClients(), fetchLogs()]);
        showToast('Agency data reset to benchmark dataset.');
      } catch (err) {
        console.error('Failed to reset data:', err);
      }
    }
  };

  const openLogUpdateModalForClient = (client: Client) => {
    setSelectedClientForModal(client);
    setIsLogUpdateOpen(true);
  };

  const openTopupModalForClient = (client: Client) => {
    setSelectedClientForModal(client);
    setIsTopupOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <Navbar
        lang={lang}
        setLang={setLang}
        apiToken={API_TOKEN}
        onOpenOpenApi={() => setIsOpenApiOpen(true)}
        onOpenLogs={() => {
          const el = document.getElementById('recent-api-logs-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        logCount={apiLogs.length}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <Sparkles className="h-4 w-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <MetricsOverview lang={lang} summary={summary} />

        {/* Primary Client Table */}
        <ClientTable
          lang={lang}
          clients={clients}
          onOpenAddClient={() => setIsAddClientOpen(true)}
          onOpenLogUpdate={openLogUpdateModalForClient}
          onOpenTopup={openTopupModalForClient}
        />

        {/* Interactive AI Agent Simulator & cURL Tester */}
        <QuickTester
          lang={lang}
          apiToken={API_TOKEN}
          clients={clients}
          onLogUpdate={handleLogCampaignUpdate}
          onTopup={handleTopup}
          onAddClient={handleAddClient}
          onRefreshLogs={fetchLogs}
        />

        {/* Real-time Inbound API Logs Drawer/Section */}
        <ApiLogsSection
          lang={lang}
          logs={apiLogs}
          onClearLogs={handleClearLogs}
          onRefreshLogs={fetchLogs}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Agency AI Integration MVP &bull; Express + Vite Engine</span>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/api/openapi.json" target="_blank" className="hover:text-emerald-400 transition-colors">
              /api/openapi.json
            </a>
            <a href="/api/clients" target="_blank" className="hover:text-emerald-400 transition-colors">
              /api/clients
            </a>
            <a href="/api/health" target="_blank" className="hover:text-emerald-400 transition-colors">
              /api/health
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        lang={lang}
        onAddClient={handleAddClient}
      />

      <LogCampaignModal
        isOpen={isLogUpdateOpen}
        onClose={() => {
          setIsLogUpdateOpen(false);
          setSelectedClientForModal(null);
        }}
        lang={lang}
        clients={clients}
        initialClient={selectedClientForModal}
        onLogUpdate={handleLogCampaignUpdate}
      />

      <TopupModal
        isOpen={isTopupOpen}
        onClose={() => {
          setIsTopupOpen(false);
          setSelectedClientForModal(null);
        }}
        lang={lang}
        clients={clients}
        initialClient={selectedClientForModal}
        onTopup={handleTopup}
      />

      <OpenApiDrawer
        isOpen={isOpenApiOpen}
        onClose={() => setIsOpenApiOpen(false)}
        lang={lang}
        apiToken={API_TOKEN}
      />

    </div>
  );
}
