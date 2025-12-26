
import React, { useState, useEffect, useRef } from 'react';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import ConsoleDrawer from './components/ConsoleDrawer';
import { DownloadTask, DownloadStatus, FileType, SystemLog } from './types';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  
  // 运行中的文件句柄映射（因为句柄无法持久化到 localStorage）
  const fileHandles = useRef<Map<string, any>>(new Map());
  const abortControllers = useRef<Map<string, AbortController[]>>(new Map());

  const addLog = (message: string, level: SystemLog['level'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: Date.now(),
      level,
      message
    }].slice(-100));
  };

  // 超线程下载逻辑
  const startSmartDownload = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const handle = fileHandles.current.get(taskId);
    if (!task || !handle) {
      addLog(`任务 ${taskId} 缺少文件句柄，无法写入`, 'error');
      return;
    }

    addLog(`正在连接服务器: ${task.url}...`);
    
    try {
      // 1. 探测服务器
      const headRes = await fetch(task.url, { method: 'HEAD' });
      const size = parseInt(headRes.headers.get('content-length') || '0');
      const acceptRanges = headRes.headers.get('accept-ranges') === 'bytes';
      
      setTasks(prev => prev.map(t => t.id === taskId ? { 
        ...t, 
        size, 
        isRangeSupported: acceptRanges,
        status: DownloadStatus.DOWNLOADING 
      } : t));

      const writable = await handle.createWritable();
      const controllers: AbortController[] = [];
      const threadCount = acceptRanges ? 4 : 1; // 如果支持 Range，开启4线程

      addLog(`检测到服务器${acceptRanges ? '支持' : '不支持'}断点续传。开启 ${threadCount} 个并行线程。`, 'success');

      if (acceptRanges && size > 0) {
        // 多线程分片逻辑
        const chunkSize = Math.ceil(size / threadCount);
        const promises = Array.from({ length: threadCount }).map(async (_, i) => {
          const start = i * chunkSize;
          const end = i === threadCount - 1 ? size - 1 : (i + 1) * chunkSize - 1;
          
          const controller = new AbortController();
          controllers.push(controller);

          const res = await fetch(task.url, {
            headers: { 'Range': `bytes=${start}-${end}` },
            signal: controller.signal
          });

          if (!res.body) return;
          const reader = res.body.getReader();
          let pos = start;

          while(true) {
            const { done, value } = await reader.read();
            if (done) break;
            // 真实写入硬盘对应偏移量
            await writable.write({ type: 'write', data: value, position: pos });
            pos += value.length;
            
            // 进度更新频率控制
            if (Math.random() > 0.9) {
              setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                  const newDownloaded = t.downloaded + value.length;
                  return { ...t, downloaded: newDownloaded, progress: (newDownloaded / size) * 100 };
                }
                return t;
              }));
            }
          }
        });

        abortControllers.current.set(taskId, controllers);
        await Promise.all(promises);
      } else {
        // 单线程普通流
        const res = await fetch(task.url);
        if (!res.body) throw new Error("Body is null");
        const reader = res.body.getReader();
        while(true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writable.write(value);
        }
      }

      await writable.close();
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: DownloadStatus.COMPLETED, progress: 100 } : t));
      addLog(`文件下载完成并成功写入磁盘: ${task.name}`, 'success');

    } catch (err: any) {
      addLog(`下载失败: ${err.message}`, 'error');
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: DownloadStatus.ERROR } : t));
    }
  };

  const handlePause = (id: string) => {
    abortControllers.current.get(id)?.forEach(c => c.abort());
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: DownloadStatus.PAUSED } : t));
    addLog(`任务已挂起: ${id}`, 'warn');
  };

  const handleAddTask = (task: DownloadTask) => {
    if (task.fileHandle) {
      fileHandles.current.set(task.id, task.fileHandle);
    }
    setTasks(prev => [task, ...prev]);
    startSmartDownload(task.id);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f3f3]">
      <header className="px-4 py-2 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#0078d4] rounded-sm flex items-center justify-center">
             <ICONS.Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[12px] text-gray-600 font-bold">云加速 - 核心传输引擎 Active</span>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className="text-[11px] text-[#0078d4] hover:underline">查看日志</button>
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-400" />
             <div className="w-3 h-3 rounded-full bg-yellow-400" />
             <div className="w-3 h-3 rounded-full bg-green-400" />
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onPause={handlePause} 
            onResume={startSmartDownload} 
            onDelete={(id) => setTasks(p => p.filter(t => t.id !== id))} 
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
             <ICONS.Folder className="w-20 h-20 opacity-10 mb-4" />
             <p className="text-sm">等待建立高速下载链接</p>
          </div>
        )}
      </main>

      <footer className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
        <div className="flex gap-3">
           <button onClick={() => setIsModalOpen(true)} className="btn-fluent primary">新建下载</button>
           <button onClick={() => setTasks([])} className="btn-fluent">清空列表</button>
        </div>
        <div className="text-[11px] text-gray-400 font-mono">
           ENGINE_VER: 2.1.0-STABLE | THREADS_ALLOC: {tasks.filter(t => t.status === DownloadStatus.DOWNLOADING).length * 4}
        </div>
      </footer>

      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTask={handleAddTask}
        lang="zh"
      />
      
      <ConsoleDrawer 
        logs={logs} 
        isOpen={isConsoleOpen} 
        onToggle={() => setIsConsoleOpen(!isConsoleOpen)} 
        lang="zh" 
      />
    </div>
  );
};

export default App;
