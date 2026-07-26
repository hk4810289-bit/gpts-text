import React, { useState } from 'react';
import { ApiLog, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { Activity, ShieldCheck, ShieldAlert, Trash2, ChevronDown, ChevronRight, Clock, Server, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApiLogsSectionProps {
  lang: Language;
  logs: ApiLog[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export const ApiLogsSection: React.FC<ApiLogsSectionProps> = ({
  lang,
  logs,
  onClearLogs,
  onRefreshLogs,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const renderMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'POST':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">POST</span>;
      case 'GET':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">GET</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-700 text-slate-300">{method}</span>;
    }
  };

  const renderStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-rose-400">
        <AlertCircle className="h-3 w-3" />
        {status}
      </span>
    );
  };

  return (
    <section id="recent-api-logs-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {getTranslation(lang, 'apiLogsTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Real-time Stream
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {getTranslation(lang, 'apiLogsSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="refresh-logs-btn"
            onClick={onRefreshLogs}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            Refresh
          </button>
          {logs.length > 0 && (
            <button
              id="clear-logs-btn"
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{getTranslation(lang, 'clearLogs')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div className="mt-4 space-y-2.5">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <Server className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium">{getTranslation(lang, 'noLogsYet')}</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                id={`log-card-${log.id}`}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all overflow-hidden"
              >
                {/* Log Header Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3 sm:px-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderMethodBadge(log.method)}
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                      {log.endpoint}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {/* Status Code */}
                    {renderStatusBadge(log.status)}

                    {/* Auth Status Badge */}
                    {log.authenticated ? (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" />
                        Bearer OK
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <ShieldAlert className="h-3 w-3" />
                        No Auth
                      </span>
                    )}

                    {/* Timestamp */}
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeStr}
                    </span>

                    {/* Chevron */}
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Payload Inspector */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3 text-xs font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* Request Payload */}
                      <div>
                        <div className="text-[11px] font-sans font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>Request Payload:</span>
                          <span className="text-[10px] text-slate-500">IP: {log.ip || '127.0.0.1'}</span>
                        </div>
                        <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-emerald-400 text-[11px] overflow-x-auto max-h-48 scrollbar-thin">
                          {log.requestBody ? JSON.stringify(log.requestBody, null, 2) : '// No request body'}
                        </pre>
                      </div>

                      {/* Response Payload */}
                      <div>
                        <div className="text-[11px] font-sans font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>Response Body:</span>
                          <span className="text-[10px] text-slate-500">{log.durationMs || 2}ms</span>
                        </div>
                        <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-sky-300 text-[11px] overflow-x-auto max-h-48 scrollbar-thin">
                          {log.responseBody ? JSON.stringify(log.responseBody, null, 2) : '// Empty response'}
                        </pre>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
