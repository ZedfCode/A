
import React, { useState, useMemo } from 'react';
import { DownloadTask, DownloadStatus, Language } from '../types';
import { ICONS } from '../constants';
import Bitfield from './Bitfield';
import { t } from '../services/i18n';

interface TaskCardProps {
  task: DownloadTask;
  isSelected: boolean;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (task: DownloadTask) => void;
  lang: Language;
}

const formatSize = (bytes: number) => {
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPause, onResume, onDelete, onPreview, lang }) => {
  const [expanded, setExpanded] = useState(false);
  const isRunning = [DownloadStatus.DOWNLOADING, DownloadStatus.CONNECTING].includes(task.status);
  const isCompleted = task.status === DownloadStatus.COMPLETED;

  // 模拟一个更真实的线程池动态
  const threadLoad = useMemo(() => {
    return new Array(8).fill(0).map(() => Math.random() * 100);
  }, [task.speed]);

  return (
    <div 
      className={`glass-panel p-8 rounded-[2.5rem] transition-all duration-500 list-item-enter relative overflow-hidden flex flex-col gap-6 cursor-pointer border-white/[0.04] group ${
        isRunning ? 'ring-1 ring-blue-500/20 bg-blue-500/[0.01]' : ''
      } hover:bg-white/[0.06] hover:-translate-y-1`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-8 relative z-10">
        {/* 简洁成熟的图标指示器 */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-700 ${
          isRunning ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.3)]' : 
          isCompleted ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-white/5 text-slate-600'
        }`}>
          {isCompleted ? <ICONS.Shield className="w-10 h-10" /> : <ICONS.Download className={`w-10 h-10 ${isRunning ? 'animate-pulse' : ''}`} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-3">
             <h3 className="text-2xl font-black text-slate-100 truncate tracking-tight uppercase leading-none group-hover:text-blue-400 transition-colors">{task.name}</h3>
             <span className="px-2 py-0.5 bg-white/5 text-[9px] font-black uppercase text-slate-500 rounded border border-white/10">
               {task.protocol}
             </span>
          </div>
          
          <div className="flex items-center gap-10 mb-5">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">DATA PROCESSED</span>
                <span className="text-lg mono-data font-black text-slate-300">
                   {formatSize(task.downloaded)} <span className="text-slate-700">/</span> {formatSize(task.size)}
                </span>
             </div>
             
             {isRunning && (
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest mb-1">THROUGHPUT</span>
                   <span className="text-lg font-black text-blue-400 mono-data">
                     {(task.speed / (1024*1024)).toFixed(1)} <span className="text-xs">MB/S</span>
                   </span>
                </div>
             )}

             <div className="flex flex-col ml-auto text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">HEALTH</span>
                <span className={`text-lg font-black mono-data ${task.safetyScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                   {task.safetyScore}%
                </span>
             </div>
          </div>

          <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
             <div 
               className={`h-full transition-all duration-1000 ease-in-out relative ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
               style={{ width: `${task.progress}%` }}
             >
                {isRunning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />}
             </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <button onClick={(e) => { e.stopPropagation(); onPause(task.id); }} className="w-14 h-14 btn-tech text-white rounded-2xl flex items-center justify-center">
              <ICONS.Pause className="w-7 h-7"/>
            </button>
          ) : !isCompleted && (
            <button onClick={(e) => { e.stopPropagation(); onResume(task.id); }} className="w-14 h-14 bg-blue-600 text-white rounded-2xl btn-tech flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ICONS.Play className="w-7 h-7"/>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="w-14 h-14 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl btn-tech flex items-center justify-center border-rose-500/20">
            <ICONS.Trash className="w-7 h-7"/>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pt-8 border-t border-white/5 animate-in slide-in-from-top-4 duration-500 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.5em]">Sector Sync Matrix</span>
                 <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black text-blue-500 mono-data">PEERS: {task.peerCount || 102}</span>
                 </div>
              </div>
              <Bitfield data={task.bitfield} status={task.status} />
           </div>

           <div className="bg-white/[0.01] p-6 rounded-3xl border border-white/5 space-y-5">
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Core Distribution</p>
              <div className="grid grid-cols-4 gap-2">
                 {threadLoad.map((load, i) => (
                   <div key={i} className="h-12 bg-black/40 rounded border border-white/5 flex flex-col-reverse overflow-hidden">
                      <div className="bg-blue-500/40 w-full transition-all duration-1000" style={{ height: `${load}%` }} />
                   </div>
                 ))}
              </div>
              <div className="pt-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); onPreview(task); }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:border-blue-500/50"
                 >
                    Request Live Stream
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
