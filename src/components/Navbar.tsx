import React, { useState } from 'react';
import { Language, ApiLog } from '../types';
import { getTranslation } from '../locales/i18n';
import { Key, Globe, FileCode, Activity, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  apiToken: string;
  onOpenOpenApi: () => void;
  onOpenLogs: () => void;
  logCount: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  apiToken,
  onOpenOpenApi,
  onOpenLogs,
  logCount,
  onResetData,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(`Bearer ${apiToken}`);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <header id="app-navbar" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Activity className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg tracking-tight text-white">
                {getTranslation(lang, 'appTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Backend Active
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              {getTranslation(lang, 'appSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-lg p-0.5 text-xs font-medium">
            <button
              id="lang-btn-en"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'en'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-bn"
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                lang === 'bn'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Bearer Token Button */}
          <button
            id="copy-bearer-token-btn"
            onClick={handleCopyToken}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-mono transition-colors group"
            title="Copy Bearer Authorization Header"
          >
            <Key className="h-3.5 w-3.5 text-emerald-400" />
            <span className="truncate max-w-[110px]">Bearer {apiToken}</span>
            {copiedToken ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <span className="text-[10px] text-slate-400 group-hover:text-slate-200 uppercase bg-slate-900 px-1 py-0.5 rounded">
                Copy
              </span>
            )}
          </button>

          {/* OpenAPI Spec Button */}
          <button
            id="openapi-drawer-btn"
            onClick={onOpenOpenApi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <FileCode className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden md:inline">{getTranslation(lang, 'openApiSpec')}</span>
          </button>

          {/* Live Logs Drawer Toggle */}
          <button
            id="toggle-live-logs-btn"
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-400 transition-colors relative"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{getTranslation(lang, 'viewApiLogs')}</span>
            {logCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                {logCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            id="reset-data-btn"
            onClick={onResetData}
            title="Reset to initial benchmark dataset"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

        </div>
      </div>
    </header>
  );
};
