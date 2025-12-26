
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

  // 模拟并发线程活动矩阵 (128个微小采样点)
  const threadMatrix = useMemo(() => {
    return new Array(64).fill(0).map(() => Math.random() > 0.4);
  }, [task.speed, isRunning]);

  return (
    <div 
      className={`glass-panel p-10 rounded-[4rem] transition-all card-3d relative overflow-hidden flex flex-col gap-10 cursor-pointer border-white/[0.05] ${
        isRunning ? 'ring-2 ring-amber-500/20' : ''
      } hover:bg-white/[0.08]`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* 活跃指示器 */}
      {isRunning && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
      )}

      <div className="flex items-start gap-10 relative z-10">
        {/* 核心状态图标 */}
        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-3xl transition-all duration-700 ${
          isRunning ? 'bg-amber-500 text-black' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/10'
        }`}>
          {isCompleted ? <ICONS.Shield className="w-14 h-14" /> : <ICONS.Download className="w-14 h-14 animate-bounce-subtle" />}
        </div>

        <div className="flex-1 min-w-0 pt-2">
          <div className="flex items-center gap-5 mb-5">
             <h3 className="text-4xl font-black text-white truncate tracking-tighter uppercase leading-none">{task.name}</h3>
             <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/5 text-[10px] font-black uppercase text-white/30 rounded-md border border-white/5">
                  {task.protocol}
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-[10px] font-black uppercase text-blue-400 rounded-md border border-blue-500/10">
                  SECURE
                </span>
             </div>
          </div>
          
          <div className="flex items-center gap-10 mb-8">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Payload Volume</span>
                <span className="text-xl mono-data font-black text-white/80">
                   {formatSize(task.downloaded)} <span className="text-white/20">/</span> {formatSize(task.size)}
                </span>
             </div>
             
             {isRunning && (
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-amber-500/40 uppercase tracking-widest mb-1">Throughput Rate</span>
                   <div className="flex items-center gap-3">
                      <ICONS.Gauge className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-black text-amber-500 mono-data">
                        {(task.speed / (1024*1024)).toFixed(1)} <span className="text-xs">MB/S</span>
                      </span>
                   </div>
                </div>
             )}
          </div>

          <div className="w-full h-5 bg-black/80 rounded-full overflow-hidden relative border border-white/5 shadow-2xl">
             <div 
               className={`h-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
               style={{ width: `${task.progress}%` }}
             >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                {isRunning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />}
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isRunning ? (
            <button onClick={(e) => { e.stopPropagation(); onPause(task.id); }} className="w-20 h-20 cyber-button text-white rounded-[1.8rem] flex items-center justify-center">
              <ICONS.Pause className="w-10 h-10"/>
            </button>
          ) : !isCompleted && (
            <button onClick={(e) => { e.stopPropagation(); onResume(task.id); }} className="w-20 h-20 bg-amber-500 text-black rounded-[1.8rem] cyber-button flex items-center justify-center">
              <ICONS.Play className="w-10 h-10"/>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="w-20 h-20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-[1.8rem] cyber-button flex items-center justify-center">
            <ICONS.Trash className="w-10 h-10"/>
          </button>
        </div>
      </div>

      {/* 实时线程矩阵显示 */}
      {isRunning && (
        <div className="bg-black/60 p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
           <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.4em]">Hyper-Thread Matrix (Live)</span>
              <span className="text-[10px] font-black text-amber-500 mono-data italic">Tunnel Load: 88.4%</span>
           </div>
           <div className="grid grid-cols-16 gap-1.5">
              {threadMatrix.map((active, i) => (
                <div key={i} className={`h-3 rounded-[1px] transition-all duration-300 ${active ? 'bg-amber-500 shadow-[0_0_8px_var(--accent-glow)]' : 'bg-white/[0.02]'}`} />
              ))}
           </div>
        </div>
      )}

      {expanded && (
        <div className="pt-10 border-t border-white/5 animate-in slide-in-from-top-4 duration-500 grid grid-cols-2 gap-8">
           <div className="bg-white/[0.01] p-8 rounded-[3rem] border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                 <ICONS.Server className="w-5 h-5 text-blue-400" />
                 <span className="text-xs font-black uppercase text-blue-400 tracking-widest">Metadata Cluster</span>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 uppercase font-black">Hash Status</span>
                    <span className="text-xs font-black text-emerald-400 italic">VERIFIED</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 uppercase font-black">Active Peers</span>
                    <span className="text-xs font-black text-white mono-data">{task.peerCount || 124}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 uppercase font-black">Security Rank</span>
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">LV.9 Ultra</span>
                 </div>
              </div>
           </div>

           <div className="bg-black/40 p-8 rounded-[3.5rem] border border-white/5">
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em]">Sector Map</span>
                 <ICONS.Cpu className="w-5 h-5 text-amber-500" />
              </div>
              <Bitfield data={task.bitfield} status={task.status} />
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
