
import React, { useState } from 'react';
import { DownloadTask, DownloadStatus, Language } from '../types';
import { ICONS } from '../constants';
import Bitfield from './Bitfield';

interface TaskCardProps {
  task: DownloadTask;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (task: DownloadTask) => void;
  lang: Language;
}

const formatSize = (bytes: number) => {
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPause, onResume, onDelete, onExport }) => {
  const [expanded, setExpanded] = useState(false);
  const isRunning = task.status === DownloadStatus.DOWNLOADING;
  const isCompleted = task.status === DownloadStatus.COMPLETED;

  return (
    <div className={`glass-panel p-6 rounded-[2rem] border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group ${isRunning ? 'ring-1 ring-blue-500/20' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${isRunning ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>
          {isCompleted ? <ICONS.Shield className="w-8 h-8" /> : <ICONS.Download className={`w-8 h-8 ${isRunning ? 'animate-pulse' : ''}`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-black truncate uppercase tracking-tight">{task.name}</h3>
            {task.physicalPath && <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded uppercase font-black">Linked to Disk</span>}
          </div>
          
          <div className="flex gap-6 text-[11px] font-mono text-slate-500 uppercase mb-3">
             <span>{formatSize(task.downloaded)} / {formatSize(task.size)}</span>
             {isRunning && <span className="text-blue-500 font-bold">{(task.speed / (1024*1024)).toFixed(2)} MB/S</span>}
             <span>Threads: {isRunning ? task.maxThreads : 0}</span>
          </div>

          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${task.progress}%` }} />
          </div>
        </div>

        <div className="flex gap-2">
          {isCompleted ? (
            <button onClick={(e) => { e.stopPropagation(); onExport(task); }} className="w-12 h-12 bg-emerald-600/20 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all">
              <ICONS.Folder className="w-6 h-6" />
            </button>
          ) : isRunning ? (
            <button onClick={(e) => { e.stopPropagation(); onPause(task.id); }} className="w-12 h-12 bg-white/5 text-slate-300 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
              <ICONS.Pause className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onResume(task.id); }} className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
              <ICONS.Play className="w-6 h-6" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="w-12 h-12 bg-rose-600/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all">
            <ICONS.Trash className="w-6 h-6" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-6 animate-in slide-in-from-top-2">
          <div className="col-span-2 space-y-3">
            <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Sector Allocation Matrix (Breakpoint Persisted)</p>
            <Bitfield data={task.bitfield} status={task.status} />
          </div>
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-2">
            <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Physical Location</p>
            <p className="text-[10px] font-mono break-all text-slate-400">{task.physicalPath || 'Virtual Buffer'}</p>
            <div className="pt-2">
               <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1 uppercase">
                  <span>IO Health</span>
                  <span className="text-emerald-500">Optimized</span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-emerald-500/50" />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
