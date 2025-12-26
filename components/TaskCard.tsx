
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
  onPreview: (task: DownloadTask) => void;
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
  const isCompleted = task.status === DownloadStatus.COMPLETED;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };
  
  return (
    <div 
      className={`glass-panel p-12 rounded-[4rem] transition-all group relative overflow-hidden flex flex-col gap-10 cursor-pointer ${
        isRunning ? 'ring-4 ring-[var(--accent-main)]/30' : ''
      } hover:border-white/30`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-10">
        <div className={`w-28 h-28 rounded-[2.8rem] flex items-center justify-center shrink-0 shadow-2xl relative transition-all duration-500 group-hover:scale-110 ${
          isRunning ? 'bg-[var(--accent-main)] text-black' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/30'
        }`}>
          <ICONS.File className="w-14 h-14" />
          {isRunning && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-[6px] border-[#0c0f17] animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-6 mb-4">
             <h3 className="text-4xl font-black text-white truncate tracking-tighter leading-tight uppercase">{task.name}</h3>
             <span className="px-6 py-2 bg-white/10 text-xs font-black uppercase text-white/60 rounded-2xl border border-white/10">
               {task.protocol}
             </span>
          </div>
          
          <div className="flex items-center gap-8 mb-6">
             <span className="text-xl font-mono font-black text-white/40 italic">{formatSize(task.downloaded)} / {formatSize(task.size)}</span>
             {isRunning && (
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-[var(--accent-main)] rounded-full animate-ping" />
                   <span className="text-lg font-black text-[var(--accent-main)] uppercase tracking-tighter">加速中 @ {(task.speed / (1024*1024)).toFixed(2)} MB/S</span>
                </div>
             )}
             {isCompleted && (
                <span className="text-lg font-black text-emerald-400 uppercase tracking-tighter">已就绪 / 磁盘已保存</span>
             )}
          </div>

          <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
             <div 
               className={`h-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent-main)] shadow-[0_0_20px_var(--accent-glow)]'}`}
               style={{ width: `${task.progress}%` }}
             >
                {!isCompleted && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />}
             </div>
          </div>
        </div>

        <div className="flex gap-4">
          {isRunning ? (
            <button onClick={(e) => handleAction(e, () => onPause(task.id))} className="p-7 bg-white/10 hover:bg-white/20 text-white rounded-3xl juicy-button"><ICONS.Pause className="w-10 h-10"/></button>
          ) : !isCompleted && (
            <button onClick={(e) => handleAction(e, () => onResume(task.id))} className="p-7 bg-[var(--accent-main)] text-black rounded-3xl juicy-button"><ICONS.Play className="w-10 h-10"/></button>
          )}
          
          {isCompleted && (
            <button 
              onClick={(e) => handleAction(e, () => alert('正在从缓存导出到系统下载文件夹...'))} 
              className="p-7 bg-emerald-500 text-black rounded-3xl juicy-button"
              title="保存到本地"
            >
              <ICONS.Download className="w-10 h-10"/>
            </button>
          )}

          <button onClick={(e) => handleAction(e, () => onDelete(task.id))} className="p-7 bg-rose-600/20 text-rose-500 hover:bg-rose-600/40 rounded-3xl juicy-button"><ICONS.Trash className="w-10 h-10"/></button>
        </div>
      </div>

      {expanded && (
        <div className="pt-12 border-t border-white/10 animate-in slide-in-from-top-10 duration-500">
           <div className="grid grid-cols-3 gap-16 mb-12">
              <div className="space-y-4">
                 <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">超线程并发</p>
                 <p className="text-2xl font-black text-white">{isCompleted ? '任务完成' : `${task.threads} 隧道活跃`}</p>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">P2P 节点</p>
                 <p className="text-2xl font-black text-emerald-400">{task.peerCount || 42} 已同步</p>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">本地持久化</p>
                 <p className="text-2xl font-black text-[var(--accent-main)]">已保存至本地存储</p>
              </div>
           </div>

           <div className="bg-black/40 p-12 rounded-[3.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-black text-white/40 uppercase tracking-[0.5em]">分段校验矩阵 (Bitfield Map)</span>
                <span className="font-mono text-xl text-[var(--accent-main)] font-black">{Math.round(task.progress)}% 完整</span>
              </div>
              <Bitfield data={task.bitfield} status={task.status} />
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
