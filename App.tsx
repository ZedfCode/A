
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import SettingsModal from './components/SettingsModal';
import ConsoleDrawer from './components/ConsoleDrawer';
import PreviewModal from './components/PreviewModal';
import { DownloadTask, DownloadStatus, AppSettings, SystemLog, AccentColor, VisualEnvironment } from './types';
import { ICONS } from './constants';
import { t } from './services/i18n';

const ENV_CONFIG: Record<VisualEnvironment, { main: string; glow: string; bg: string }> = {
  amber_digital: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', bg: '#1a0f02' },
  ethereal_vapor: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)', bg: '#0b1121' },
  monolith_dark: { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', bg: '#020617' }
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

  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTask, setPreviewTask] = useState<DownloadTask | null>(null);
  const [globalSpeedHistory, setGlobalSpeedHistory] = useState<number[]>(new Array(60).fill(0));

  useEffect(() => {
    const env = settings.visualEnvironment;
    document.body.className = `env-${env}`;
    const config = ENV_CONFIG[env];
    document.documentElement.style.setProperty('--accent-main', config.main);
    document.documentElement.style.setProperty('--accent-glow', config.glow);
    document.documentElement.style.setProperty('--bg-color', config.bg);
  }, [settings.visualEnvironment]);

  const addLog = useCallback((message: string, level: SystemLog['level'] = 'info', taskId?: string) => {
    setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), level, message, taskId }, ...prev].slice(0, 100));
  }, []);

  // 模拟下载核心逻辑（省略，保持之前逻辑）
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
            const speed = 1024 * 1024 * (Math.random() * 8 + 3);
            totalSpeed += speed;
            const progress = Math.min(100, task.progress + (speed / task.size) * 100);
            return { ...task, speed, progress, status: progress >= 100 ? DownloadStatus.COMPLETED : task.status, downloaded: task.downloaded + speed };
          }
          return task;
        });
        setGlobalSpeedHistory(h => [...h, totalSpeed].slice(-60));
        return next;
      });
    }, 1000);
    return () => clearInterval(scheduler);
  }, [settings.concurrentTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a,b) => b.addedAt - a.addedAt);
  }, [tasks, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 黄金比例侧边栏 280px */}
      <Sidebar 
        currentFilter={filter} setFilter={setFilter} 
        globalSpeedHistory={globalSpeedHistory}
        counts={{ all: tasks.length, downloading: tasks.filter(t => t.status !== DownloadStatus.COMPLETED).length, completed: tasks.filter(t => t.status === DownloadStatus.COMPLETED).length, trash: 0 }} 
        lang={settings.language} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      {/* 主视口，通过 ml 留出侧边栏宽度 */}
      <main className="flex-1 ml-[280px] p-10 h-full overflow-y-auto custom-scrollbar relative">
        <header className="flex items-end justify-between mb-16 pt-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-6xl font-black italic tracking-tighter shimmer-text leading-tight uppercase">
              {t(filter as any, settings.language) || t('all_tasks', settings.language)}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mt-2">Professional Grid Infrastructure</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="glass-panel rounded-2xl px-6 py-4 flex items-center min-w-[360px] border-white/5">
              <ICONS.Search className="w-4 h-4 text-white/40 mr-4" />
              <input 
                placeholder={t('search_placeholder', settings.language)} 
                className="bg-transparent w-full outline-none font-bold text-sm text-white placeholder-white/20"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="juicy-button bg-[var(--accent-main)] text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-[var(--accent-glow)]"
            >
              <ICONS.Plus className="w-5 h-5" /> {t('new_task', settings.language)}
            </button>
          </div>
        </header>

        <div className={`grid gap-8 ${filteredTasks.length > 2 ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} task={task} 
              isSelected={false}
              onPause={() => {}} onResume={() => {}} onDelete={() => {}} onPreview={() => setPreviewTask(task)}
              lang={settings.language}
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="col-span-full h-96 flex flex-col items-center justify-center opacity-20 border border-white/5 rounded-[4rem] bg-white/5 backdrop-blur-sm">
              <ICONS.Zap className="w-20 h-20 mb-6 text-white/20" />
              <p className="font-black uppercase tracking-[0.8em] text-white/40 text-sm">NO DATA DETECTED</p>
            </div>
          )}
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
