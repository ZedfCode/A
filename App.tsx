
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

  const startSmartDownload = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const handle = fileHandles.current.get(taskId);
    if (!task || !handle) {
      addLog(`[Error] 任务 ${taskId} 无法启动：缺少文件句柄。`, 'error');
      return;
    }

    addLog(`[Connect] 正在请求资源: ${task.name}...`);
    
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: DownloadStatus.CONNECTING } : t));

      let size = 0;
      let acceptRanges = false;

      // 1. 尝试探测服务器支持情况
      try {
        const headRes = await fetch(task.url, { method: 'HEAD', mode: 'cors' });
        size = parseInt(headRes.headers.get('content-length') || '0');
        acceptRanges = headRes.headers.get('accept-ranges') === 'bytes';
      } catch (e) {
        addLog(`[Warn] HEAD 探测失败 (可能是 CORS 限制)，回退至 GET 探测。`, 'warn');
        const probeRes = await fetch(task.url, { method: 'GET', mode: 'cors' }); // 最小化请求可在此处优化，但为兼容性先 GET
        size = parseInt(probeRes.headers.get('content-length') || '0');
        acceptRanges = probeRes.headers.get('accept-ranges') === 'bytes';
      }

      setTasks(prev => prev.map(t => t.id === taskId ? { 
        ...t, 
        size, 
        isRangeSupported: acceptRanges,
        status: DownloadStatus.DOWNLOADING 
      } : t));

      const writable = await handle.createWritable();
      const controllers: AbortController[] = [];
      const threadCount = acceptRanges && size > 1024 * 1024 ? 4 : 1; 

      addLog(`[Init] 分配 ${threadCount} 个传输线程。分片下载: ${acceptRanges ? '开启' : '关闭'}`);

      if (acceptRanges && size > 0 && threadCount > 1) {
        const chunkSize = Math.ceil(size / threadCount);
        const promises = Array.from({ length: threadCount }).map(async (_, i) => {
          const start = i * chunkSize;
          const end = i === threadCount - 1 ? size - 1 : (i + 1) * chunkSize - 1;
          
          const controller = new AbortController();
          controllers.push(controller);

          try {
            const res = await fetch(task.url, {
              headers: { 'Range': `bytes=${start}-${end}` },
              signal: controller.signal
            });

            if (!res.body) throw new Error(`线程 ${i} 响应为空`);
            const reader = res.body.getReader();
            let pos = start;

            while(true) {
              const { done, value } = await reader.read();
              if (done) break;
              await writable.write({ type: 'write', data: value, position: pos });
              pos += value.length;
              
              // 更新全局下载量
              setTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                  const newDownloaded = t.downloaded + value.length;
                  const speed = value.length / 0.1; // 粗略估算，此处可优化
                  return { ...t, downloaded: newDownloaded, progress: (newDownloaded / size) * 100, speed };
                }
                return t;
              }));
            }
          } catch (e: any) {
            addLog(`[Error] 线程 ${i} 异常: ${e.message}`, 'error');
            throw e;
          }
        });

        abortControllers.current.set(taskId, controllers);
        await Promise.all(promises);
      } else {
        // 单线程下载逻辑
        addLog(`[Info] 使用单线程流式传输...`);
        const res = await fetch(task.url);
        if (!res.body) throw new Error("服务器未返回数据流");
        
        const reader = res.body.getReader();
        let downloaded = 0;
        while(true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writable.write(value);
          downloaded += value.length;
          setTasks(prev => prev.map(t => t.id === taskId ? { 
            ...t, 
            downloaded, 
            progress: size > 0 ? (downloaded / size) * 100 : 0,
            speed: value.length * 10 // 简易速度计算
          } : t));
        }
      }

      await writable.close();
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: DownloadStatus.COMPLETED, progress: 100, speed: 0 } : t));
      addLog(`[Success] 任务完成: ${task.name}`, 'success');

    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      addLog(`[Error] 下载终止: ${isAbort ? '用户暂停' : err.message}`, isAbort ? 'warn' : 'error');
      setTasks(prev => prev.map(t => t.id === taskId ? { 
        ...t, 
        status: isAbort ? DownloadStatus.PAUSED : DownloadStatus.ERROR,
        speed: 0 
      } : t));
    } finally {
      delete abortControllers.current[taskId];
    }
  };

  const handlePause = (id: string) => {
    abortControllers.current.get(id)?.forEach(c => c.abort());
    addLog(`[Action] 用户挂起了任务: ${id}`, 'warn');
  };

  const handleAddTask = (task: DownloadTask) => {
    if (task.fileHandle) {
      fileHandles.current.set(task.id, task.fileHandle);
    }
    setTasks(prev => [task, ...prev]);
    addLog(`[Action] 新建下载任务: ${task.name}`);
    // 异步启动，防止阻塞 UI
    setTimeout(() => startSmartDownload(task.id), 100);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f3f3]">
      <header className="px-4 py-2 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#0078d4] rounded-sm flex items-center justify-center">
             <ICONS.Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[12px] text-gray-600 font-bold uppercase tracking-tight">智速引擎 (Industrial Core)</span>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setIsConsoleOpen(!isConsoleOpen)} className={`text-[11px] px-2 py-1 rounded transition-colors ${isConsoleOpen ? 'bg-blue-600 text-white' : 'text-[#0078d4] hover:bg-blue-50'}`}>内核日志</button>
           <div className="flex gap-1.5 ml-2">
             <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
             <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
             <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
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
             <ICONS.Search className="w-16 h-16 opacity-5 mb-4" />
             <p className="text-sm font-medium opacity-40">等待建立数据隧道</p>
          </div>
        )}
      </main>

      <footer className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex gap-3">
           <button onClick={() => setIsModalOpen(true)} className="btn-fluent primary px-8">新建下载</button>
           <button onClick={() => { setTasks([]); addLog('已重置任务矩阵'); }} className="btn-fluent">清空列表</button>
        </div>
        <div className="flex items-center gap-6 text-[10px] text-gray-400 font-mono font-bold">
           <span>IO_STATUS: <span className="text-green-600 uppercase">Streaming</span></span>
           <span>HANDLES: {tasks.length}</span>
           <span>ENGINE_ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
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
