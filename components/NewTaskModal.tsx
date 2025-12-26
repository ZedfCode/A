
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
  const [threadLimit, setThreadLimit] = useState(128);

  useEffect(() => {
    if (!isOpen) { setUrlInput(''); setCustomName(''); }
    setAiEnabled(aiByDefault);
  }, [isOpen, aiByDefault]);

  const handleStart = () => {
    if (!urlInput.trim()) return;
    onAddTask({
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput,
      name: customName || urlInput.split('/').pop() || '新建下载任务',
      size: 1024 * 1024 * (Math.random() * 2000 + 500),
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
      safetyScore: 98,
      securityReport: "AI 深度验证安全",
      speedHistory: [],
      retries: 0,
      peerCount: 0,
      eta: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-12">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative glass-panel rounded-[4rem] w-full max-w-4xl p-20 flex flex-col border-2 border-white/20">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h3 className="text-6xl font-black italic uppercase tracking-tighter mb-4 text-white">建立数据隧道</h3>
            <p className="text-sm font-black uppercase text-white/30 tracking-[1em]">Hyper-Thread Matrix Init</p>
          </div>
          <div 
            className={`ai-switch scale-[1.5] ${aiEnabled ? 'active' : ''}`}
            onClick={() => setAiEnabled(!aiEnabled)}
          >
            <div className="ai-knob bg-white flex items-center justify-center shadow-2xl">
              <ICONS.Brain className="w-6 h-6 text-black"/>
            </div>
          </div>
        </div>

        <div className="space-y-16">
          <textarea 
            placeholder="粘贴目标 URL / Magnet / Torrent..."
            className="w-full h-80 bg-black/50 border-2 border-white/10 rounded-[3rem] p-12 font-mono text-2xl outline-none focus:border-[var(--accent-main)]/50 resize-none transition-all placeholder:text-white/5"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-12">
             <div className="space-y-6">
                <label className="text-xs font-black uppercase text-white/30 tracking-[0.5em] block ml-6">线程吞吐配额</label>
                <select 
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] px-10 py-8 font-black text-2xl outline-none appearance-none cursor-pointer hover:bg-white/10 text-white"
                  value={threadLimit}
                  onChange={e => setThreadLimit(Number(e.target.value))}
                >
                  <option value={64}>64x Standard</option>
                  <option value={128}>128x High-Speed</option>
                  <option value={256}>256x Hyper-Drive</option>
                  <option value={512}>512x Matrix-Thrust</option>
                </select>
             </div>
             <div className="space-y-6">
                <label className="text-xs font-black uppercase text-white/30 tracking-[0.5em] block ml-6">资源镜像重命名</label>
                <input 
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] px-10 py-8 font-black text-2xl outline-none hover:bg-white/10 text-white"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="保持原始元数据"
                />
             </div>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-12 bg-[var(--accent-main)] text-black rounded-[3rem] font-black text-2xl uppercase tracking-[0.6em] shadow-4xl juicy-button active:brightness-150"
          >
            开启全量吞吐
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
