import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, AlertCircle, AlertTriangle, Info, Server, Check, Layers, User, Inbox } from 'lucide-react';

export default function LogTable({ 
  logs, 
  searchQuery = '', 
  onRowClick, 
  selectedLevel,    onLevelChange,
  selectedService,  onServiceChange, 
  selectedUser = 'ALL', onUserChange, availableUsers = [] 
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const headerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) setActiveFilter(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Merge API user list with users visible in current page
  const dynamicUserList = useMemo(() => {
    const visibleUsers = logs
      .map(log => log.username || log.host)
      .filter(Boolean);
    const combined = new Set(['ALL', ...availableUsers, ...visibleUsers]);
    return Array.from(combined).sort((a, b) => {
      if (a === 'ALL') return -1;
      if (b === 'ALL') return 1;
      return a.localeCompare(b);
    });
  }, [logs, availableUsers]);

  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    try {
      const safe  = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safe})`, 'gi');
      return text.split(regex).map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase()
          ? <span key={i} className="bg-[#005686]/20 dark:bg-[#005686]/30 text-[#005686] dark:text-white font-bold px-0.5 rounded border border-[#005686]/30">{part}</span>
          : part
      );
    } catch { return text; }
  };

  const getLevelStyles = (level) => {
    switch (level) {
      case 'SEVERE':  return { badge: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',         icon: <AlertCircle   size={14} className="text-red-600 dark:text-red-400" /> };
      case 'ERROR':   return { badge: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20', icon: <AlertCircle   size={14} className="text-orange-600 dark:text-orange-400" /> };
      case 'WARNING': return { badge: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',   icon: <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" /> };
      default:        return { badge: 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600/50',    icon: <Info          size={14} className="text-slate-500 dark:text-slate-400" /> };
    }
  };

  const formatLogTime = (dateString) => {
    if (!dateString) return '--';
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) return d.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const m = dateString.match(/(\d{2}:\d{2}:\d{2})/);
      return m ? m[0] : dateString.substring(0, 8);
    } catch { return dateString; }
  };

  const formatLogDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return !isNaN(d.getTime()) ? d.toLocaleDateString('en-CA') : dateString.split('T')[0];
    } catch { return ''; }
  };

  const getServiceStyle = (svc) => {
    const name = (svc || '').toUpperCase();
    if (name.includes('APACHE'))   return 'text-purple-700 dark:text-purple-300';
    if (name.includes('PASSPORT')) return 'text-orange-700 dark:text-orange-300';
    return 'text-slate-600 dark:text-slate-400';
  };

  const services = ['ALL', 'PASSPORT', 'APACHE', 'DASHBOARD', 'SEARCH', 'SPACECAS', 'NOCAS', 'COMMENT', 'NOTIFICATION', 'SWYM', 'FCS'];

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-700 overflow-visible shadow-xl relative transition-colors duration-200 font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">

          {/* HEADER */}
          <thead className="bg-[#005686] text-white text-xs font-bold uppercase tracking-wider border-b border-[#00446b]" ref={headerRef}>
            <tr>
              <th className="px-6 py-4 w-48">
                <div className="flex items-center gap-2"><Clock size={14} className="text-white/80" /> Log Time</div>
              </th>

              {/* SERVICE FILTER */}
              <th className="px-6 py-4 w-40 relative">
                <button onClick={() => setActiveFilter(activeFilter === 'origin' ? null : 'origin')}
                  className="flex items-center gap-2 hover:text-white/80 transition-colors focus:outline-none">
                  <Layers size={14} className="text-white/80" /> Origin
                  {selectedService !== 'ALL' && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </button>
                {activeFilter === 'origin' && (
                  <div className="absolute top-10 left-0 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-50 w-48 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700 mb-1">Filter by Service</div>
                    <div className="max-h-64 overflow-y-auto">
                      {services.map(svc => (
                        <button key={svc} onClick={() => { onServiceChange(svc); setActiveFilter(null); }}
                          className={`w-full text-left px-4 py-2 text-xs flex justify-between items-center transition-colors
                            ${selectedService === svc ? 'text-[#005686] dark:text-white bg-blue-50 dark:bg-[#005686]/20 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#005686]/50'}`}>
                          {svc}
                          {selectedService === svc && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </th>

              <th className="px-6 py-4 w-32">Level</th>

              {/* USER FILTER */}
              <th className="px-6 py-4 w-48 relative">
                <button onClick={() => setActiveFilter(activeFilter === 'user' ? null : 'user')}
                  className="flex items-center gap-2 hover:text-white/80 transition-colors focus:outline-none">
                  <User size={14} className="text-white/80" /> User Identity
                  {selectedUser !== 'ALL' && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </button>
                {activeFilter === 'user' && (
                  <div className="absolute top-10 left-0 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-50 w-64 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700 mb-1">Filter by User</div>
                    <div className="max-h-64 overflow-y-auto">
                      {dynamicUserList.map(usr => (
                        <button key={usr} onClick={() => { onUserChange(usr); setActiveFilter(null); }}
                          className={`w-full text-left px-4 py-2 text-xs flex justify-between items-center transition-colors font-mono
                            ${selectedUser === usr ? 'text-[#005686] dark:text-white bg-blue-50 dark:bg-[#005686]/20 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#005686]/50'}`}>
                          <span className="truncate">{usr}</span>
                          {selectedUser === usr && <Check size={12} className="shrink-0 ml-2" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </th>

              <th className="px-6 py-4">Message</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm transition-colors">

            {/* FIX: Explicit empty state — previously this rendered nothing */}
            {(!logs || logs.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-600">
                    <Inbox size={40} strokeWidth={1.5} />
                    <div>
                      <p className="font-semibold text-slate-500 dark:text-slate-400">No logs found</p>
                      <p className="text-xs mt-1">Try adjusting your filters or date range</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              // Logs are pre-sorted by es_sort_time DESC in LiveLogs.jsx
              // so we just render them in the order we receive them
              logs.map((log, index) => {
                const styles = getLevelStyles(log.level);
                return (
                  <tr key={log.id || index} onClick={() => onRowClick?.(log)}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
                    <td className="px-6 py-4">
                      {/* Display log_time (from message text) but rows are ordered by es_sort_time */}
                      <div className="font-mono text-xs text-slate-900 dark:text-white font-semibold">{formatLogTime(log.log_time)}</div>
                      <div className="text-slate-500 dark:text-slate-500 text-[10px] font-mono">{formatLogDate(log.log_time)}</div>
                    </td>
                    <td className={`px-6 py-4 font-bold text-[10px] tracking-wide transition-colors ${getServiceStyle(log.service)}`}>
                      {log.service || 'SYSTEM'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                        {styles.icon} {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs truncate max-w-[150px]" title={`Host: ${log.host}`}>
                      {log.username || log.host || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs break-all line-clamp-2 leading-relaxed">
                      {highlightText(log.message, searchQuery)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}