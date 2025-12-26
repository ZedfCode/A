
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { DownloadTask, DownloadStatus, FileType, Language, Priority } from '../types';
import { geminiService } from '../services/geminiService';
import { t } from '../services/i18n';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: DownloadTask) => void;
  lang: Language;
  defaultSavePath: string;
  aiByDefault: boolean;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask, aiByDefault }) => {
  const [urlInput, setUrlInput] = useState('');
  const [aiEnabled, setAiEnabled] = useState(aiByDefault);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customName, setCustomName] = useState('');
  const [threadLimit, setThreadLimit] = useState(256);

  useEffect(() => {
    if (!isOpen) { setUrlInput(''); setCustomName(''); setIsAnalyzing(false); }
    setAiEnabled(aiByDefault);
  }, [isOpen, aiByDefault]);

  const handleStart = async () => {
    if (!urlInput.trim()) return;
    
    let finalName = customName;
    if (aiEnabled) {
      setIsAnalyzing(true);
      const result = await geminiService.analyzeUrl(urlInput);
      finalName = customName || result.suggestedName;
      setIsAnalyzing(false);
    }

    onAddTask({
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput,
      name: finalName || urlInput.split('/').pop() || 'Untitled_Resource',
      size: 1024 * 1024 * (Math.random() * 8000 + 2000),
      downloaded: 0,
      status: DownloadStatus.DOWNLOADING,
      type: FileType.OTHER,
      protocol: 'HTTP',
      progress: 0,
      speed: 0,
      threads: 0,
      maxThreads: threadLimit,
      priority: Priority.HIGH,
      addedAt: Date.now(),
      isResumable: true,
      bitfield: new Array(128).fill(0),
      safetyScore: 100,
      securityReport: "AI Certified Protocol Secured",
      speedHistory: [],
      retries: 0,
      peerCount: 256,
      eta: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-10 overflow-hidden">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative glass-panel rounded-[5rem] w-full max-w-6xl p-24 flex flex-col border border-white/10 animate-in zoom-in-95 duration-500 shadow-[0_0_150px_rgba(0,0,0,1)]">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <ICONS.Cpu className="w-64 h-64" />
        </div>

        <header className="flex justify-between items-start mb-20">
          <div>
            <div className="flex items-center gap-5 mb-6">
               <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-2xl">
                  <ICONS.Plus className="w-8 h-8 text-black" />
               </div>
               <span className="text-[12px] font-black uppercase tracking-[1.2em] text-white/20 leading-none">Resource Initializer</span>
            </div>
            <h3 className="text-8xl font-black italic tracking-tighter uppercase text-white leading-none">建立数据隧道</h3>
          </div>
          
          <div className="flex flex-col items-end gap-5">
             <span className="text-[11px] font-black uppercase text-amber-500/60 tracking-widest italic">Gemini AI Cognition</span>
             <div 
                className={`ai-switch scale-[1.6] ${aiEnabled ? 'active' : ''}`}
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                <div className="ai-knob bg-white flex items-center justify-center shadow-3xl">
                  <ICONS.Brain className={`w-5 h-5 ${aiEnabled ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
              </div>
          </div>
        </header>

        <div className="space-y-16">
          <div className="relative group">
            <textarea 
              placeholder="PASTE URL / MAGNET / TORRENT HASH..."
              className="w-full h-80 bg-black/80 border-2 border-white/5 rounded-[3.5rem] p-12 font-mono text-3xl outline-none focus:border-amber-500/30 focus:bg-black transition-all placeholder:text-white/5 custom-scrollbar"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-[3.5rem] animate-in fade-in">
                 <div className="w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-8" />
                 <p className="text-xl font-black uppercase tracking-[1.5em] text-amber-500 animate-pulse">Analyzing Payload...</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-12">
             <div className="space-y-6">
                <label className="flex items-center gap-4 ml-10">
                   <ICONS.Zap className="w-5 h-5 text-amber-500" />
                   <span className="text-[12px] font-black uppercase text-white/20 tracking-[0.5em]">并发隧道限制</span>
                </label>
                <div className="relative">
                   <select 
                      className="w-full bg-white/[0.02] border-2 border-white/5 rounded-[2.5rem] px-12 py-10 font-black text-3xl outline-none appearance-none cursor-pointer hover:bg-white/[0.05] text-white focus:border-amber-500 transition-all"
                      value={threadLimit}
                      onChange={e => setThreadLimit(Number(e.target.value))}
                   >
                      <option value={128}>128x GEEK-MODE</option>
                      <option value={256}>256x HYPER-DRIVE</option>
                      <option value={512}>512x CORE-BOOST</option>
                      <option value={1024}>1024x MATRIX-BURST</option>
                   </select>
                   <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none text-white/10">
                      <ICONS.ChevronDown className="w-10 h-10" />
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <label className="flex items-center gap-4 ml-10">
                   <ICONS.Terminal className="w-5 h-5 text-blue-400" />
                   <span className="text-[12px] font-black uppercase text-white/20 tracking-[0.5em]">自定义标识符</span>
                </label>
                <input 
                  className="w-full bg-white/[0.02] border-2 border-white/5 rounded-[2.5rem] px-12 py-10 font-black text-3xl outline-none hover:bg-white/[0.05] text-white focus:border-blue-400 transition-all"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="AUTO_IDENTIFY"
                />
             </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={!urlInput || isAnalyzing}
            className={`w-full py-12 rounded-[4rem] font-black text-3xl uppercase tracking-[1em] shadow-4xl cyber-button flex items-center justify-center gap-6 transition-all ${
               urlInput && !isAnalyzing ? 'bg-amber-500 text-black border-none' : 'bg-white/5 text-white/10 grayscale border-white/5 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <ICONS.Zap className="w-10 h-10" />}
            激活数据采集
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
