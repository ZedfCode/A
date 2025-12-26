
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { DownloadTask, DownloadStatus, FileType, Language } from '../types';
import { t } from '../services/i18n';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: DownloadTask) => void;
  lang: Language;
  currentDiskUsage: number;
  diskLimit: number;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask, lang, currentDiskUsage, diskLimit }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [threads, setThreads] = useState(256);
  const [estimatedSize, setEstimatedSize] = useState(0);

  useEffect(() => {
    if (url.length > 10) {
      // 模拟探测文件大小
      setEstimatedSize(Math.floor(Math.random() * 2000 * 1024 * 1024) + 50 * 1024 * 1024);
      if(!name) setName(url.split('/').pop() || 'RESOURCE_DATA');
    }
  }, [url]);

  const hasSpace = (currentDiskUsage + estimatedSize) <= diskLimit;

  const handleSubmit = async () => {
    if (!url || !hasSpace) return;

    // 真正的落地：尝试触发文件选择器
    let physicalPath = "Default/Downloads";
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({ suggestedName: name });
        physicalPath = `Local://Disk/${handle.name}`;
      } catch (e) {
        // 用户取消，则使用默认模拟路径
      }
    }

    onAddTask({
      id: Math.random().toString(36).substr(2, 9),
      url,
      name: name || 'UNTITLED',
      size: estimatedSize,
      downloaded: 0,
      status: DownloadStatus.DOWNLOADING,
      type: FileType.OTHER,
      protocol: 'HTTP',
      progress: 0,
      speed: 0,
      threads: 0,
      maxThreads: threads,
      addedAt: Date.now(),
      isResumable: true,
      physicalPath,
      bitfield: new Array(100).fill(0),
      safetyScore: 98,
      peerCount: 120,
      lastActive: Date.now()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
      <div className="glass-panel w-full max-w-3xl p-12 rounded-[3rem] border border-white/10 animate-in zoom-in-95">
        <h3 className="text-4xl font-black mb-8 uppercase italic tracking-tighter">Initialize Link Matrix</h3>
        
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Source Resource URL</label>
            <textarea 
              className="w-full bg-black/50 border border-white/5 rounded-2xl p-6 font-mono text-sm outline-none focus:border-blue-500/50"
              rows={3}
              placeholder="Paste HTTP / HTTPS / MAGNET link here..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Local Alias</label>
              <input 
                className="w-full bg-black/50 border border-white/5 rounded-2xl p-5 font-bold outline-none focus:border-blue-500/50"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Parallel Tunnels</label>
              <select 
                className="w-full bg-black/50 border border-white/5 rounded-2xl p-5 font-bold outline-none appearance-none cursor-pointer"
                value={threads}
                onChange={e => setThreads(Number(e.target.value))}
              >
                <option value={128}>128 Tunnels (Safe)</option>
                <option value={256}>256 Tunnels (Aggressive)</option>
                <option value={512}>512 Tunnels (Extreme)</option>
                <option value={1024}>1024 Tunnels (Industrial)</option>
              </select>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${hasSpace ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Capacity Pre-allocation Check</span>
                <span className={`text-[10px] font-black ${hasSpace ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {hasSpace ? 'READY' : 'INSUFFICIENT SPACE'}
                </span>
             </div>
             <p className="text-xs font-mono text-slate-500 uppercase">
                Est. Size: {(estimatedSize / (1024*1024)).toFixed(1)} MB | Path: {hasSpace ? 'Writeable' : 'Blocked'}
             </p>
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-6 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all">Cancel</button>
            <button 
              onClick={handleSubmit} 
              disabled={!url || !hasSpace}
              className={`flex-1 py-6 rounded-2xl font-black uppercase tracking-widest transition-all ${!url || !hasSpace ? 'bg-white/5 text-white/10' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95'}`}
            >
              Confirm & Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
