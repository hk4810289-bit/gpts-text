import React, { useState, useEffect } from 'react';
import { Client, CampaignStatus, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { X, TrendingUp, DollarSign, Target, MousePointer, Eye } from 'lucide-react';

interface LogCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  clients: Client[];
  initialClient?: Client | null;
  onLogUpdate: (data: {
    clientId: string;
    spentUSD: number;
    impressions?: number;
    clicks?: number;
    leads?: number;
    campaignStatus?: CampaignStatus;
    notes?: string;
  }) => Promise<void>;
}

export const LogCampaignModal: React.FC<LogCampaignModalProps> = ({
  isOpen,
  onClose,
  lang,
  clients,
  initialClient,
  onLogUpdate,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [spentUSD, setSpentUSD] = useState(50);
  const [impressions, setImpressions] = useState(12000);
  const [clicks, setClicks] = useState(450);
  const [leads, setLeads] = useState(15);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('ACTIVE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClient) {
      setSelectedClientId(initialClient.id);
      setCampaignStatus(initialClient.lastCampaignStatus || 'ACTIVE');
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
      setCampaignStatus(clients[0].lastCampaignStatus || 'ACTIVE');
    }
  }, [initialClient, clients, isOpen]);

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const rate = currentClient ? currentClient.usdToBdtRate : 122.5;
  const calculatedBDT = Math.round((Number(spentUSD) || 0) * rate * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setError('Please select a client.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogUpdate({
        clientId: selectedClientId,
        spentUSD: Number(spentUSD) || 0,
        impressions: Number(impressions) || 0,
        clicks: Number(clicks) || 0,
        leads: Number(leads) || 0,
        campaignStatus,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="log-campaign-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {getTranslation(lang, 'modalLogUpdateTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                Post daily Facebook / Google / TikTok ad campaign metrics
              </p>
            </div>
          </div>
          <button
            id="close-log-campaign-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Client <span className="text-rose-400">*</span>
            </label>
            <select
              id="log-campaign-client-select"
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                const c = clients.find((cl) => cl.id === e.target.value);
                if (c) setCampaignStatus(c.lastCampaignStatus || 'ACTIVE');
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Remaining: ${c.remainingBalanceUSD.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Spent USD & Calculated BDT */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'spentUsdLabel')} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-xs">$</span>
              <input
                type="number"
                id="log-campaign-spent-usd"
                required
                min="0"
                step="0.01"
                value={spentUSD}
                onChange={(e) => setSpentUSD(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{getTranslation(lang, 'rateNotice')}{rate}</span>
              <span className="font-mono text-emerald-400">Equivalent: ৳{calculatedBDT.toLocaleString()}</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Eye className="h-3 w-3 text-slate-400" />
                {getTranslation(lang, 'impressionsLabel')}
              </label>
              <input
                type="number"
                id="log-campaign-impressions"
                min="0"
                value={impressions}
                onChange={(e) => setImpressions(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <MousePointer className="h-3 w-3 text-slate-400" />
                {getTranslation(lang, 'clicksLabel')}
              </label>
              <input
                type="number"
                id="log-campaign-clicks"
                min="0"
                value={clicks}
                onChange={(e) => setClicks(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Target className="h-3 w-3 text-teal-400" />
                {getTranslation(lang, 'leadsLabel')}
              </label>
              <input
                type="number"
                id="log-campaign-leads"
                min="0"
                value={leads}
                onChange={(e) => setLeads(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Campaign Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'campaignStatusLabel')}
            </label>
            <select
              id="log-campaign-status-select"
              value={campaignStatus}
              onChange={(e) => setCampaignStatus(e.target.value as CampaignStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="ACTIVE">ACTIVE (সক্রিয়)</option>
              <option value="PAUSED">PAUSED (স্থগিত)</option>
              <option value="LEARNING">LEARNING (লার্নিং)</option>
              <option value="COMPLETED">COMPLETED (সম্পন্ন)</option>
              <option value="LOW_BUDGET">LOW_BUDGET (বাজেট কম)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'notesLabel')}
            </label>
            <input
              type="text"
              id="log-campaign-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Meta Conversions Campaign - Batch #4"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              {getTranslation(lang, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              id="submit-log-campaign-btn"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Post Campaign Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
