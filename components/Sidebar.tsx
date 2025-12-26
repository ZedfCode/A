
import React, { useMemo } from 'react';
import { ICONS, APP_NAME } from '../constants';
import { Language } from '../types';
import { t } from '../services/i18n';

interface SidebarProps {
  currentFilter: string;
  setFilter: (filter: string) => void;
  counts: { all: number; downloading: number; completed: number; trash: number; };
  globalSpeedHistory: number[];
  lang: Language;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentFilter, setFilter, counts, globalSpeedHistory, lang, onOpenSettings }) => {
  const menuItems = [
    { id: 'all', label: t('all_tasks', lang), icon: ICONS.Folder, count: counts.all },
    { id: 'downloading', label: t('downloading', lang), icon: ICONS.Zap, count: counts.downloading },
    { id: 'completed', label: t('completed', lang), icon: ICONS.History, count: counts.completed },
  ];

  const trafficPath = useMemo(() => {
    if (globalSpeedHistory.length < 2) return "";
    const max = Math.max(...globalSpeedHistory, 1024 * 1024);
    const w = 200, h = 40;
    const pts = globalSpeedHistory.map((s, i) => `${(i / (globalSpeedHistory.length - 1)) * w},${h - (s / max) * h}`).join(' L ');
    return `M 0,${h} L ${pts} L ${w},${h} Z`;
  }, [globalSpeedHistory]);

  return (
    <div className="fixed left-0 top-0 h-screen w-[280px] bg-black/30 backdrop-blur-3xl border-r border-white/5 flex flex-col z-40 transition-all duration-700">
      <div className="p-12 pb-20">
        <div className="flex items-center gap-5 group">
          <div className="w-16 h-16 bg-[var(--accent-main)] rounded-[1.8rem] shadow-2xl flex items-center justify-center transform group-hover:rotate-[15deg] transition-all duration-500">
            <ICONS.Thunder className="w-9 h-9 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">{APP_NAME}</h1>
            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-[var(--accent-main)] opacity-60">System Core 2.5</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-8 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`w-full flex items-center justify-between px-8 py-5 rounded-2xl transition-all group relative overflow-hidden ${
              currentFilter === item.id 
              ? 'bg-white/10 text-white shadow-2xl translate-x-1 ring-1 ring-white/10' 
              : 'text-white/30 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-6 relative z-10">
              <item.icon className={`w-5 h-5 transition-all duration-500 ${currentFilter === item.id ? 'scale-125 text-[var(--accent-main)]' : 'opacity-40 group-hover:opacity-100'}`} />
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </div>
            {item.count > 0 && (
              <span className="text-[10px] font-mono font-black opacity-40 group-hover:opacity-100 transition-opacity">{item.count}</span>
            )}
            {currentFilter === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-glow)] to-transparent pointer-events-none" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-10">
        <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-md">
           <div className="flex justify-between items-center mb-6">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">Bandwidth Load</span>
              <span className="text-[10px] font-mono text-[var(--accent-main)] font-black">
                {(globalSpeedHistory[globalSpeedHistory.length-1] / (1024*1024)).toFixed(1)} <span className="text-[7px] opacity-40">MB/S</span>
              </span>
           </div>
           <svg className="w-full h-12 text-[var(--accent-main)] opacity-30" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d={trafficPath} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
           </svg>
        </div>

        <div className="mt-10 flex items-center justify-between">
           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl transform group-hover:scale-110 transition-transform">
                <img src={`https://picsum.photos/100/100?seed=downloader`} className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-tighter">Root Protocol</p>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest">Stable Sync</span>
                 </div>
              </div>
           </div>
           <button onClick={onOpenSettings} className="p-4 text-white/20 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl">
              <ICONS.Settings className="w-6 h-6" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
