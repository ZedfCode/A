
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';

interface Option {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  desc?: string;
}

interface GeekDropdownProps {
  options: Option[];
  value: string | number;
  onChange: (value: any) => void;
  label: string;
}

const GeekDropdown: React.FC<GeekDropdownProps> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-3 ml-4">{label}</p>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-8 py-5 bg-white/[0.02] border rounded-[1.5rem] transition-all ${
          isOpen ? 'border-blue-500 bg-white/[0.05] shadow-lg shadow-blue-500/10' : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-4">
          {selectedOption?.icon}
          <span className="font-bold text-lg text-slate-200 uppercase tracking-tighter">{selectedOption?.label}</span>
        </div>
        <ICONS.ChevronDown className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 z-50 geek-dropdown-content bg-slate-900 border border-white/10 rounded-[1.8rem] shadow-2xl overflow-hidden backdrop-blur-3xl">
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full flex items-center gap-5 px-8 py-5 transition-colors text-left group ${
                  value === opt.value ? 'bg-blue-500 text-black' : 'hover:bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${value === opt.value ? 'bg-black/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  {opt.icon}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight leading-none mb-1">{opt.label}</p>
                  {opt.desc && <p className={`text-[10px] font-bold opacity-60`}>{opt.desc}</p>}
                </div>
                {value === opt.value && <div className="ml-auto w-2 h-2 rounded-full bg-black shadow-inner" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeekDropdown;
