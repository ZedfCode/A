
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
    { id: 'completed', label: t('completed', lang), icon: ICONS.ShieldCheck, count: counts.completed },
  ];

  const trafficPath = useMemo(() => {
    if (globalSpeedHistory.length < 2) return "";
    const max = Math.max(...globalSpeedHistory, 1024 * 1024);
    const w = 240, h = 80;
    const pts = globalSpeedHistory.map((s, i) => `${(i / (globalSpeedHistory.length - 1)) * w},${h - (s / max) * h}`).join(' L ');
    return `M 0,${h} L ${pts} L ${w},${h} Z`;
  }, [globalSpeedHistory]);

  return (
    <div className="fixed left-0 top-0 h-screen w-[360px] bg-[#080a0f] border-r-2 border-white/10 flex flex-col z-40 shadow-4xl">
      <div className="p-12">
        <div className="flex flex-col gap-8 group">
          <div className="w-20 h-20 bg-[var(--accent-main)] rounded-[2rem] shadow-[0_0_40px_var(--accent-glow)] flex items-center justify-center transform group-hover:rotate-12 transition-all duration-700">
            <ICONS.Activity className="w-10 h-10 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">{APP_NAME}</h1>
            <div className="flex items-center gap-3 mt-5">
               <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Matrix Connected</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-4 mt-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`w-full flex items-center justify-between px-8 py-6 rounded-[1.5rem] transition-all relative ${
              currentFilter === item.id 
              ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/20' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-6">
              <item.icon className={`w-8 h-8 ${currentFilter === item.id ? 'text-[var(--accent-main)]' : 'opacity-30'}`} />
              <span className="font-black text-lg uppercase tracking-widest">{item.label}</span>
            </div>
            {item.count > 0 && (
              <span className={`text-sm font-black mono-data ${currentFilter === item.id ? 'text-[var(--accent-main)]' : 'opacity-20'}`}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-10">
        <div className="bg-black/60 rounded-[2.5rem] p-8 border border-white/10">
           <div className="flex justify-between items-baseline mb-6">
              <div className="flex items-center gap-3 opacity-30">
                 <ICONS.Gauge className="w-4 h-4 text-white" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Global I/O</span>
              </div>
              <span className="text-3xl font-black mono-data text-[var(--accent-main)]">
                {(globalSpeedHistory[globalSpeedHistory.length-1] / (1024*1024)).toFixed(1)} <span className="text-xs opacity-40 uppercase">mb/s</span>
              </span>
           </div>
           <svg className="w-full h-20 text-[var(--accent-main)] opacity-40" viewBox="0 0 240 80" preserveAspectRatio="none">
              <path d={trafficPath} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
           </svg>
        </div>

        <div className="mt-12 flex items-center justify-between">
           <div className="flex items-center gap-4 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-white/10 overflow-hidden shadow-2xl">
                <img src={`https://picsum.photos/100/100?seed=pro-user`} className="w-full h-full object-cover grayscale" />
              </div>
              <div className="leading-none">
                 <p className="text-xs font-black text-white uppercase tracking-tighter italic">Geek_Node_01</p>
                 <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mt-2 block">Link Level: Ultra</span>
              </div>
           </div>
           <button onClick={onOpenSettings} className="p-4 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 juicy-button">
              <ICONS.Settings className="w-7 h-7" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
