
import React, { useMemo } from 'react';
import { ICONS, APP_NAME, APP_VERSION } from '../constants';
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
    { id: 'completed', label: t('completed', lang), icon: ICONS.Shield, count: counts.completed },
  ];

  const trafficPath = useMemo(() => {
    if (globalSpeedHistory.length < 2) return "";
    const max = Math.max(...globalSpeedHistory, 1024 * 1024);
    const w = 300, h = 120;
    const pts = globalSpeedHistory.map((s, i) => `${(i / (globalSpeedHistory.length - 1)) * w},${h - (s / max) * h}`).join(' L ');
    return `M 0,${h} L ${pts} L ${w},${h} Z`;
  }, [globalSpeedHistory]);

  return (
    <div className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-[#030406] border-r border-white/5 flex flex-col z-40 shadow-[20px_0_100px_rgba(0,0,0,0.8)]">
      <div className="p-16">
        <div className="flex flex-col gap-12 group">
          <div className="w-28 h-28 bg-amber-500 rounded-[3rem] shadow-[0_0_80px_rgba(251,191,36,0.2)] flex items-center justify-center transform group-hover:rotate-[-10deg] transition-all duration-1000">
            <ICONS.Terminal className="w-14 h-14 text-black" />
          </div>
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none mb-5">{APP_NAME}</h1>
            <div className="flex items-center gap-4">
               <span className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)] animate-pulse" />
               <p className="text-[11px] font-black uppercase tracking-[0.8em] text-white/20">{APP_VERSION}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-10 space-y-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`w-full flex items-center justify-between px-10 py-7 rounded-[2.5rem] transition-all border border-transparent group ${
              currentFilter === item.id 
              ? 'bg-white/[0.03] text-white shadow-inner border-white/5' 
              : 'text-white/20 hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            <div className="flex items-center gap-8 relative z-10">
              <item.icon className={`w-9 h-9 transition-transform duration-500 group-hover:scale-125 ${currentFilter === item.id ? 'text-amber-500' : 'opacity-20'}`} />
              <span className="font-black text-2xl uppercase tracking-tighter">{item.label}</span>
            </div>
            {item.count > 0 && (
              <span className={`text-sm font-black mono-data px-4 py-1.5 bg-black rounded-xl border border-white/10 ${currentFilter === item.id ? 'text-amber-500 shadow-[0_0_15px_var(--accent-glow)]' : 'opacity-10'}`}>
                 {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-12 space-y-12">
        {/* 动态仪表盘 */}
        <div className="bg-black rounded-[4rem] p-12 border border-white/5 shadow-3xl group overflow-hidden relative">
           <div className="flex justify-between items-baseline mb-10 relative z-10">
              <div className="flex items-center gap-4 opacity-30">
                 <ICONS.Gauge className="w-5 h-5 text-white" />
                 <span className="text-[10px] font-black uppercase tracking-[1em] italic">Real-time IO</span>
              </div>
              <span className="text-5xl font-black mono-data text-amber-500 tracking-tighter">
                {(globalSpeedHistory[globalSpeedHistory.length-1] / (1024*1024)).toFixed(1)} <span className="text-sm opacity-30">MB/S</span>
              </span>
           </div>
           <svg className="w-full h-28 text-amber-500 opacity-20 group-hover:opacity-50 transition-all duration-700" viewBox="0 0 300 120" preserveAspectRatio="none">
              <path d={trafficPath} fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
           </svg>
           {/* 背景网格 */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="flex items-center justify-between px-6">
           <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-white/10 overflow-hidden shadow-4xl transform group-hover:scale-110 transition-transform">
                <img src={`https://picsum.photos/100/100?seed=geek-commander`} className="w-full h-full object-cover grayscale brightness-50" />
              </div>
              <div className="leading-tight">
                 <p className="text-lg font-black text-white uppercase tracking-tighter">Commander_Alpha</p>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Network Secure</span>
                 </div>
              </div>
           </div>
           <button onClick={onOpenSettings} className="p-6 text-white/20 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 cyber-button">
              <ICONS.Settings className="w-10 h-10" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
