
import React from 'react';
import { ICONS } from '../constants';
import { AppSettings, Language, AccentColor, VisualEnvironment } from '../types';
import { t } from '../services/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const envs: { id: VisualEnvironment; label: string; desc: string }[] = [
    { id: 'amber_digital', label: '琥珀数字', desc: '工业控制台感，极简网格' },
    { id: 'ethereal_vapor', label: '以太雾境', desc: '流动的极光色块与毛玻璃' },
    { id: 'monolith_dark', label: '深空石碑', desc: '绝对黑暗，高冷科技线条' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative glass-panel rounded-[4rem] w-full max-w-2xl p-16 overflow-y-auto custom-scrollbar border border-white/10 max-h-[85vh]">
        <header className="mb-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">Visual Core</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Environmental Override Panel</p>
        </header>

        <div className="space-y-16">
          <section>
             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 block">环境渲染预设 / Environment</label>
             <div className="grid gap-6">
                {envs.map(env => (
                  <button 
                    key={env.id}
                    onClick={() => onUpdate({...settings, visualEnvironment: env.id})}
                    className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all text-left ${
                      settings.visualEnvironment === env.id 
                      ? 'bg-white/10 border-[var(--accent-main)] scale-[1.02] shadow-2xl shadow-[var(--accent-glow)]' 
                      : 'bg-white/5 border-transparent opacity-40 hover:opacity-100 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      env.id === 'amber_digital' ? 'bg-amber-500' : env.id === 'ethereal_vapor' ? 'bg-purple-600' : 'bg-slate-900'
                    }`}>
                       <ICONS.Zap className="w-6 h-6 text-black" />
                    </div>
                    <div>
                       <p className="font-black text-white text-sm uppercase">{env.label}</p>
                       <p className="text-[10px] text-slate-500 font-bold mt-1">{env.desc}</p>
                    </div>
                    {settings.visualEnvironment === env.id && <div className="ml-auto w-3 h-3 rounded-full bg-[var(--accent-main)]" />}
                  </button>
                ))}
             </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">AI 解析核心 / AI Engine</label>
                <p className="text-[9px] text-slate-600 font-bold mt-2 italic">默认关闭以节省算力。开启后自动嗅探资源元数据。</p>
              </div>
              <div 
                 className={`ai-switch ${settings.aiEnabledByDefault ? 'active' : ''}`}
                 onClick={() => onUpdate({...settings, aiEnabledByDefault: !settings.aiEnabledByDefault})}
              >
                <div className="ai-knob"><ICONS.Brain className="w-4 h-4" /></div>
              </div>
            </div>
          </section>

          <section>
             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 block">并发线程调度 / Global Cluster</label>
             <div className="flex gap-4">
                {[32, 64, 128, 256].map(v => (
                  <button 
                    key={v}
                    onClick={() => onUpdate({...settings, globalMaxThreads: v})}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] transition-all border ${
                      settings.globalMaxThreads === v ? 'bg-[var(--accent-main)] text-black border-transparent' : 'bg-white/5 text-slate-600 border-white/5'
                    }`}
                  >
                    {v}T
                  </button>
                ))}
             </div>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="mt-16 w-full py-8 bg-[var(--accent-main)] text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] juicy-button"
        >
          Initialize Override / 重构核心
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
