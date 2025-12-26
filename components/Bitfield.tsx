
import React from 'react';

interface BitfieldProps {
  data: number[]; // 0: empty, 1: downloading, 2: completed
  status: string;
}

const Bitfield: React.FC<BitfieldProps> = ({ data, status }) => {
  return (
    <div className="flex flex-wrap gap-[1px] bg-slate-100 dark:bg-slate-800/50 p-1 rounded-md">
      {data.map((state, i) => (
        <div 
          key={i} 
          className={`w-1.5 h-1.5 rounded-[1px] transition-all duration-300 ${
            state === 2 
              ? (status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_2px_rgba(16,185,129,0.3)]' : 'bg-blue-500 shadow-[0_0_2px_rgba(59,130,246,0.3)]') 
              : state === 1
              ? 'bg-blue-400 animate-pulse'
              : 'bg-slate-200 dark:bg-slate-700/50'
          }`} 
        />
      ))}
    </div>
  );
};

export default Bitfield;
