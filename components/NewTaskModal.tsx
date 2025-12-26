
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { geminiService } from '../services/geminiService';
import { DownloadTask, DownloadStatus, FileType, Language, Priority } from '../types';
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
      name: customName || urlInput.split('/').pop() || '新建下载任务',
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
      peerCount: 0,
      eta: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-10">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative glass-panel rounded-[5rem] w-full max-w-3xl p-16 flex flex-col border border-white/20 shadow-4xl">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">建立隧道</h3>
            <p className="text-sm font-black uppercase text-white/30 tracking-[0.6em]">超线程架构初始化</p>
          </div>
          <div 
            className={`ai-switch scale-150 ${aiEnabled ? 'active' : ''}`}
            onClick={() => setAiEnabled(!aiEnabled)}
          >
            <div className="ai-knob bg-white"><ICONS.Brain className="w-6 h-6 text-black"/></div>
          </div>
        </div>

        <div className="space-y-12">
          <textarea 
            placeholder="粘贴目标 URL / Magnet / Torrent..."
            className="w-full h-64 bg-black/40 border border-white/10 rounded-[3rem] p-10 font-mono text-xl outline-none focus:border-[var(--accent-main)]/50 resize-none transition-all placeholder:text-white/10"
            value={urlInput}
            onChange={handleUrlChange}
          />

          <div className="grid grid-cols-2 gap-10">
             <div className="space-y-4">
                <label className="text-xs font-black uppercase text-white/40 tracking-widest block">线程配额</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 font-black text-xl outline-none appearance-none cursor-pointer hover:bg-white/10"
                  value={threadLimit}
                  onChange={e => setThreadLimit(Number(e.target.value))}
                >
                  <option value={16}>16 (省流)</option>
                  <option value={64}>64 (默认加速)</option>
                  <option value={128}>128 (狂暴下载)</option>
                  <option value={256}>256 (集群吞吐)</option>
                </select>
             </div>
             <div className="space-y-4">
                <label className="text-xs font-black uppercase text-white/40 tracking-widest block">重命名文件</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 font-black text-xl outline-none hover:bg-white/10"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder={isAnalyzing ? "AI 识别中..." : "保持默认"}
                />
             </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={!urlInput || isAnalyzing}
            className="w-full py-10 bg-[var(--accent-main)] text-black rounded-[4rem] font-black text-xl uppercase tracking-[0.5em] shadow-2xl juicy-button disabled:opacity-20 active:brightness-150"
          >
            建立高并发下载通道
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
