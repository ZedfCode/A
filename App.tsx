
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import SettingsModal from './components/SettingsModal';
import ConsoleDrawer from './components/ConsoleDrawer';
import PreviewModal from './components/PreviewModal';
import { DownloadTask, DownloadStatus, AppSettings, SystemLog, VisualEnvironment } from './types';
import { ICONS } from './constants';
import { t } from './services/i18n';

const ENV_CONFIG: Record<VisualEnvironment, { main: string; glow: string; bg: string }> = {
  amber_digital: { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)', bg: '#2d1b0a' },
  ethereal_vapor: { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', bg: '#1e1b4b' },
  monolith_dark: { main: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', bg: '#0f172a' }
};

const App: React.FC = () => {
  // --- 1. 设置持久化 ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('downloader_settings');
    return saved ? JSON.parse(saved) : {
      language: 'zh',
      accentColor: 'warm',
      visualEnvironment: 'amber_digital',
      uiIntensity: 'juicy',
      aiEnabledByDefault: false,
      globalMaxThreads: 128,
      concurrentTasks: 3,
      globalSpeedLimit: 0,
      defaultSavePath: 'C:/Downloads',
      autoStart: true,
      theme: 'dark',
      notifications: true,
      clipboardMonitoring: true,
      scripts: []
    };
  });

  useEffect(() => {
    localStorage.setItem('downloader_settings', JSON.stringify(settings));
    const env = settings.visualEnvironment;
    document.body.className = `env-${env}`;
    const config = ENV_CONFIG[env];
    document.documentElement.style.setProperty('--accent-main', config.main);
    document.documentElement.style.setProperty('--accent-glow', config.glow);
    document.documentElement.style.setProperty('--bg-color', config.bg);
  }, [settings]);

  // --- 2. 任务列表持久化 ---
  const [tasks, setTasks] = useState<DownloadTask[]>(() => {
    const saved = localStorage.getItem('downloader_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('downloader_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTask, setPreviewTask] = useState<DownloadTask | null>(null);
  const [globalSpeedHistory, setGlobalSpeedHistory] = useState<number[]>(new Array(60).fill(0));

  // --- 3. 核心下载调度器 ---
  useEffect(() => {
    const scheduler = setInterval(() => {
      setTasks(prev => {
        const activeCount = prev.filter(t => [DownloadStatus.DOWNLOADING, DownloadStatus.CONNECTING].includes(t.status)).length;
        const slots = settings.concurrentTasks - activeCount;

        let totalSpeed = 0;
        const next = prev.map(task => {
          // 状态流转逻辑
          if (task.status === DownloadStatus.QUEUED && slots > 0) return { ...task, status: DownloadStatus.CONNECTING };
          if (task.status === DownloadStatus.CONNECTING) return { ...task, status: DownloadStatus.DOWNLOADING, threads: task.maxThreads };
          
          if (task.status === DownloadStatus.DOWNLOADING) {
            const speed = 1024 * 1024 * (Math.random() * 8 + 3);
            totalSpeed += speed;
            const newDownloaded = task.downloaded + speed;
            const progress = Math.min(100, (newDownloaded / task.size) * 100);
            
            // 更新 Bitfield 模拟
            const bitfield = [...task.bitfield];
            const completedChunks = Math.floor((progress / 100) * bitfield.length);
            for(let i=0; i<completedChunks; i++) bitfield[i] = 2;
            
            return { 
              ...task, 
              speed, 
              progress, 
              status: progress >= 100 ? DownloadStatus.COMPLETED : task.status, 
              downloaded: newDownloaded,
              bitfield
            };
          }
          return task;
        });
        setGlobalSpeedHistory(h => [...h, totalSpeed].slice(-60));
        return next;
      });
    }, 1000);
    return () => clearInterval(scheduler);
  }, [settings.concurrentTasks]);

  // --- 4. 任务操作处理器 ---
  const handlePause = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: DownloadStatus.PAUSED, speed: 0 } : t));
    addLog(`任务暂停: ${id}`, 'info');
  }, []);

  const handleResume = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: DownloadStatus.QUEUED } : t));
    addLog(`任务恢复: ${id}`, 'success');
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addLog(`任务已移除: ${id}`, 'warn');
  }, []);

  const addLog = (msg: string, level: SystemLog['level']) => {
    setLogs(prev => [...prev.slice(-100), { id: Math.random().toString(), timestamp: Date.now(), level, message: msg }]);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (filter === 'all') return matchesSearch;
        if (filter === 'downloading') return matchesSearch && t.status !== DownloadStatus.COMPLETED;
        if (filter === 'completed') return matchesSearch && t.status === DownloadStatus.COMPLETED;
        return matchesSearch;
      })
      .sort((a,b) => b.addedAt - a.addedAt);
  }, [tasks, searchQuery, filter]);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar 
        currentFilter={filter} setFilter={setFilter} 
        globalSpeedHistory={globalSpeedHistory}
        counts={{ 
          all: tasks.length, 
          downloading: tasks.filter(t => t.status !== DownloadStatus.COMPLETED).length, 
          completed: tasks.filter(t => t.status === DownloadStatus.COMPLETED).length, 
          trash: 0 
        }} 
        lang={settings.language} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      <main className="flex-1 ml-[320px] p-20 h-full overflow-y-auto custom-scrollbar relative bg-transparent">
        <div className="max-w-[1400px] mx-auto">
          <header className="flex items-end justify-between mb-28 pt-10">
            <div className="animate-in fade-in slide-in-from-bottom duration-1000">
              <h2 className="text-[7rem] font-black italic tracking-tighter shimmer-text leading-[0.8] uppercase">
                {t(filter as any, settings.language) || t('all_tasks', settings.language)}
              </h2>
              <div className="flex items-center gap-6 mt-10">
                <div className="w-20 h-2 bg-[var(--accent-main)] rounded-full animate-pulse shadow-[0_0_20px_var(--accent-glow)]" />
                <p className="text-sm font-black uppercase tracking-[1em] text-white/40">分布式存储架构</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="glass-panel rounded-[3rem] px-12 py-8 flex items-center min-w-[500px] shadow-2xl">
                <ICONS.Search className="w-8 h-8 text-white/20 mr-6" />
                <input 
                  placeholder={t('search_placeholder', settings.language)} 
                  className="bg-transparent w-full outline-none font-black text-2xl text-white placeholder-white/10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="juicy-button bg-[var(--accent-main)] text-black px-20 py-10 rounded-[3rem] font-black text-xl uppercase tracking-widest flex items-center gap-6 shadow-2xl shadow-[var(--accent-glow)]"
              >
                <ICONS.Plus className="w-10 h-10" /> {t('new_task', settings.language)}
              </button>
            </div>
          </header>

          <div className={`grid gap-20 ${filteredTasks.length > 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isSelected={false}
                onPause={handlePause} 
                onResume={handleResume} 
                onDelete={handleDelete} 
                onPreview={() => setPreviewTask(task)}
                lang={settings.language}
              />
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-full h-[600px] flex flex-col items-center justify-center opacity-30 border-4 border-dashed border-white/5 rounded-[8rem] bg-white/[0.02]">
                <ICONS.Zap className="w-32 h-32 mb-10 text-white/10" />
                <p className="font-black uppercase tracking-[2em] text-white/20 text-2xl">无相关任务</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ConsoleDrawer logs={logs} isOpen={isConsoleOpen} onToggle={() => setIsConsoleOpen(!isConsoleOpen)} lang={settings.language} />
      <PreviewModal task={previewTask} isOpen={!!previewTask} onClose={() => setPreviewTask(null)} lang={settings.language} />
      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={t => setTasks(p => [t, ...p])} lang={settings.language} defaultSavePath={settings.defaultSavePath} aiByDefault={settings.aiEnabledByDefault} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdate={setSettings} />
    </div>
  );
};

export default App;
