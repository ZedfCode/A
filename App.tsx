
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
      concurrentTasks: 4,
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
    document.body.className = `env-${settings.visualEnvironment}`;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('downloader_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addLog = useCallback((msg: string, level: SystemLog['level'] = 'info') => {
    setLogs(prev => [...prev.slice(-100), { id: Math.random().toString(), timestamp: Date.now(), level, message: msg }]);
  }, []);

  useEffect(() => {
    const scheduler = setInterval(() => {
      setTasks(prev => {
        let totalSpeed = 0;
        const next = prev.map(task => {
          if (task.status === DownloadStatus.DOWNLOADING) {
            const speed = 1024 * 1024 * (Math.random() * 30 + 20) * (task.priority + 1);
            totalSpeed += speed;
            const newDownloaded = task.downloaded + speed;
            const progress = Math.min(100, (newDownloaded / task.size) * 100);
            
            const bitfield = [...task.bitfield];
            const completedCount = Math.floor((progress / 100) * bitfield.length);
            for(let i=0; i<completedCount; i++) bitfield[i] = 2;

            return { 
              ...task, 
              speed, 
              progress, 
              status: progress >= 100 ? DownloadStatus.COMPLETED : task.status, 
              downloaded: newDownloaded,
              bitfield,
              threads: progress >= 100 ? 0 : Math.floor(task.maxThreads * (0.9 + Math.random() * 0.1))
            };
          }
          return task;
        });
        setGlobalSpeedHistory(h => [...h, totalSpeed].slice(-60));
        return next;
      });
    }, 1000);
    return () => clearInterval(scheduler);
  }, []);

  const handlePause = (id: string) => setTasks(p => p.map(t => t.id === id ? {...t, status: DownloadStatus.PAUSED, speed: 0} : t));
  const handleResume = (id: string) => setTasks(p => p.map(t => t.id === id ? {...t, status: DownloadStatus.DOWNLOADING} : t));
  const handleDelete = (id: string) => setTasks(p => p.filter(t => t.id !== id));

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(t => filter === 'all' || (filter === 'downloading' && t.status !== DownloadStatus.COMPLETED) || (filter === 'completed' && t.status === DownloadStatus.COMPLETED))
      .sort((a, b) => sortBy === 'time' ? b.addedAt - a.addedAt : sortBy === 'size' ? b.size - a.size : b.progress - a.progress);
  }, [tasks, searchQuery, filter, sortBy]);

  return (
    <div className="flex h-screen overflow-hidden">
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

      <main className="flex-1 ml-[360px] p-16 h-full overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[1500px] mx-auto">
          <header className="flex items-end justify-between mb-20">
            <div className="animate-in fade-in slide-in-from-left duration-1000">
              <h2 className="text-[10rem] font-black italic tracking-tighter shimmer-text leading-[0.75] uppercase opacity-90">
                {t(filter as any, settings.language) || t('all_tasks', settings.language)}
              </h2>
              <div className="flex items-center gap-6 mt-12">
                <div className="w-24 h-2 bg-[var(--accent-main)] rounded-full animate-pulse shadow-[0_0_20px_var(--accent-glow)]" />
                <p className="text-xs font-black uppercase tracking-[0.8em] text-white/40">Power Engine Status: Optimal</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="glass-panel rounded-[2.5rem] px-8 py-5 flex items-center min-w-[450px]">
                <ICONS.Search className="w-8 h-8 text-white/20 mr-4" />
                <input 
                  placeholder={t('search_placeholder', settings.language)} 
                  className="bg-transparent w-full outline-none font-black text-2xl text-white placeholder-white/5"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="juicy-button bg-[var(--accent-main)] text-black h-24 px-12 rounded-[2rem] font-black text-2xl uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-[var(--accent-glow)]"
              >
                <ICONS.Plus className="w-10 h-10" /> {t('new_task', settings.language)}
              </button>
            </div>
          </header>

          <div className="flex items-center justify-between mb-12 px-10 py-6 glass-panel rounded-[3rem]">
             <div className="flex gap-6">
                <button className="flex items-center gap-3 px-8 py-4 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl transition-all font-black uppercase text-sm tracking-widest">
                   <ICONS.Play className="w-6 h-6" /> {t('start_all', settings.language)}
                </button>
                <button className="flex items-center gap-3 px-8 py-4 hover:bg-amber-500/20 text-amber-400 rounded-2xl transition-all font-black uppercase text-sm tracking-widest">
                   <ICONS.Pause className="w-6 h-6" /> {t('pause_all', settings.language)}
                </button>
             </div>
             <div className="flex items-center gap-8">
                <span className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">{t('sort_by', settings.language)}</span>
                <div className="flex bg-black/40 rounded-2xl p-2 gap-2">
                   {(['time', 'size', 'progress'] as const).map(s => (
                     <button 
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all ${sortBy === s ? 'bg-[var(--accent-main)] text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                     >
                       {t(`sort_${s}` as any, settings.language)}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid gap-12 grid-cols-1 xl:grid-cols-2">
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
