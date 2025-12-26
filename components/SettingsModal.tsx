
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

  const envs: { id: VisualEnvironment; label: string; desc: string; color: string }[] = [
    { id: 'amber_digital', label: '琥珀数字', desc: '焦糖基调，模拟复古工业显示屏', color: 'bg-amber-600' },
    { id: 'ethereal_vapor', label: '以太雾境', desc: '深靛蓝底色，高亮度动态流体极光', color: 'bg-indigo-600' },
    { id: 'monolith_dark', label: '深空蓝图', desc: '普鲁士蓝，极简工程坐标网格', color: 'bg-blue-900' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
      <div className="relative glass-panel rounded-[5rem] w-full max-w-2xl p-20 overflow-y-auto custom-scrollbar border border-white/10 max-h-[90vh]">
        <header className="mb-16">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-4">Environment Core</h2>
          <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.6em]">System Visual Override</p>
        </header>

        <div className="space-y-20">
          <section>
             <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10 block">环境渲染预设 / PRESET</label>
             <div className="grid gap-8">
                {envs.map(env => (
                  <button 
                    key={env.id}
                    onClick={() => onUpdate({...settings, visualEnvironment: env.id})}
                    className={`flex items-center gap-8 p-8 rounded-[3rem] border transition-all text-left group ${
                      settings.visualEnvironment === env.id 
                      ? 'bg-white/10 border-[var(--accent-main)] scale-[1.05] shadow-2xl' 
                      : 'bg-white/5 border-transparent opacity-50 hover:opacity-100 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6 ${env.color}`}>
                       <ICONS.Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <p className="font-black text-white text-lg uppercase">{env.label}</p>
                       <p className="text-[11px] text-slate-400 font-bold mt-2 leading-relaxed">{env.desc}</p>
                    </div>
                    {settings.visualEnvironment === env.id && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-[var(--accent-main)] shadow-[0_0_15px_var(--accent-glow)]" />
                    )}
                  </button>
                ))}
             </div>
          </section>

          <section>
            <div className="flex items-center justify-between p-10 bg-white/5 rounded-[3rem] border border-white/5">
              <div>
                <label className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">AI 智能嗅探 / AI COGNITION</label>
                <p className="text-[10px] text-slate-500 font-bold mt-3 italic">自动分析资源元数据，由 Gemini 驱动</p>
              </div>
              <div 
                 className={`ai-switch ${settings.aiEnabledByDefault ? 'active' : ''} cursor-pointer`}
                 onClick={() => onUpdate({...settings, aiEnabledByDefault: !settings.aiEnabledByDefault})}
              >
                <div className="ai-knob bg-white flex items-center justify-center"><ICONS.Brain className="w-5 h-5 text-black" /></div>
              </div>
            </div>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="mt-20 w-full py-10 bg-[var(--accent-main)] text-black rounded-[3.5rem] font-black text-sm uppercase tracking-[0.8em] juicy-button shadow-2xl shadow-[var(--accent-glow)] hover:brightness-125"
        >
          APPLY OVERRIDE / 同步更改
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
