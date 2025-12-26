
import React, { useEffect, useRef } from 'react';
import { SystemLog, Language } from '../types';

interface ConsoleDrawerProps {
  logs: SystemLog[];
  isOpen: boolean;
  onToggle: () => void;
  lang: Language;
}

const ConsoleDrawer: React.FC<ConsoleDrawerProps> = ({ logs, isOpen }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 h-48 bg-[#1e1e1e] text-gray-300 font-mono text-[11px] border-t border-gray-800 z-20 overflow-hidden flex flex-col">
      <div className="px-4 py-1 bg-[#2d2d2d] border-b border-gray-800 flex justify-between items-center">
        <span className="uppercase tracking-widest text-gray-500">Kernel Engine Logs</span>
        <span className="text-gray-600">{logs.length} entries</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {logs.map(log => (
          <div key={log.id} className="flex gap-3">
            <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={
              log.level === 'error' ? 'text-red-500' : 
              log.level === 'success' ? 'text-green-500' : 
              log.level === 'warn' ? 'text-yellow-500' : 'text-blue-400'
            }>
              {log.level.toUpperCase()}
            </span>
            <span className="text-gray-400 italic">{" >> "}</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsoleDrawer;
