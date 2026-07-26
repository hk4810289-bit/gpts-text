import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { X, FileCode, Copy, Check, Download, ExternalLink, Key, Sparkles } from 'lucide-react';

interface OpenApiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  apiToken: string;
}

export const OpenApiDrawer: React.FC<OpenApiDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  apiToken,
}) => {
  const [specJson, setSpecJson] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [loading, setLoading] = useState(false);

  const openApiUrl = `${window.location.origin}/api/openapi.json`;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/openapi.json')
        .then((res) => res.json())
        .then((data) => {
          setSpecJson(JSON.stringify(data, null, 2));
        })
        .catch((err) => {
          setSpecJson(JSON.stringify({ error: 'Failed to fetch openapi.json' }, null, 2));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(openApiUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(specJson);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const handleDownloadSpec = () => {
    const blob = new Blob([specJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agency_openapi.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="openapi-drawer-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                OpenAPI 3.0 Specification
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  v3.0.3
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Directly importable into ChatGPT Custom GPT Actions, Gemini, or Postman
              </p>
            </div>
          </div>
          <button
            id="close-openapi-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto scrollbar-thin">
          
          {/* Quick Setup Guide Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              {getTranslation(lang, 'customGptGuideTitle')}
            </h4>

            <div className="space-y-2 text-xs text-slate-300">
              <p>{getTranslation(lang, 'step1')}</p>
              
              <div className="space-y-1">
                <p>{getTranslation(lang, 'step2')}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={openApiUrl}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-sky-400 select-all"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <p>{getTranslation(lang, 'step3')}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 flex items-center justify-between">
                    <span>Authorization: Bearer {apiToken}</span>
                    <Key className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              </div>

              <p className="pt-1 text-slate-400 italic">
                {getTranslation(lang, 'step4')}
              </p>
            </div>
          </div>

          {/* Raw JSON Spec Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Raw openapi.json Output:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySpec}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  {copiedSpec ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSpec ? 'Copied JSON' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownloadSpec}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5 text-sky-400" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 scrollbar-thin">
              {loading ? 'Loading OpenAPI Spec...' : specJson}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Open /api/openapi.json in new tab</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
