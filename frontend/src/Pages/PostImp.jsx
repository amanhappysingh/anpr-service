import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Check, 
  BarChart4, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  LayoutDashboard,
  Zap,
  Layers,
  Search,
  Target
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

const AnalysisCard = ({ title, desc, icon: Icon }) => (
  <div className="group p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 cursor-pointer">
    <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
      <Icon size={24} />
    </div>
    <div>
      <h4 className="font-bold text-neutral-900 dark:text-white text-base">{title}</h4>
      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 font-medium">{desc}</p>
    </div>
    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowUpRight size={20} className="text-indigo-500" />
    </div>
  </div>
);

const PostImp = () => {
  // Sample Data: Ismein maine kuch values kharab (Degraded) bhi rakhi hain check karne ke liye
  const kpiData = [
    { cat: 'Accessibility', kpi: 'CSSR', uom: '%', pre: '98.2', post: '99.5' },
    { cat: 'Retainability', kpi: 'DCR', uom: '%', pre: '0.45', post: '0.80' }, // Kharab (DCR barh gaya)
    { cat: 'Mobility', kpi: 'HOSR', uom: '%', pre: '97.1', post: '98.8' },
    { cat: 'Throughput', kpi: 'User DL', uom: 'Mbps', pre: '42.0', post: '35.0' }, // Kharab (Speed kam ho gayi)
    { cat: 'Latency', kpi: 'User Plane', uom: 'ms', pre: '22', post: '14' },
  ];

  // Helper function to determine if the change is an improvement
  const checkImprovement = (category, pre, post) => {
    const preVal = parseFloat(pre);
    const postVal = parseFloat(post);

    // Retainability (DCR) aur Latency mein 'Kam' value behtar hoti hai
    if (category === 'Retainability' || category === 'Latency') {
      return postVal < preVal; 
    }
    // Baaqi sab mein 'Zyada' value behtar hoti hai
    return postVal > preVal;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-6 py-10 md:px-12 lg:px-20 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header */}
        <header className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20">
                <BarChart4 size={28} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white uppercase">
                Post-Imp Validation
              </h1>
            </div>
            <p className="text-neutral-500 dark:text-neutral-500 font-medium text-sm ml-1">
              Analyzing KPI deltas for <span className="text-neutral-900 dark:text-white font-bold">Site ID: Xxxxx_1A</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
             <FilterDropdown label="Market" options={['National', 'North', 'South']} defaultValue="National" />
             <div className="hidden md:block w-px h-8 bg-neutral-100 dark:bg-neutral-800 mx-1"></div>
             <FilterDropdown label="OEM" options={['All', 'Nokia', 'Ericsson']} defaultValue="All" />
             <div className="hidden md:block w-px h-8 bg-neutral-100 dark:bg-neutral-800 mx-1"></div>
             <FilterDropdown label="Site Search" options={['Xxxxx_1A', 'Xxxxx_1B']} defaultValue="Xxxxx_1A" />
          </div>
        </header>

        {/* KPI Table Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden mb-12">
          <div className="p-8 border-b border-neutral-50 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/30 dark:bg-neutral-800/20">
             <div className="flex items-center gap-3">
                <Activity size={20} className="text-indigo-500" />
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Metric Comparison</h3>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-black tracking-[0.25em] border-b border-neutral-50 dark:border-neutral-800">
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6">KPIs</th>
                  <th className="px-10 py-6">UOM</th>
                  <th className="px-10 py-6">Pre-Imp</th>
                  <th className="px-10 py-6">Post-Imp</th>
                  <th className="px-10 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {kpiData.map((row, i) => {
                  const isImproved = checkImprovement(row.cat, row.pre, row.post);
                  
                  return (
                    <tr key={i} className="group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-10 py-6 font-bold text-neutral-700 dark:text-neutral-300 text-sm">{row.cat}</td>
                      <td className="px-10 py-6">
                        <span className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">
                          {row.kpi}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-xs text-neutral-400 font-medium">{row.uom}</td>
                      <td className="px-10 py-6 font-mono text-neutral-400 dark:text-neutral-600">{row.pre}</td>
                      <td className="px-10 py-6 font-mono font-black text-neutral-800 dark:text-white">{row.post}</td>
                      <td className="px-10 py-6 text-right">
                        {isImproved ? (
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl font-bold text-xs">
                            <ArrowUpRight size={14} />
                            Improved
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl font-bold text-xs">
                            <ArrowDownRight size={14} />
                            Degraded
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalysisCard title="KPI Delta View" desc="Pre vs Post comparison 5-day window." icon={LayoutDashboard} />
          <AnalysisCard title="Degradation Alerts" desc="Triggers for KPI drops > 10%." icon={Target} />
          <AnalysisCard title="Market Heatmap" desc="Geographical performance distribution." icon={Layers} />
          <AnalysisCard title="Site Drilldown" desc="Granular level logs and raw trace." icon={Search} />
        </div>
      </div>
    </div>
  );
};

export default PostImp;