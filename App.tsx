
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import SettingsModal from './components/SettingsModal';
import ConsoleDrawer from './components/ConsoleDrawer';
import PreviewModal from './components/PreviewModal';
import { DownloadTask, DownloadStatus, AppSettings, SystemLog, Priority } from './types';
import { ICONS } from './constants';
import { t } from './services/i18n';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('downloader_settings');
    return saved ? JSON.parse(saved) : {
      language: 'zh',
      accentColor: 'warm',
      visualEnvironment: 'amber_digital',
      uiIntensity: 'juicy',
      aiEnabledByDefault: true,
      globalMaxThreads: 1024,
      concurrentTasks: 8,
      globalSpeedLimit: 0,
      defaultSavePath: 'E:/Matrix_Storage',
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

  useEffect(() => {
    const scheduler = setInterval(() => {
      setTasks(prev => {
        let totalSpeed = 0;
        const next = prev.map(task => {
          if (task.status === DownloadStatus.DOWNLOADING) {
            const speed = 1024 * 1024 * (Math.random() * 80 + 60) * (task.priority + 2);
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
              threads: progress >= 100 ? 0 : Math.floor(task.maxThreads * (0.98 + Math.random() * 0.02))
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
    <div className="flex h-screen overflow-hidden selection:bg-amber-500 selection:text-black">
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

      <main className="flex-1 ml-[var(--sidebar-width)] p-24 h-full overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[1700px] mx-auto">
          <header className="flex items-end justify-between mb-28">
            <div className="animate-in fade-in slide-in-from-left-12 duration-1000">
               <div className="flex items-center gap-5 mb-8 opacity-20">
                  <div className="w-10 h-0.5 bg-white" />
                  <span className="text-[12px] font-black uppercase tracking-[1.5em] italic">Central Matrix Command</span>
               </div>
              <h2 className="text-[13rem] font-black italic tracking-tighter shimmer-text leading-[0.65] uppercase opacity-95">
                {t(filter as any, settings.language) || t('all_tasks', settings.language)}
              </h2>
            </div>

            <div className="flex flex-col gap-10 items-end">
              <div className="flex items-center gap-6">
                <div className="glass-panel rounded-[3rem] px-12 py-7 flex items-center min-w-[600px] border-white/5 hover:border-amber-500/20 transition-all group">
                  <ICONS.Search className="w-9 h-9 text-white/10 group-focus-within:text-amber-500 transition-colors mr-6" />
                  <input 
                    placeholder={t('search_placeholder', settings.language)} 
                    className="bg-transparent w-full outline-none font-black text-3xl text-white placeholder-white/[0.03]"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="cyber-button bg-amber-500 text-black h-32 px-16 rounded-[3.5rem] font-black text-3xl uppercase tracking-tighter flex items-center gap-6 shadow-4xl shadow-amber-500/20"
                >
                  <ICONS.Plus className="w-14 h-14" /> {t('new_task', settings.language)}
                </button>
              </div>
              <div className="flex gap-12 px-6">
                  <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Concurrency</span>
                      <span className="text-2xl font-black mono-data text-white/80">1,024 Threads</span>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Engine Latency</span>
                      <span className="text-2xl font-black mono-data text-emerald-400">8.4ms</span>
                  </div>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between mb-20 px-16 py-10 glass-panel rounded-[4rem] border-white/5 bg-black/40">
             <div className="flex gap-10">
                <button className="flex items-center gap-5 px-12 py-6 hover:bg-emerald-500/20 text-emerald-400 rounded-[2rem] transition-all font-black uppercase text-xl tracking-tighter border border-emerald-500/10 cyber-button">
                   <ICONS.Play className="w-8 h-8" /> {t('start_all', settings.language)}
                </button>
                <button className="flex items-center gap-5 px-12 py-6 hover:bg-amber-500/20 text-amber-400 rounded-[2rem] transition-all font-black uppercase text-xl tracking-tighter border border-amber-500/10 cyber-button">
                   <ICONS.Pause className="w-8 h-8" /> {t('pause_all', settings.language)}
                </button>
             </div>
             <div className="flex items-center gap-12">
                <div className="flex flex-col items-end opacity-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] italic">Cluster Sort</span>
                </div>
                <div className="flex bg-black rounded-[2rem] p-3 gap-4 border border-white/5">
                   {(['time', 'size', 'progress'] as const).map(s => (
                     <button 
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-12 py-5 rounded-[1.5rem] text-sm font-black uppercase transition-all ${sortBy === s ? 'bg-amber-500 text-black shadow-3xl scale-105' : 'text-white/20 hover:text-white'}`}
                     >
                       {t(`sort_${s}` as any, settings.language)}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid gap-20 grid-cols-1 2xl:grid-cols-2 pb-60">
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
              <div className="col-span-full h-[500px] flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/5 rounded-[6rem] bg-black">
                <ICONS.Terminal className="w-40 h-40 mb-12" />
                <p className="font-black uppercase tracking-[1.5em] text-white text-xl">Command Required: Paste Tunnel Link</p>
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
