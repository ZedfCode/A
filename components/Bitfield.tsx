
import React from 'react';

interface BitfieldProps {
  data: number[]; // 0: empty, 1: downloading, 2: completed
  status: string;
}

const Bitfield: React.FC<BitfieldProps> = ({ data, status }) => {
  return (
    <div className="flex flex-wrap gap-1 bg-black/50 p-2.5 rounded-xl border border-white/5">
      {data.map((state, i) => (
        <div 
          key={i} 
          className={`w-2.5 h-2.5 rounded-[2px] transition-all duration-700 ${
            state === 2 
              ? (status === 'COMPLETED' ? 'bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'bg-[var(--accent-main)] shadow-[0_0_8px_var(--accent-glow)]') 
              : state === 1
              ? 'bg-blue-400 animate-pulse shadow-[0_0_5px_rgba(96,165,250,0.6)] scale-105'
              : 'bg-white/[0.03]'
          }`} 
        />
      ))}
    </div>
  );
};

export default Bitfield;
