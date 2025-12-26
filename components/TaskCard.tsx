
import React, { useState } from 'react';
import { DownloadTask, DownloadStatus, Language } from '../types';
import { ICONS } from '../constants';
import Bitfield from './Bitfield';

interface TaskCardProps {
  task: DownloadTask;
  isSelected: boolean;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  lang: Language;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPause, onResume, onDelete, onPreview }) => {
  const [expanded, setExpanded] = useState(false);
  const isRunning = [DownloadStatus.DOWNLOADING, DownloadStatus.CONNECTING].includes(task.status);
  
  return (
    <div 
      className={`glass-panel p-8 rounded-[3rem] border border-white/5 transition-all group relative overflow-hidden flex flex-col gap-6 ${
        isRunning ? 'ring-1 ring-[var(--accent-main)]/30' : ''
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* 比例优化：左侧图标，中间核心信息，右侧操作 */}
      <div className="flex items-center gap-8">
        <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl relative transition-transform group-hover:scale-105 ${
          isRunning ? 'bg-[var(--accent-main)] text-black rotate-3' : 'bg-white/5 text-slate-500'
        }`}>
          <ICONS.File className="w-7 h-7" />
          {isRunning && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black animate-ping" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
             <h3 className="text-lg font-black text-white truncate">{task.name}</h3>
             <span className="px-3 py-0.5 bg-white/5 text-[9px] font-black uppercase text-slate-500 rounded-full">
               {task.protocol}
             </span>
          </div>
          
          <div className="flex items-baseline gap-4 mb-4">
             <span className="text-[11px] font-mono font-bold text-slate-400">{formatSize(task.downloaded)} / {formatSize(task.size)}</span>
             {isRunning && <span className="text-[11px] font-black text-[var(--accent-main)] italic">@ {(task.speed / (1024*1024)).toFixed(2)} MB/S</span>}
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
             <div 
               className="h-full bg-[var(--accent-main)] liquid-progress transition-all duration-700"
               style={{ width: `${task.progress}%` }}
             />
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <button onClick={(e) => { e.stopPropagation(); onPause(task.id); }} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl juicy-button"><ICONS.Pause className="w-5 h-5"/></button>
          ) : task.status !== DownloadStatus.COMPLETED && (
            <button onClick={(e) => { e.stopPropagation(); onResume(task.id); }} className="p-4 bg-[var(--accent-main)] text-black rounded-2xl juicy-button"><ICONS.Play className="w-5 h-5"/></button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-2xl juicy-button"><ICONS.Trash className="w-5 h-5"/></button>
        </div>
      </div>

      {/* 展开后的艺术细节：大型 Bitfield 展示 */}
      {expanded && (
        <div className="mt-2 pt-6 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
           <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">隧道状态 Cluster</p>
                 <p className="text-xs font-bold text-slate-400">{task.threads} 逻辑核心在线</p>
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">分布节点 Peers</p>
                 <p className="text-xs font-bold text-emerald-500">{task.peerCount || 42} 边缘缓存就绪</p>
              </div>
              <div>
                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">安全系数 Security</p>
                 <p className="text-xs font-bold text-[var(--accent-main)]">{task.safetyScore}% AI 信任评分</p>
              </div>
           </div>

           <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex justify-between">
                <span>Data Bitfield Engine</span>
                <span className="font-mono">{Math.round(task.progress)}% Verified</span>
              </p>
              <Bitfield data={task.bitfield} status={task.status} />
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
