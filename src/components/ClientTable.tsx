import React, { useState } from 'react';
import { Client, CampaignStatus, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { Search, Plus, TrendingUp, CreditCard, AlertTriangle, Building2, Eye, MousePointer, Target } from 'lucide-react';

interface ClientTableProps {
  lang: Language;
  clients: Client[];
  onOpenAddClient: () => void;
  onOpenLogUpdate: (client: Client) => void;
  onOpenTopup: (client: Client) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  lang,
  clients,
  onOpenAddClient,
  onOpenLogUpdate,
  onOpenTopup,
}) => {
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const formatUSD = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatBDT = (val: number) =>
    '৳' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);

  const renderStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            {getTranslation(lang, 'statusActive')}
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            {getTranslation(lang, 'statusPaused')}
          </span>
        );
      case 'LEARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            {getTranslation(lang, 'statusLearning')}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
            {getTranslation(lang, 'statusCompleted')}
          </span>
        );
      case 'LOW_BUDGET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3 w-3 text-rose-400" />
            {getTranslation(lang, 'statusLowBudget')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-700">
            {getTranslation(lang, 'statusNoCampaign')}
          </span>
        );
    }
  };

  return (
    <div id="client-table-container" className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {getTranslation(lang, 'clientTableTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time client ledger & campaign metrics for agency operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              id="search-clients-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter clients..."
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Add Client Button */}
          <button
            id="open-add-client-modal-btn"
            onClick={onOpenAddClient}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{getTranslation(lang, 'addClient')}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table id="agency-client-table" className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 sm:px-6">{getTranslation(lang, 'colClientName')}</th>
              <th className="py-3 px-4 text-right">{getTranslation(lang, 'colSpentUSD')}</th>
              <th className="py-3 px-4 text-right">{getTranslation(lang, 'colSpentBDT')}</th>
              <th className="py-3 px-4 text-right">{getTranslation(lang, 'colRemainingBalance')}</th>
              <th className="py-3 px-4 text-center">{getTranslation(lang, 'colLastStatus')}</th>
              <th className="py-3 px-4 text-center">Campaign Stats</th>
              <th className="py-3 px-4 sm:px-6 text-right">{getTranslation(lang, 'colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No clients found. Add a client or log an update via API.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const isLowBalance = client.remainingBalanceUSD < 50;

                return (
                  <tr
                    key={client.id}
                    id={`client-row-${client.id}`}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Client Name & Company */}
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                            {client.name}
                          </div>
                          {client.company && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3 text-slate-500" />
                              {client.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Spent USD */}
                    <td className="py-4 px-4 text-right font-mono font-semibold text-emerald-400">
                      {formatUSD(client.spentUSD)}
                    </td>

                    {/* Spent BDT */}
                    <td className="py-4 px-4 text-right font-mono text-slate-300">
                      {formatBDT(client.spentBDT)}
                    </td>

                    {/* Remaining Balance (USD & BDT) */}
                    <td className="py-4 px-4 text-right font-mono">
                      <div
                        className={`font-semibold ${
                          isLowBalance ? 'text-rose-400 flex items-center justify-end gap-1' : 'text-sky-400'
                        }`}
                      >
                        {isLowBalance && <AlertTriangle className="h-3.5 w-3.5 text-rose-400 animate-pulse" />}
                        {formatUSD(client.remainingBalanceUSD)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatBDT(client.remainingBalanceBDT)}
                      </div>
                    </td>

                    {/* Last Campaign Status */}
                    <td className="py-4 px-4 text-center">
                      {renderStatusBadge(client.lastCampaignStatus)}
                    </td>

                    {/* Campaign Stats (Impressions, Clicks, Leads) */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
                        <span title="Impressions" className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-slate-500" />
                          {(client.totalImpressions / 1000).toFixed(0)}k
                        </span>
                        <span title="Clicks" className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3 text-slate-500" />
                          {client.totalClicks}
                        </span>
                        <span title="Leads" className="flex items-center gap-1 font-semibold text-teal-400">
                          <Target className="h-3 w-3 text-teal-400" />
                          {client.totalLeads}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`log-update-btn-${client.id}`}
                          onClick={() => onOpenLogUpdate(client)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                          title="Log daily campaign ad spend update"
                        >
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="hidden lg:inline">{getTranslation(lang, 'logUpdate')}</span>
                        </button>
                        <button
                          id={`topup-btn-${client.id}`}
                          onClick={() => onOpenTopup(client)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-medium transition-colors"
                          title="Top-up client balance"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">{getTranslation(lang, 'topupBalance')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
