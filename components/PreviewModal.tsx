
import React from 'react';
import { DownloadTask, FileType, Language } from '../types';
import { t } from '../services/i18n';

interface PreviewModalProps {
  task: DownloadTask | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ task, isOpen, onClose, lang }) => {
  if (!isOpen || !task) return null;

  const isVideo = task.type === FileType.VIDEO;
  const isAudio = task.type === FileType.AUDIO;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-[2.5rem] w-full max-w-4xl overflow-hidden border border-white/10 shadow-4xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-xl">▶</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white truncate max-w-md">{task.name}</h3>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                {task.progress < 10 ? 'Buffering P2P Stream...' : 'Live Playback Active'} ({Math.round(task.progress)}%)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="aspect-video bg-black flex items-center justify-center relative">
          {(isVideo || isAudio) ? (
            <div className="w-full h-full flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="text-center">
                 <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center mb-4 border border-blue-600/40 animate-pulse">
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
                 </div>
                 <p className="text-white/60 font-mono text-sm tracking-tighter">
                   [ STREAMING FROM {task.peerCount || 24} NODES ]
                 </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-20">
               <p className="text-slate-500 font-black text-2xl uppercase tracking-tighter mb-4">No Visual Track Detected</p>
               <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-2xl font-black">Close Preview</button>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-950/50 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Peers</p>
                <p className="text-lg font-black text-emerald-500">{task.peerCount || 0}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Speed</p>
                <p className="text-lg font-black text-blue-500">{(task.speed / (1024 * 1024)).toFixed(2)} MB/s</p>
              </div>
           </div>
           <div className="flex gap-4">
              <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all">Cast to TV</button>
              <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95">Open Player</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
