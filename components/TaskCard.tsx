
import React, { useState } from 'react';
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

  return (
    <div 
      className={`glass-panel p-10 rounded-[3rem] transition-all group relative overflow-hidden flex flex-col gap-8 cursor-pointer ${
        isRunning ? 'ring-4 ring-[var(--accent-main)]/20 border-[var(--accent-main)]/40 scale-[1.02]' : ''
      } hover:bg-white/[0.05]`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-8 relative z-10">
        <div className={`w-24 h-24 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl transition-all duration-500 group-hover:rotate-6 ${
          isRunning ? 'bg-[var(--accent-main)] text-black' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/20'
        }`}>
          <ICONS.Download className="w-14 h-14" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4">
             <h3 className="text-3xl font-black text-white truncate tracking-tighter uppercase leading-none">{task.name}</h3>
             <span className="px-4 py-1.5 bg-white/10 text-[10px] font-black uppercase text-white/50 rounded-xl border border-white/5">
               {task.protocol}
             </span>
          </div>
          
          <div className="flex items-center gap-10 mb-6">
             <div className="flex items-center gap-2">
                <ICONS.FileCode className="w-5 h-5 text-white/30" />
                <span className="text-lg mono-data font-black text-white italic">{formatSize(task.downloaded)} / {formatSize(task.size)}</span>
             </div>
             {isRunning && (
                <div className="flex items-center gap-3">
                   <ICONS.Gauge className="w-6 h-6 text-[var(--accent-main)]" />
                   <span className="text-xl font-black text-[var(--accent-main)] uppercase tracking-tighter">
                     {(task.speed / (1024*1024)).toFixed(1)} MB/S
                   </span>
                </div>
             )}
          </div>

          <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden relative border border-white/10">
             <div 
               className={`h-full transition-all duration-500 ease-out relative ${isCompleted ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-[var(--accent-main)] shadow-[0_0_25px_var(--accent-glow)]'}`}
               style={{ width: `${task.progress}%` }}
             >
                {isRunning && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1s_infinite]" />}
             </div>
          </div>
        </div>

        <div className="flex gap-4">
          {isRunning ? (
            <button onClick={(e) => { e.stopPropagation(); onPause(task.id); }} className="w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-2xl juicy-button border border-white/10">
              <ICONS.Pause className="w-8 h-8"/>
            </button>
          ) : !isCompleted && (
            <button onClick={(e) => { e.stopPropagation(); onResume(task.id); }} className="w-16 h-16 bg-[var(--accent-main)] text-black rounded-2xl juicy-button shadow-xl shadow-[var(--accent-glow)]">
              <ICONS.Play className="w-8 h-8"/>
            </button>
          )}
          
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="w-16 h-16 bg-rose-600/10 text-rose-500 hover:bg-rose-600/30 rounded-2xl juicy-button border border-rose-500/20">
            <ICONS.Trash className="w-8 h-8"/>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pt-10 border-t border-white/10 animate-in slide-in-from-top-4 duration-500 flex flex-col gap-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">活跃并发隧道</p>
                 <p className="text-3xl font-black text-white mono-data">{isRunning ? `${task.threads}/${task.maxThreads}` : 'WAITING'}</p>
              </div>
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">安全防护评分</p>
                 <p className="text-3xl font-black text-emerald-400 mono-data">{task.safetyScore}%</p>
              </div>
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">分布式节点数</p>
                 <p className="text-3xl font-black text-[var(--accent-main)] mono-data">{task.peerCount || 64}</p>
              </div>
              <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">计算优先级</p>
                 <p className="text-3xl font-black text-blue-400 mono-data">LV.{task.priority}</p>
              </div>
           </div>

           <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-6 px-4">
                <span className="text-xs font-black text-white/30 uppercase tracking-[0.6em]">{t('bitfield_label', lang)}</span>
                <span className="text-sm font-black text-[var(--accent-main)] italic">Sector Matrix Verified</span>
              </div>
              <Bitfield data={task.bitfield} status={task.status} />
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
