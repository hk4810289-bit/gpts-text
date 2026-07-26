import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { Users, DollarSign, Wallet, Megaphone, ArrowUpRight } from 'lucide-react';

interface MetricsOverviewProps {
  lang: Language;
  summary: {
    totalClients: number;
    totalSpentUSD: number;
    totalSpentBDT: number;
    totalRemainingBalanceUSD: number;
    totalRemainingBalanceBDT: number;
    activeCampaigns: number;
  };
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ lang, summary }) => {
  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatBDT = (val: number) =>
    '৳' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);

  return (
    <div id="metrics-overview-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Clients Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {getTranslation(lang, 'totalClients')}
          </span>
          <div className="p-2 rounded-lg bg-slate-800 text-teal-400 border border-slate-700/60">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white font-mono">
            {summary.totalClients}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-0.5">
            Active Accounts
          </span>
        </div>
      </div>

      {/* Total Spent USD & BDT Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {getTranslation(lang, 'totalSpentUSD')}
          </span>
          <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700/60">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {formatUSD(summary.totalSpentUSD)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {getTranslation(lang, 'totalSpentBDT')}: <span className="text-slate-200">{formatBDT(summary.totalSpentBDT)}</span>
          </div>
        </div>
      </div>

      {/* Total Remaining Balance USD & BDT Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {getTranslation(lang, 'totalRemainingBalance')}
          </span>
          <div className="p-2 rounded-lg bg-slate-800 text-sky-400 border border-slate-700/60">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {formatUSD(summary.totalRemainingBalanceUSD)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            In BDT: <span className="text-slate-200">{formatBDT(summary.totalRemainingBalanceBDT)}</span>
          </div>
        </div>
      </div>

      {/* Active Campaigns Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {getTranslation(lang, 'activeCampaigns')}
          </span>
          <div className="p-2 rounded-lg bg-slate-800 text-amber-400 border border-slate-700/60">
            <Megaphone className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-400 font-mono">
            {summary.activeCampaigns}
          </span>
          <span className="text-xs text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Running Live
          </span>
        </div>
      </div>

    </div>
  );
};
