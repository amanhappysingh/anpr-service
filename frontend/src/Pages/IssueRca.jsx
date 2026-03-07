import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  History, 
  Clock, 
  Target, 
  ShieldAlert,
  FileSearch,
  CheckCircle2,
  Wrench
} from 'lucide-react';

// --- Reusable Filter Dropdown ---
const FilterDropdown = ({ label, options, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[150px] flex-1 md:flex-none" ref={dropdownRef}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 mb-1.5 ml-1">
        {label}
      </label>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border
          ${isOpen 
            ? 'bg-neutral-50 dark:bg-neutral-800 border-indigo-500/50 ring-4 ring-indigo-500/10' 
            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm'}`}
      >
        <span className="font-bold truncate">{selected}</span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { setSelected(option); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {option}
              {selected === option && <Check size={14} className="text-indigo-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Confidence Metric Card ---
const ConfidenceMetric = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 ${color}`}>
        <Icon size={20} />
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{title}</h4>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-neutral-900 dark:text-white">{value}</span>
      <span className="text-xs font-bold text-neutral-400">{sub}</span>
    </div>
    {/* Minimalist Progress Bar */}
    <div className="mt-4 h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
      <div className={`h-full bg-current ${color}`} style={{ width: value.includes('%') ? value : '75%' }}></div>
    </div>
  </div>
);

const IssueRca = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-8 py-10 md:px-14 lg:px-24 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header */}
        <header className="mb-14 flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-500/20">
                <ShieldAlert size={28} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
                RCA & Rollback
              </h1>
            </div>
            <p className="text-neutral-500 dark:text-neutral-500 font-medium text-sm">
              Tracking issue #SEC-1092 for <span className="text-neutral-900 dark:text-white font-bold underline decoration-rose-500">Site Xxxxx_1A</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
             <FilterDropdown label="Market" options={['National', 'East', 'West']} defaultValue="National" />
             <div className="hidden md:block w-px h-8 bg-neutral-100 dark:bg-neutral-800 mx-1"></div>
             <FilterDropdown label="OEM" options={['All', 'Nokia', 'Ericsson']} defaultValue="All" />
             <div className="hidden md:block w-px h-8 bg-neutral-100 dark:bg-neutral-800 mx-1"></div>
             <FilterDropdown label="Site Search" options={['Xxxxx_1A', 'Xxxxx_1B']} defaultValue="Xxxxx_1A" />
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Issue Tracking (Status Board) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <FileSearch size={18} className="text-indigo-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
                Active Issue Tracking
              </h2>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 p-10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Issue Identifier</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">#SEC-1092-2024</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Incident Category</p>
                  <div className="flex gap-2 mt-1">
                    {['Routing', 'MTU'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-[10px] font-black text-neutral-600 dark:text-neutral-400 uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Impacted Scope</p>
                  <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200">12 Connected Sites</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">RCA Status</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 size={16} /> Root Cause Identified
                  </div>
                </div>

                <div className="md:col-span-2 p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg"><Wrench size={16}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Fix Applied</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                        Updated MTU clamping to 1350 on SeGW-01 interfaces and refreshed IPsec security associations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between py-4 px-6 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                   <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400 font-bold">
                      <RotateCcw size={18} />
                      Rollback Executed?
                   </div>
                   <span className="bg-rose-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Yes - Success
                   </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Rollback Confidence Gauges */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <History size={18} className="text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500">
                Rollback Confidence View
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ConfidenceMetric 
                title="Rollback Success Rate" 
                value="98.4%" 
                sub="Avg. last 30 days" 
                icon={Target}
                color="text-emerald-500"
              />
              <ConfidenceMetric 
                title="Avg Rollback Time" 
                value="12.5" 
                sub="Minutes" 
                icon={Clock}
                color="text-indigo-500"
              />
              <ConfidenceMetric 
                title="Restored Within SLA" 
                value="95%" 
                sub="Compliance Goal" 
                icon={CheckCircle2}
                color="text-amber-500"
              />
            </div>
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-400 text-xs font-medium italic text-center md:text-left">
            Rollback logs are archived for 90 days. Continuous monitoring active for Site Xxxxx_1A.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
              Download RCA Report
            </button>
            <button className="px-6 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              Re-Run Health Check
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IssueRca;