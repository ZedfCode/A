
import React from 'react';
import { DownloadTask, DownloadStatus } from '../types';
import { ICONS } from '../constants';

interface TaskCardProps {
  task: DownloadTask;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPause, onResume, onDelete }) => {
  const isCompleted = task.status === DownloadStatus.COMPLETED;
  const isRunning = task.status === DownloadStatus.DOWNLOADING;

  return (
    <div className="fluent-card flex items-center px-6 py-4 gap-6 group border-b">
      <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center shrink-0 border border-gray-100">
        {task.name.endsWith('.exe') || task.name.endsWith('.msi') ? <ICONS.FileExe className="w-8 h-8" /> : <ICONS.FileGeneric className="w-8 h-8" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[14px] font-bold truncate text-gray-800">{task.name}</span>
          {task.isRangeSupported && (
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded uppercase">Multi-Thread</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-gray-500 font-mono w-20">{formatSize(task.size)}</span>
          {!isCompleted && (
            <div className="flex-1 max-w-[300px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0078d4] transition-all" style={{ width: `${task.progress}%` }} />
            </div>
          )}
          {isCompleted && (
             <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
               <ICONS.Shield className="w-3 h-3" /> 已通过安全扫描
             </span>
          )}
          {isRunning && (
             <span className="text-[11px] text-[#0078d4] font-mono">{(task.speed / (1024 * 1024)).toFixed(1)} MB/s</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isCompleted && (
          <button 
            onClick={() => isRunning ? onPause(task.id) : onResume(task.id)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
            {isRunning ? <span className="text-xs">暂停</span> : <ICONS.Zap className="w-4 h-4" />}
          </button>
        )}
        <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-full">
           <ICONS.Close className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
