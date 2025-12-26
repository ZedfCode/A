
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import SettingsModal from './components/SettingsModal';
import ConsoleDrawer from './components/ConsoleDrawer';
import PreviewModal from './components/PreviewModal';
import { DownloadTask, DownloadStatus, AppSettings, SystemLog, VisualEnvironment, Priority } from './types';
import { ICONS, APP_NAME } from './constants';
import { t } from './services/i18n';

const ENV_CONFIG: Record<VisualEnvironment, { main: string; glow: string; bg: string }> = {
  amber_digital: { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)', bg: '#2d1b0a' },
  ethereal_vapor: { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', bg: '#1e1b4b' },
  monolith_dark: { main: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', bg: '#0f172a' }
};

const App: React.FC = () => {
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

  const [tasks, setTasks] = useState<DownloadTask[]>(() => {
    const saved = localStorage.getItem('downloader_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'size' | 'progress'>('time');
  const [previewTask, setPreviewTask] = useState<DownloadTask | null>(null);
  const [globalSpeedHistory, setGlobalSpeedHistory] = useState<number[]>(new Array(60).fill(0));

  useEffect(() => {
    localStorage.setItem('downloader_settings', JSON.stringify(settings));
    const env = settings.visualEnvironment;
    document.body.className = `env-${env}`;
    const config = ENV_CONFIG[env];
    document.documentElement.style.setProperty('--accent-main', config.main);
    document.documentElement.style.setProperty('--accent-glow', config.glow);
    document.documentElement.style.setProperty('--bg-color', config.bg);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('downloader_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const scheduler = setInterval(() => {
      setTasks(prev => {
        const activeCount = prev.filter(t => [DownloadStatus.DOWNLOADING, DownloadStatus.CONNECTING].includes(t.status)).length;
        const slots = settings.concurrentTasks - activeCount;

        let totalSpeed = 0;
        const next = prev.map(task => {
          if (task.status === DownloadStatus.QUEUED && slots > 0) return { ...task, status: DownloadStatus.CONNECTING };
          if (task.status === DownloadStatus.CONNECTING) return { ...task, status: DownloadStatus.DOWNLOADING, threads: task.maxThreads };
          
          if (task.status === DownloadStatus.DOWNLOADING) {
            const speed = 1024 * 1024 * (Math.random() * 15 + 5); // 提升模拟速度
            totalSpeed += speed;
            const newDownloaded = task.downloaded + speed;
            const progress = Math.min(100, (newDownloaded / task.size) * 100);
            
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

  const addLog = useCallback((msg: string, level: SystemLog['level'] = 'info') => {
    setLogs(prev => [...prev.slice(-100), { id: Math.random().toString(), timestamp: Date.now(), level, message: msg }]);
  }, []);

  const handlePause = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: DownloadStatus.PAUSED, speed: 0 } : t));
    addLog(`任务挂起: ${id}`, 'info');
  }, [addLog]);

  const handleResume = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: DownloadStatus.QUEUED } : t));
    addLog(`任务恢复: ${id}`, 'success');
  }, [addLog]);

  const handleDelete = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addLog(`任务移除: ${id}`, 'warn');
  }, [addLog]);

  const handleStartAll = () => {
    setTasks(p => p.map(t => t.status === DownloadStatus.PAUSED ? { ...t, status: DownloadStatus.QUEUED } : t));
    addLog("全部任务已加入调度序列", 'success');
  };

  const handlePauseAll = () => {
    setTasks(p => p.map(t => (t.status === DownloadStatus.DOWNLOADING || t.status === DownloadStatus.QUEUED) ? { ...t, status: DownloadStatus.PAUSED, speed: 0 } : t));
    addLog("所有活跃任务已挂起", 'warn');
  };

  const handleClearFinished = () => {
    setTasks(p => p.filter(t => t.status !== DownloadStatus.COMPLETED));
    addLog("清理已完成任务存档", 'info');
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (filter === 'all') return matchesSearch;
      if (filter === 'downloading') return matchesSearch && t.status !== DownloadStatus.COMPLETED;
      if (filter === 'completed') return matchesSearch && t.status === DownloadStatus.COMPLETED;
      return matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'time') return b.addedAt - a.addedAt;
      if (sortBy === 'size') return b.size - a.size;
      if (sortBy === 'progress') return b.progress - a.progress;
      return 0;
    });
  }, [tasks, searchQuery, filter, sortBy]);

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

      <main className="flex-1 ml-[320px] p-16 h-full overflow-y-auto custom-scrollbar relative bg-transparent">
        <div className="max-w-[1500px] mx-auto">
          <header className="flex items-end justify-between mb-20 pt-10">
            <div className="animate-in fade-in slide-in-from-bottom duration-1000">
              <h2 className="text-[7rem] font-black italic tracking-tighter shimmer-text leading-[0.8] uppercase">
                {t(filter as any, settings.language) || t('all_tasks', settings.language)}
              </h2>
              <div className="flex items-center gap-6 mt-10">
                <div className="w-20 h-2 bg-[var(--accent-main)] rounded-full animate-pulse shadow-[0_0_20px_var(--accent-glow)]" />
                <p className="text-sm font-black uppercase tracking-[1em] text-white/40">{APP_NAME} KERNEL v2.5</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="glass-panel rounded-[3rem] px-10 py-6 flex items-center min-w-[450px] shadow-2xl">
                <ICONS.Search className="w-8 h-8 text-white/20 mr-4" />
                <input 
                  placeholder={t('search_placeholder', settings.language)} 
                  className="bg-transparent w-full outline-none font-black text-2xl text-white placeholder-white/10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="juicy-button bg-[var(--accent-main)] text-black h-24 px-12 rounded-[2.5rem] font-black text-xl uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-[var(--accent-glow)]"
              >
                <ICONS.Plus className="w-8 h-8" /> {t('new_task', settings.language)}
              </button>
            </div>
          </header>

          {/* 全局操作工具栏 */}
          <div className="flex items-center justify-between mb-12 px-8 py-6 glass-panel rounded-[3rem] border border-white/5">
             <div className="flex gap-6">
                <button onClick={handleStartAll} className="flex items-center gap-3 px-6 py-4 hover:bg-emerald-500/10 text-emerald-500 rounded-2xl transition-all font-black uppercase text-sm tracking-widest">
                   <ICONS.Play className="w-6 h-6" /> {t('start_all', settings.language)}
                </button>
                <button onClick={handlePauseAll} className="flex items-center gap-3 px-6 py-4 hover:bg-amber-500/10 text-amber-500 rounded-2xl transition-all font-black uppercase text-sm tracking-widest">
                   <ICONS.Pause className="w-6 h-6" /> {t('pause_all', settings.language)}
                </button>
                <button onClick={handleClearFinished} className="flex items-center gap-3 px-6 py-4 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all font-black uppercase text-sm tracking-widest">
                   <ICONS.Trash className="w-6 h-6" /> {t('clear_finished', settings.language)}
                </button>
             </div>
             <div className="flex items-center gap-8">
                <span className="text-xs font-black text-white/30 uppercase tracking-widest">{t('sort_by', settings.language)}</span>
                <div className="flex bg-black/40 rounded-2xl p-2 gap-2">
                   {(['time', 'size', 'progress'] as const).map(s => (
                     <button 
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${sortBy === s ? 'bg-[var(--accent-main)] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                     >
                       {t(`sort_${s}` as any, settings.language)}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className={`grid gap-16 ${filteredTasks.length > 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
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
              <div className="col-span-full h-[500px] flex flex-col items-center justify-center opacity-30 border-4 border-dashed border-white/5 rounded-[8rem] bg-white/[0.02]">
                <ICONS.Zap className="w-32 h-32 mb-10 text-white/10" />
                <p className="font-black uppercase tracking-[2em] text-white/20 text-2xl">阵列就绪</p>
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
