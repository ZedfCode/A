
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { DownloadTask, DownloadStatus, FileType, Language, Priority } from '../types';
import { geminiService } from '../services/geminiService';
import GeekDropdown from './GeekDropdown';

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

  const threadOptions = [
    { value: 128, label: '128X 效率型', icon: <ICONS.Cpu className="w-5 h-5"/>, desc: '平衡性能与带宽' },
    { value: 256, label: '256X 激进型', icon: <ICONS.Zap className="w-5 h-5"/>, desc: '适合高速光纤环境' },
    { value: 512, label: '512X 矩阵型', icon: <ICONS.Server className="w-5 h-5"/>, desc: '大文件分片加速' },
    { value: 1024, label: '1024X 极限型', icon: <ICONS.Terminal className="w-5 h-5"/>, desc: '集群级并发采集' },
  ];

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
      name: finalName || urlInput.split('/').pop() || 'UNTITLED_RESOURCE',
      size: 1024 * 1024 * (Math.random() * 5000 + 1000),
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
      securityReport: "PROTOCOL SECURE",
      speedHistory: [],
      retries: 0,
      peerCount: 128,
      eta: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-[#050608]/90 backdrop-blur-3xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative glass-panel rounded-[3.5rem] w-full max-w-5xl p-16 flex flex-col border border-white/5 animate-in zoom-in-95 duration-500 shadow-4xl">
        <header className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <ICONS.Plus className="w-6 h-6 text-white" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500 leading-none">Initialization Cluster</span>
            </div>
            <h3 className="text-6xl font-black italic tracking-tighter uppercase text-white leading-none">建立采集任务</h3>
          </div>
          
          <div className="flex flex-col items-end gap-3 bg-white/[0.03] p-5 rounded-3xl border border-white/5">
             <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest italic">AI Analysis Engine</span>
             <div 
                className={`ai-switch scale-[1.3] ${aiEnabled ? 'active' : ''}`}
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                <div className="ai-knob bg-white flex items-center justify-center shadow-xl">
                  <ICONS.Brain className={`w-4 h-4 ${aiEnabled ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
              </div>
          </div>
        </header>

        <div className="space-y-10">
          <div className="relative group">
            <textarea 
              placeholder="PASTE RESOURCE LINKS / MAGNET / TORRENT..."
              className="w-full h-64 bg-black/40 border border-white/5 rounded-[2.5rem] p-10 font-mono text-2xl outline-none focus:border-blue-500/40 focus:bg-black/60 transition-all placeholder:text-slate-700 custom-scrollbar"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-[2.5rem] animate-in fade-in">
                 <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
                 <p className="text-sm font-black uppercase tracking-[1em] text-blue-500 animate-pulse">Deep Analyzing...</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10">
             <GeekDropdown 
                label="并发模型配置 / THREADING"
                options={threadOptions}
                value={threadLimit}
                onChange={setThreadLimit}
             />

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-3 ml-4">重命名元数据 / ALIAS</label>
                <input 
                  className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] px-8 py-5 font-bold text-lg outline-none hover:bg-white/[0.05] text-white focus:border-blue-500 transition-all"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="KEEP_ORIGINAL_ID"
                />
             </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={!urlInput || isAnalyzing}
            className={`w-full py-9 rounded-[2.5rem] font-black text-2xl uppercase tracking-[1em] btn-tech flex items-center justify-center gap-5 transition-all ${
               urlInput && !isAnalyzing ? 'bg-blue-600 text-white border-transparent' : 'opacity-20 grayscale cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? "分析中..." : <><ICONS.Zap className="w-8 h-8" /> 激活数据流</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
