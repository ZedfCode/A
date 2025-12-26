
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { geminiService } from '../services/geminiService';
import { DownloadTask, DownloadStatus, FileType, Language, Protocol, Priority } from '../types';
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
  const [threadLimit, setThreadLimit] = useState(64);

  useEffect(() => {
    if (!isOpen) { setUrlInput(''); setCustomName(''); setIsAnalyzing(false); }
    setAiEnabled(aiByDefault);
  }, [isOpen, aiByDefault]);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    if (aiEnabled && val.length > 15) {
      setIsAnalyzing(true);
      const res = await geminiService.analyzeUrl(val);
      setCustomName(res.suggestedName);
      setIsAnalyzing(false);
    }
  };

  const handleStart = () => {
    if (!urlInput.trim()) return;
    onAddTask({
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput,
      name: customName || urlInput.split('/').pop() || 'Untitled_Object',
      size: 1024 * 1024 * (Math.random() * 1000 + 100),
      downloaded: 0,
      status: DownloadStatus.QUEUED,
      type: FileType.OTHER,
      protocol: 'HTTP',
      progress: 0,
      speed: 0,
      threads: 0,
      maxThreads: threadLimit,
      priority: Priority.NORMAL,
      addedAt: Date.now(),
      isResumable: true,
      bitfield: new Array(64).fill(0),
      safetyScore: 100,
      securityReport: "内核验证通过",
      speedHistory: [],
      retries: 0,
      /* Initializing peerCount to 0 */
      peerCount: 0,
      eta: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative glass-panel rounded-[3.5rem] w-full max-w-xl p-10 flex flex-col border border-white/10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1 text-white">Initialization</h3>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">创建高并发下载隧道</p>
          </div>
          <div 
            className={`ai-switch ${aiEnabled ? 'active' : ''}`}
            onClick={() => setAiEnabled(!aiEnabled)}
          >
            <div className="ai-knob"><ICONS.Brain className="w-4 h-4"/></div>
          </div>
        </div>

        <div className="space-y-8">
          <textarea 
            placeholder="粘贴 URL / Magnet / Torrent 链接..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-[2rem] p-6 font-mono text-sm outline-none focus:border-[var(--accent-main)]/50 resize-none transition-all"
            value={urlInput}
            onChange={handleUrlChange}
          />

          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">隧道并发线程 / Threads</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-xs outline-none"
                  value={threadLimit}
                  onChange={e => setThreadLimit(Number(e.target.value))}
                >
                  <option value={16}>16 (轻量)</option>
                  <option value={32}>32 (标准)</option>
                  <option value={64}>64 (加速)</option>
                  <option value={128}>128 (狂暴)</option>
                </select>
             </div>
             <div>
                <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">智能重命名 / Alias</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-xs outline-none"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder={isAnalyzing ? "正在识别..." : "默认文件名"}
                />
             </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={!urlInput || isAnalyzing}
            className="w-full py-5 bg-[var(--accent-main)] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl juicy-button disabled:opacity-50"
          >
            建立连接 Establish Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
