
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
    const w = 200, h = 60;
    const pts = globalSpeedHistory.map((s, i) => `${(i / (globalSpeedHistory.length - 1)) * w},${h - (s / max) * h}`).join(' L ');
    return `M 0,${h} L ${pts} L ${w},${h} Z`;
  }, [globalSpeedHistory]);

  return (
    <div className="fixed left-0 top-0 h-screen w-[320px] bg-white/[0.04] backdrop-blur-[100px] border-r border-white/20 flex flex-col z-40 transition-all duration-500 shadow-[40px_0_100px_rgba(0,0,0,0.5)]">
      <div className="p-10 pb-16">
        <div className="flex flex-col gap-6 group">
          <div className="w-24 h-24 bg-[var(--accent-main)] rounded-[2.5rem] shadow-[0_0_50px_var(--accent-glow)] flex items-center justify-center transform group-hover:rotate-[10deg] transition-all duration-500">
            <ICONS.Thunder className="w-14 h-14 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">{APP_NAME}</h1>
            <p className="text-[12px] font-black uppercase tracking-[1em] text-[var(--accent-main)] mt-4 opacity-100">PRO ENGINE</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-8 space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`w-full flex items-center justify-between px-8 py-8 rounded-[2.5rem] transition-all group relative overflow-hidden ${
              currentFilter === item.id 
              ? 'bg-white/10 text-white shadow-2xl translate-x-2 ring-2 ring-white/20' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-6 relative z-10">
              <item.icon className={`w-8 h-8 transition-all duration-500 ${currentFilter === item.id ? 'scale-125 text-[var(--accent-main)]' : 'opacity-60 group-hover:opacity-100'}`} />
              <span className="font-black text-lg uppercase tracking-widest">{item.label}</span>
            </div>
            {item.count > 0 && (
              <span className={`text-lg font-mono font-black ${currentFilter === item.id ? 'text-[var(--accent-main)]' : 'opacity-40'}`}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-10">
        <div className="bg-black/40 rounded-[3rem] p-10 border border-white/10 shadow-inner">
           <div className="flex justify-between items-baseline mb-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/40">聚合带宽</span>
              <span className="text-2xl font-mono text-[var(--accent-main)] font-black">
                {(globalSpeedHistory[globalSpeedHistory.length-1] / (1024*1024)).toFixed(1)} <span className="text-xs opacity-40">MB/S</span>
              </span>
           </div>
           <svg className="w-full h-16 text-[var(--accent-main)] opacity-60" viewBox="0 0 200 60" preserveAspectRatio="none">
              <path d={trafficPath} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="4" />
           </svg>
        </div>

        <div className="mt-10 flex items-center justify-between">
           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 overflow-hidden shadow-2xl">
                <img src={`https://picsum.photos/100/100?seed=smart`} className="w-full h-full object-cover grayscale brightness-150" />
              </div>
              <div className="leading-tight">
                 <p className="text-sm font-black text-white uppercase tracking-tighter">管理员节点</p>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">已连接安全集群</span>
              </div>
           </div>
           <button onClick={onOpenSettings} className="p-6 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-3xl juicy-button">
              <ICONS.Settings className="w-10 h-10" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
