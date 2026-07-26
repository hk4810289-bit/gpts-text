import React, { useState } from 'react';
import { Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { X, UserPlus, Building, DollarSign } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAddClient: (data: { name: string; company?: string; initialBalanceUSD?: number; usdToBdtRate?: number }) => Promise<void>;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddClient,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [initialBalanceUSD, setInitialBalanceUSD] = useState(500);
  const [usdToBdtRate, setUsdToBdtRate] = useState(122.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client name is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onAddClient({
        name: name.trim(),
        company: company.trim() || undefined,
        initialBalanceUSD: Number(initialBalanceUSD) || 500,
        usdToBdtRate: Number(usdToBdtRate) || 122.5,
      });
      setName('');
      setCompany('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="add-client-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {getTranslation(lang, 'modalAddClientTitle')}
            </h3>
          </div>
          <button
            id="close-add-client-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'clientNameLabel')} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="new-client-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grameen Tech Ltd"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {getTranslation(lang, 'companyLabel')}
            </label>
            <input
              type="text"
              id="new-client-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Grameen Group"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {getTranslation(lang, 'initialBalanceLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  id="new-client-initial-balance"
                  min="0"
                  step="50"
                  value={initialBalanceUSD}
                  onChange={(e) => setInitialBalanceUSD(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {getTranslation(lang, 'exchangeRateLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 text-xs">৳</span>
                <input
                  type="number"
                  id="new-client-exchange-rate"
                  step="0.1"
                  value={usdToBdtRate}
                  onChange={(e) => setUsdToBdtRate(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Calculated Initial BDT:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              ৳{((initialBalanceUSD || 0) * (usdToBdtRate || 122.5)).toLocaleString()}
            </span>
          </div>

          {/* Form Footer */}
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
              id="submit-add-client-btn"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : getTranslation(lang, 'save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
