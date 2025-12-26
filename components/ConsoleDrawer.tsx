
import React, { useEffect, useRef } from 'react';
import { SystemLog, Language } from '../types';
import { t } from '../services/i18n';

interface ConsoleDrawerProps {
  logs: SystemLog[];
  isOpen: boolean;
  onToggle: () => void;
  lang: Language;
}

const ConsoleDrawer: React.FC<ConsoleDrawerProps> = ({ logs, isOpen, onToggle, lang }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`fixed bottom-0 left-64 right-0 transition-all duration-300 z-30 ${isOpen ? 'h-64' : 'h-10'}`}>
      <div className="bg-slate-900 border-t border-slate-800 flex flex-col h-full shadow-2xl">
        <button 
          onClick={onToggle}
          className="h-10 px-6 flex items-center justify-between bg-slate-950 border-b border-white/5 hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('console_label', lang)}</span>
            <span className="text-[10px] text-slate-600 font-mono">[{logs.length} entries]</span>
          </div>
          <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-scrollbar bg-slate-950/50"
        >
          {logs.map(log => (
            <div key={log.id} className="flex gap-3 mb-1 animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={`font-bold shrink-0 w-12 ${
                log.level === 'error' ? 'text-rose-500' : 
                log.level === 'warn' ? 'text-amber-500' : 
                log.level === 'success' ? 'text-emerald-500' : 'text-blue-500'
              }`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsoleDrawer;
