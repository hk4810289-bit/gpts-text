import React, { useState, useEffect } from 'react';
import { Client, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { X, CreditCard, DollarSign } from 'lucide-react';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  clients: Client[];
  initialClient?: Client | null;
  onTopup: (data: { clientId: string; amountUSD: number; notes?: string }) => Promise<void>;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  isOpen,
  onClose,
  lang,
  clients,
  initialClient,
  onTopup,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amountUSD, setAmountUSD] = useState(500);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialClient) {
      setSelectedClientId(initialClient.id);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClient, clients, isOpen]);

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const rate = currentClient ? currentClient.usdToBdtRate : 122.5;
  const calculatedBDT = Math.round((Number(amountUSD) || 0) * rate * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setError('Please select a client.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onTopup({
        clientId: selectedClientId,
        amountUSD: Number(amountUSD) || 0,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to top-up balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="topup-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {getTranslation(lang, 'modalTopupTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                Add USD advertising credit to client account
              </p>
            </div>
          </div>
          <button
            id="close-topup-modal"
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
              id="topup-client-select"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Current Balance: ${c.remainingBalanceUSD.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount USD */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'topupUsdLabel')} <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-xs">$</span>
              <input
                type="number"
                id="topup-amount-usd"
                required
                min="1"
                step="10"
                value={amountUSD}
                onChange={(e) => setAmountUSD(Number(e.target.value))}
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Exchange Rate:</span>
              <span className="font-mono text-slate-300">$1 = ৳{rate}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Equivalent BDT Top-up:</span>
              <span className="font-mono text-sky-400">৳{calculatedBDT.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'notesLabel')}
            </label>
            <input
              type="text"
              id="topup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bank Wire #BD-8902 or bKash Merchant Ref"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Footer */}
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
              id="submit-topup-btn"
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Apply Top-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
