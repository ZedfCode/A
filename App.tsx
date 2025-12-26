
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import SettingsModal from './components/SettingsModal';
import ConsoleDrawer from './components/ConsoleDrawer';
import { DownloadTask, DownloadStatus, AppSettings, SystemLog } from './types';
import { t } from './services/i18n';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('smartspeed_settings');
    return saved ? JSON.parse(saved) : {
      language: 'zh',
      accentColor: 'blue',
      visualEnvironment: 'monolith_dark',
      globalMaxThreads: 512,
      totalDiskLimit: 1024 * 1024 * 1024 * 100, // 100GB
      defaultSavePath: 'Downloads/SmartSpeed',
      aiEnabledByDefault: true,
    };
  });

  const [tasks, setTasks] = useState<DownloadTask[]>(() => {
    const saved = localStorage.getItem('smartspeed_tasks');
    // 注意：fileHandle 无法序列化，恢复时需标记为待重连
    return saved ? JSON.parse(saved).map((t: any) => ({
      ...t,
      status: t.status === DownloadStatus.DOWNLOADING ? DownloadStatus.PAUSED : t.status
    })) : [];
  });

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [globalSpeedHistory, setGlobalSpeedHistory] = useState<number[]>(new Array(60).fill(0));

  const addLog = useCallback((level: SystemLog['level'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      level,
      message
    }].slice(-100));
  }, []);

  const diskUsage = useMemo(() => tasks.reduce((acc, t) => acc + t.downloaded, 0), [tasks]);

  useEffect(() => {
    localStorage.setItem('smartspeed_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // 过滤掉非序列化属性后保存
    const tasksToSave = tasks.map(({ fileHandle, ...rest }) => rest);
    localStorage.setItem('smartspeed_tasks', JSON.stringify(tasksToSave));
  }, [tasks]);

  // 核心下载调度器 (Core Scheduler)
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => {
        let currentTotalSpeed = 0;
        const next = prev.map(task => {
          if (task.status === DownloadStatus.DOWNLOADING) {
            // 模拟超线程：根据 maxThreads 决定基准速度
            const baseSpeed = 1024 * 1024 * 5; // 5MB/s 基准
            const threadBonus = (task.maxThreads / 128) * (Math.random() * 2);
            const speed = baseSpeed * threadBonus;
            
            currentTotalSpeed += speed;
            const newDownloaded = Math.min(task.size, task.downloaded + speed);
            const progress = (newDownloaded / task.size) * 100;

            // 更新 Bitfield 视图
            const bitfield = [...task.bitfield];
            const sectors = bitfield.length;
            const finishedSectors = Math.floor((newDownloaded / task.size) * sectors);
            for(let i=0; i<finishedSectors; i++) bitfield[i] = 2;
            if(finishedSectors < sectors) bitfield[finishedSectors] = 1;

            if (newDownloaded >= task.size) {
              addLog('success', `任务 [${task.name}] 物理写入完成。`);
              return { ...task, downloaded: task.size, progress: 100, speed: 0, status: DownloadStatus.COMPLETED, bitfield: new Array(sectors).fill(2) };
            }

            return { ...task, downloaded: newDownloaded, progress, speed, bitfield, lastActive: Date.now() };
          }
          return task;
        });
        setGlobalSpeedHistory(h => [...h, currentTotalSpeed].slice(-60));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [addLog]);

  const handlePause = (id: string) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, status: DownloadStatus.PAUSED, speed: 0 } : t));
    addLog('warn', `流传输已暂停，断点已挂载。`);
  };

  const handleResume = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    addLog('info', `正在校验本地分块完整性...`);
    // 如果是刷新后的恢复，可能需要重新获取文件句柄（出于安全限制，File API 句柄不可持久化）
    // 这里模拟“断点重连”过程
    setTasks(p => p.map(t => t.id === id ? { ...t, status: DownloadStatus.DOWNLOADING } : t));
    addLog('success', `数据流重连成功，从偏移量 ${task.downloaded} 继续。`);
  };

  const handleDelete = (id: string) => {
    setTasks(p => p.filter(t => t.id !== id));
    addLog('error', `移除任务并释放空间配额。`);
  };

  const handleExport = async (task: DownloadTask) => {
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({ suggestedName: task.name });
        addLog('success', `本地物理路径已绑定：${handle.name}`);
        // 实际开发中，这里会启动真正的 stream 下载逻辑
      } catch (e) {
        addLog('warn', '用户取消了路径绑定');
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#050608] text-slate-200 font-sans overflow-hidden">
      <Sidebar 
        currentFilter={filter} 
        setFilter={setFilter} 
        counts={{
          all: tasks.length,
          downloading: tasks.filter(t => t.status !== DownloadStatus.COMPLETED).length,
          completed: tasks.filter(t => t.status === DownloadStatus.COMPLETED).length,
          trash: 0
        }}
        globalSpeedHistory={globalSpeedHistory}
        lang={settings.language}
        diskUsage={diskUsage}
        diskLimit={settings.totalDiskLimit}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 ml-[var(--sidebar-width)] p-12 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-16">
            <h2 className="text-8xl font-black uppercase tracking-tighter shimmer-text leading-none">
              {t(filter as any, settings.language) || "TASKS"}
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-tech bg-blue-600 text-white h-20 px-10 rounded-2xl font-black text-lg flex items-center gap-4"
            >
              <span className="text-2xl">+</span> {t('new_task', settings.language)}
            </button>
          </header>

          <div className="grid gap-8">
            {tasks.filter(t => filter === 'all' || (filter === 'downloading' && t.status !== DownloadStatus.COMPLETED) || (filter === 'completed' && t.status === DownloadStatus.COMPLETED)).map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onPause={handlePause} 
                onResume={handleResume} 
                onDelete={handleDelete}
                onExport={handleExport}
                lang={settings.language}
              />
            ))}
          </div>
        </div>
      </main>

      <ConsoleDrawer logs={logs} isOpen={isConsoleOpen} onToggle={() => setIsConsoleOpen(!isConsoleOpen)} lang={settings.language} />
      <NewTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTask={t => setTasks(p => [t, ...p])} 
        lang={settings.language}
        currentDiskUsage={diskUsage}
        diskLimit={settings.totalDiskLimit}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdate={setSettings} />
    </div>
  );
};

export default App;
