
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
      accentColor: 'blue',
      visualEnvironment: 'monolith_dark',
      uiIntensity: 'normal',
      aiEnabledByDefault: true,
      globalMaxThreads: 1024,
      concurrentTasks: 5,
      globalSpeedLimit: 0,
      defaultSavePath: 'C:/Vault/DataStream',
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
            const speed = 1024 * 1024 * (Math.random() * 50 + 20) * (task.priority + 1.2);
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
    <div className="flex h-screen overflow-hidden selection:bg-blue-500 selection:text-white">
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

      <main className="flex-1 ml-[var(--sidebar-width)] p-20 h-full overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_40%)]">
        <div className="max-w-[1500px] mx-auto">
          <header className="flex items-end justify-between mb-24">
            <div className="animate-in fade-in slide-in-from-left duration-700">
               <div className="flex items-center gap-3 mb-5 opacity-40">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.8em] italic">Station_Command_Center</span>
               </div>
              <h2 className="text-[10rem] font-black tracking-tighter shimmer-text leading-[0.7] uppercase">
                {t(filter as any, settings.language) || t('all_tasks', settings.language)}
              </h2>
            </div>

            <div className="flex flex-col gap-8 items-end">
              <div className="flex items-center gap-6">
                <div className="glass-panel rounded-full px-10 py-5 flex items-center min-w-[500px] border-white/5 hover:border-blue-500/30 transition-all group">
                  <ICONS.Search className="w-7 h-7 text-slate-700 group-focus-within:text-blue-500 transition-colors mr-5" />
                  <input 
                    placeholder={t('search_placeholder', settings.language)} 
                    className="bg-transparent w-full outline-none font-bold text-xl text-slate-200 placeholder-slate-800"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn-tech bg-blue-600 text-white h-24 px-12 rounded-3xl font-black text-xl uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-blue-500/20"
                >
                  <ICONS.Plus className="w-8 h-8" /> {t('new_task', settings.language)}
                </button>
              </div>
              <div className="flex gap-10 px-8 text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] italic">
                  <div className="flex items-center gap-3">
                      <ICONS.Cpu className="w-4 h-4" />
                      POOL_CONCURRENCY: <span className="text-slate-300 mono-data">{(globalSpeedHistory[globalSpeedHistory.length-1] > 0 ? 1024 : 0)} THREADS</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <ICONS.Zap className="w-4 h-4" />
                      NETWORK_SECURE: <span className="text-emerald-500">ENCRYPTED</span>
                  </div>
              </div>
            </div>
          </header>

          <div className="flex items-center justify-between mb-16 px-12 py-7 glass-panel rounded-[2.5rem] border-white/5 bg-black/20">
             <div className="flex gap-8">
                <button className="flex items-center gap-4 px-10 py-4 hover:bg-emerald-500/10 text-emerald-400 rounded-2xl transition-all font-black uppercase text-sm tracking-widest border border-emerald-500/5">
                   <ICONS.Play className="w-6 h-6" /> {t('start_all', settings.language)}
                </button>
                <button className="flex items-center gap-4 px-10 py-4 hover:bg-amber-500/10 text-amber-400 rounded-2xl transition-all font-black uppercase text-sm tracking-widest border border-amber-500/5">
                   <ICONS.Pause className="w-6 h-6" /> {t('pause_all', settings.language)}
                </button>
             </div>
             <div className="flex items-center gap-8">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Order Strategy</span>
                <div className="flex bg-black p-1.5 rounded-2xl border border-white/5 gap-2">
                   {(['time', 'size', 'progress'] as const).map(s => (
                     <button 
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${sortBy === s ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-600 hover:text-slate-200'}`}
                     >
                       {t(`sort_${s}` as any, settings.language)}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid gap-12 grid-cols-1 pb-40">
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
              <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/5 rounded-[4rem] bg-black">
                <ICONS.Terminal className="w-32 h-32 mb-8" />
                <p className="font-black uppercase tracking-[1.5em] text-slate-400">System Ready: Awaiting Command Input</p>
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
