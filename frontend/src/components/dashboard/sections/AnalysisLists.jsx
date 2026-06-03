import React, { useState } from 'react';
import { Copy, Check, Server, Activity, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export const ErrorList = ({ errors, onCopy, isDateView }) => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (msg, idx) => {
        onCopy(msg, idx);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!errors || errors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 gap-2 transition-colors">
                <CheckCircle size={32} />
                <p>Clean state: No errors detected {isDateView ? 'on this date' : 'in this period'}.</p>
            </div>
        );
    }

    const maxCount = errors[0]?.count || 1;

    return (
        <div className="space-y-2">
            {errors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg group hover:border-red-300 dark:hover:border-red-500/30 transition-all shadow-sm dark:shadow-none">
                    <div className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                             <p className="text-xs text-slate-800 dark:text-slate-300 font-mono break-all line-clamp-2 pr-6 leading-relaxed transition-colors" title={err.msg}>{err.msg}</p>
                             <button onClick={() => handleCopy(err.msg, idx)} className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors">
                                {copiedIndex === idx ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                             </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                                <div className="h-full bg-red-500" style={{ width: `${(err.count / maxCount) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 min-w-[30px] text-right transition-colors">{err.count.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const HostGrid = ({ hosts, selectedHost, onSelect }) => {
    // Helper to sort: Active first, then by Name
    const sortedHosts = [...(hosts || [])].sort((a, b) => {
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ALL HOSTS OPTION */}
            <div 
                onClick={() => onSelect("ALL")}
                className={`p-4 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${selectedHost === "ALL" ? 'bg-blue-50 dark:bg-[#005686]/20 border-[#005686] ring-1 ring-[#005686]/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm dark:shadow-none'}`}
            >
                <div className={`p-2 rounded-full transition-colors ${selectedHost === "ALL" ? 'bg-[#005686]/20 dark:bg-[#005686]/30 text-[#005686] dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <Activity size={20} />
                </div>
                <div>
                    <span className={`block font-bold text-sm transition-colors ${selectedHost === "ALL" ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>ALL HOSTS</span>
                    <span className="text-xs text-slate-500">Global View</span>
                </div>
            </div>

            {/* INDIVIDUAL HOSTS */}
            {sortedHosts.map((host, idx) => {
                const isSelected = selectedHost === host.name;
                const isActive = host.status === 'Active';

                return (
                    <div 
                        key={idx} 
                        onClick={() => onSelect(host.name)}
                        className={`p-4 border rounded-lg flex items-center gap-3 cursor-pointer transition-all relative overflow-hidden shadow-sm dark:shadow-none
                            ${isSelected 
                                ? 'bg-blue-50 dark:bg-[#005686]/20 border-[#005686] ring-1 ring-[#005686]/50' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        {/* Status Indicator Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>

                        <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'}`}>
                            <Server size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <span className={`block font-mono text-sm font-bold truncate transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {host.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {isActive ? <Wifi size={10} className="text-emerald-500"/> : <WifiOff size={10} className="text-slate-400 dark:text-slate-500"/>}
                                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {host.status}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const TraceSteps = ({ steps }) => (
    <div className="relative pl-2">
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700/50 transition-colors"></div>
        <div className="space-y-6">
        {steps.map((step) => (
            <div key={step.id} className="relative pl-10 group">
                <div className="absolute left-[13px] top-5 w-3 h-3 rounded-full border-[3px] border-white dark:border-[#0f172a] bg-[#005686] z-10 shadow-sm group-hover:scale-125 transition-transform"></div>
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-[#005686]/50 dark:hover:border-[#005686]/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-[#005686]/20 text-[#005686] dark:text-blue-300 text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-500/30 transition-colors">{step.service}</span>
                        <span className={`text-[10px] font-bold px-1.5 rounded transition-colors ${step.level === 'SEVERE' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{step.level}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 transition-colors">{new Date(step.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm font-mono text-slate-800 dark:text-slate-300 break-all leading-relaxed transition-colors">{step.message}</p>
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono transition-colors">
                        <Server size={12} /> {step.host}
                    </div>
                </div>
            </div>
        ))}
        </div>
    </div>
);