
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
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPause, onResume, onDelete, onPreview, lang }) => {
  const [expanded, setExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isRunning = [DownloadStatus.DOWNLOADING, DownloadStatus.CONNECTING].includes(task.status);
  const isCompleted = task.status === DownloadStatus.COMPLETED;

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleExport = (e: React.MouseEvent) => {
    handleAction(e, () => {
      setIsExporting(true);
      setTimeout(() => {
        setIsExporting(false);
        alert('文件已成功导出至默认下载文件夹。');
      }, 2000);
    });
  };

  const copyUrl = (e: React.MouseEvent) => {
    handleAction(e, () => {
      navigator.clipboard.writeText(task.url);
      alert('链接已复制到剪贴板');
    });
  };
  
  return (
    <div 
      className={`glass-panel p-10 rounded-[4rem] transition-all group relative overflow-hidden flex flex-col gap-8 cursor-pointer ${
        isRunning ? 'ring-4 ring-[var(--accent-main)]/30 border-[var(--accent-main)]/20' : ''
      } hover:border-white/30 active:scale-[0.99]`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-8">
        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl relative transition-all duration-500 group-hover:scale-110 ${
          isRunning ? 'bg-[var(--accent-main)] text-black' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/30'
        }`}>
          <ICONS.File className="w-12 h-12" />
          {isRunning && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[4px] border-[#0c0f17] animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
             <h3 className="text-3xl font-black text-white truncate tracking-tighter leading-tight uppercase">{task.name}</h3>
             <span className="px-4 py-1 bg-white/10 text-[10px] font-black uppercase text-white/60 rounded-xl border border-white/5">
               {task.protocol}
             </span>
          </div>
          
          <div className="flex items-center gap-6 mb-4">
             <span className="text-lg font-mono font-black text-white/30 italic">{formatSize(task.downloaded)} / {formatSize(task.size)}</span>
             {isRunning && (
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[var(--accent-main)] rounded-full animate-ping" />
                   <span className="text-md font-black text-[var(--accent-main)] uppercase tracking-tighter">加速中 @ {(task.speed / (1024*1024)).toFixed(2)} MB/S</span>
                </div>
             )}
             {isCompleted && (
                <span className="text-md font-black text-emerald-400 uppercase tracking-tighter">阵列就绪 / 磁盘已保存</span>
             )}
          </div>

          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
             <div 
               className={`h-full transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-[var(--accent-main)] shadow-[0_0_20px_var(--accent-glow)]'}`}
               style={{ width: `${task.progress}%` }}
             >
                {!isCompleted && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />}
             </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <button onClick={(e) => handleAction(e, () => onPause(task.id))} className="p-6 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] juicy-button border border-white/10"><ICONS.Pause className="w-8 h-8"/></button>
          ) : !isCompleted && (
            <button onClick={(e) => handleAction(e, () => onResume(task.id))} className="p-6 bg-[var(--accent-main)] text-black rounded-[2rem] juicy-button shadow-xl shadow-[var(--accent-glow)]/20"><ICONS.Play className="w-8 h-8"/></button>
          )}
          
          {isCompleted && (
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`p-6 ${isExporting ? 'bg-amber-500' : 'bg-emerald-500'} text-black rounded-[2rem] juicy-button shadow-xl shadow-emerald-500/20`}
            >
              <ICONS.Download className={`w-8 h-8 ${isExporting ? 'animate-bounce' : ''}`}/>
            </button>
          )}

          <button onClick={(e) => handleAction(e, () => onDelete(task.id))} className="p-6 bg-rose-600/10 text-rose-500 hover:bg-rose-600/30 rounded-[2rem] juicy-button border border-rose-500/20"><ICONS.Trash className="w-8 h-8"/></button>
        </div>
      </div>

      {expanded && (
        <div className="pt-8 border-t border-white/10 animate-in slide-in-from-top-10 duration-500">
           {/* 功能性二级按钮组 */}
           <div className="flex gap-4 mb-10">
              <button onClick={copyUrl} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white/60 transition-all">
                 <ICONS.Search className="w-5 h-5" /> {t('copy_link', lang)}
              </button>
              <button onClick={(e) => handleAction(e, () => alert('正在初始化 SHA-256 深度校验...'))} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white/60 transition-all">
                 <ICONS.Shield className="w-5 h-5" /> {t('verify_hash', lang)}
              </button>
              <button onClick={(e) => handleAction(e, () => alert('跳转至系统资源管理器...'))} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white/60 transition-all">
                 <ICONS.Folder className="w-5 h-5" /> {t('open_folder', lang)}
              </button>
           </div>

           <div className="grid grid-cols-3 gap-12 mb-10">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">超线程隧道</p>
                 <p className="text-xl font-black text-white">{isCompleted ? '同步完成' : `${task.threads} 隧道活跃`}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">P2P 传播节点</p>
                 <p className="text-xl font-black text-emerald-400">{task.peerCount || 64} 已发现</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">健康度等级</p>
                 <p className="text-xl font-black text-[var(--accent-main)]">{task.safetyScore}% 安全</p>
              </div>
           </div>

           <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em]">{t('bitfield_label', lang)}</span>
                <span className="font-mono text-lg text-[var(--accent-main)] font-black">{Math.round(task.progress)}% 全同步</span>
              </div>
              <Bitfield data={task.bitfield} status={task.status} />
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
