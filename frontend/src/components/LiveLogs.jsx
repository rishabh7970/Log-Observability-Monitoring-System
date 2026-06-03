import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, 
  Server, Clock, AlertTriangle, Activity, AlignLeft, Layers, 
  AlertOctagon, CheckCircle, Calendar, Sun, Moon, User, AlertCircle,
  WifiOff, RefreshCw
} from 'lucide-react'; 
import LogTable from './LogTable'; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "../hooks/useTheme";

const API_BASE = 'http://127.0.0.1:8000';

// --- 1. CUSTOM DATEPICKER STYLES ---
const DatePickerWrapper = ({ children }) => (
  <div className="relative">
    <style>{`
      .react-datepicker {
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        background-color: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        color: #0f172a !important;
        font-size: 0.85rem !important;
      }
      .react-datepicker-popper { z-index: 9999 !important; }
      .react-datepicker__header {
        background-color: #f8fafc !important;
        border-bottom: 1px solid #e2e8f0 !important;
        border-top-left-radius: 0.5rem !important;
        border-top-right-radius: 0.5rem !important;
        padding-top: 10px !important;
      }
      .react-datepicker__current-month, .react-datepicker-time__header { color: #0f172a !important; font-weight: 600 !important; }
      .react-datepicker__day-name { color: #64748b !important; }
      .react-datepicker__day { color: #334155 !important; border-radius: 0.25rem !important; }
      .react-datepicker__day:hover { background-color: #e2e8f0 !important; color: #0f172a !important; }
      .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range { background-color: #005686 !important; color: white !important; }
      .react-datepicker__day--disabled { color: #94a3b8 !important; opacity: 0.5; }
      .react-datepicker__triangle { display: none !important; }
      .react-datepicker__input-container input { width: 100%; }
      .dark .react-datepicker { background-color: #0f172a !important; border-color: #334155 !important; color: #cbd5e1 !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5) !important; }
      .dark .react-datepicker__header { background-color: #1e293b !important; border-bottom-color: #334155 !important; }
      .dark .react-datepicker__current-month, .dark .react-datepicker-time__header { color: #f1f5f9 !important; }
      .dark .react-datepicker__day-name { color: #94a3b8 !important; }
      .dark .react-datepicker__day { color: #cbd5e1 !important; }
      .dark .react-datepicker__day:hover { background-color: #334155 !important; color: white !important; }
    `}</style>
    {children}
  </div>
);

const getServiceStyle = (serviceName) => {
  const name = (serviceName || '').toUpperCase();
  if (name.includes('APACHE'))    return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30';
  if (name.includes('PASSPORT'))  return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30';
  if (name.includes('SEARCH'))    return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30';
  if (name.includes('DASHBOARD')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30';
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';
};

// --- LEVEL FILTER PILLS ---
const LevelFilterPills = ({ current, onChange }) => {
  const levels = [
    { id: 'ALL',     label: 'All',    color: 'bg-white text-[#005686]',   icon: <CheckCircle  size={14} /> },
    { id: 'WARNING', label: 'Warn',   color: 'bg-amber-600 text-white',   icon: <AlertTriangle size={14} /> },
    { id: 'ERROR',   label: 'Error',  color: 'bg-orange-600 text-white',  icon: <AlertCircle  size={14} /> },
    { id: 'SEVERE',  label: 'Severe', color: 'bg-red-600 text-white',     icon: <AlertOctagon size={14} /> },
  ];
  return (
    <div className="flex items-center gap-1 bg-white/10 dark:bg-[#0f172a] p-1 rounded-lg border border-white/20 dark:border-slate-700 h-[42px] transition-colors">
      {levels.map((lvl) => {
        const isActive = current === lvl.id;
        return (
          <button key={lvl.id} onClick={() => onChange(lvl.id)}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 h-full
              ${isActive ? `${lvl.color} shadow-md` : 'text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          >
            {lvl.icon}{lvl.label}
          </button>
        );
      })}
    </div>
  );
};

// --- LOG DETAIL MODAL ---
function LogDetailModal({ log, onClose, onLogClick }) {
  const [relatedLogs, setRelatedLogs]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [traceMode, setTraceMode]       = useState('HOST');
  const [timelineFilter, setTimelineFilter] = useState('ALL');

  useEffect(() => {
    if (!log) return;
    setLoading(true);
    const token  = localStorage.getItem('access_token');
    const traceId = log.trace_id || log.id || log._id;

    fetch(`${API_BASE}/logs/trace/${traceId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.steps) {
          const steps = [...data.steps].reverse().map(s => ({
            ...s,
            log_time: s.timestamp,
            level:    s.status || s.level || 'INFO'
          }));
          setRelatedLogs(steps);
        }
        if (data.mode) setTraceMode(data.mode);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [log]);

  const filteredTimeline = relatedLogs.filter(item =>
    timelineFilter === 'ALL' || item.level === timelineFilter
  );

  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-[#001433]/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        
        {/* MODAL HEADER */}
        <div className="bg-[#005686] p-6 border-b border-[#00446b] shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers size={20} className="text-white/80" />
                {traceMode === 'USER' ? 'User Transaction Timeline' : 'Host Transaction Timeline'}
              </h3>
              <p className="text-white/80 text-xs font-mono mt-1">
                {traceMode === 'USER' ? 'Tracing Activity for User across all Services' : 'Tracing Activity on Host'}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white/70 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'User Identity', icon: <User size={12} />,          value: log.username || log.host || 'Unknown' },
              { label: 'Log Date',      icon: <Calendar size={12} />,      value: new Date(log.log_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) },
              { label: 'Log Time',      icon: <Clock size={12} />,         value: new Date(log.log_time).toLocaleTimeString() },
              { label: 'Origin Service',icon: <Server size={12} />,        value: log.service },
            ].map(({ label, icon, value }) => (
              <div key={label} className="p-3 bg-white/10 rounded-lg border border-white/20">
                <span className="text-white/70 text-xs uppercase font-bold flex items-center gap-1 mb-1">{icon} {label}</span>
                <div className="text-white font-mono font-bold text-sm truncate">{value}</div>
              </div>
            ))}
            <div className={`p-3 rounded-lg border transition-colors ${log.level === 'SEVERE' ? 'bg-red-500/20 border-red-400/50 text-red-100' : log.level === 'ERROR' ? 'bg-orange-500/20 border-orange-400/50 text-orange-100' : 'bg-white/10 border-white/20 text-white'}`}>
              <span className="opacity-70 text-xs uppercase font-bold flex items-center gap-1 mb-1"><AlertTriangle size={12} /> Status</span>
              <div className="font-bold text-sm">{log.level}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white dark:bg-[#0f172a] flex flex-col md:flex-row transition-colors">
          {/* PAYLOAD SIDEBAR */}
          <div className="md:w-1/3 p-6 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 overflow-auto">
            <div className="flex items-center gap-2 mb-3"><AlignLeft size={16} className="text-[#005686]" /><h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Payload Content</h4></div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#020617] font-mono text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-all shadow-inner">
              {typeof log.message === 'object' ? JSON.stringify(log.message, null, 2) : log.message}
            </div>
          </div>

          {/* TIMELINE SECTION */}
          <div className="md:w-2/3 p-6 bg-white dark:bg-[#0f172a]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#005686]" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {traceMode === 'USER' ? 'User Activity Timeline' : 'Host Context Timeline'}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold">
                {[
                  { id: 'ALL',     label: 'All',    active: 'bg-[#005686] text-white',   inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
                  { id: 'SEVERE',  label: 'Severe', active: 'bg-red-500 text-white',     inactive: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
                  { id: 'ERROR',   label: 'Error',  active: 'bg-orange-500 text-white',  inactive: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' },
                  { id: 'WARNING', label: 'Warn',   active: 'bg-amber-500 text-white',   inactive: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
                  { id: 'INFO',    label: 'Info',   active: 'bg-slate-500 text-white',   inactive: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' },
                ].map(btn => (
                  <button key={btn.id} onClick={() => setTimelineFilter(btn.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${timelineFilter === btn.id ? btn.active : btn.inactive}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${timelineFilter === btn.id ? 'bg-white' : 'bg-current'}`}></div>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center p-10 text-slate-500 animate-pulse">Tracing transaction across ecosystem...</div>
            ) : (
              <div className="relative border-l border-slate-300 dark:border-slate-700 ml-3 space-y-4 pb-4">
                {filteredTimeline.length === 0 ? (
                  <div className="pl-6 text-slate-500 text-sm italic">
                    No {timelineFilter !== 'ALL' ? timelineFilter.toLowerCase() + ' ' : ''}trace steps found in this window.
                  </div>
                ) : filteredTimeline.map((item, idx) => {
                  const targetId = item.id || item._id;
                  const currentSelectedId = log.id || log._id;
                  const isSelected = targetId === currentSelectedId;
                  
                  let statusColor = 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600';
                  let dotColor    = isSelected ? 'bg-slate-800 dark:bg-white' : 'bg-slate-400 dark:bg-slate-600';
                  if (item.level === 'SEVERE')  { statusColor = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';          dotColor = 'bg-red-500'; }
                  if (item.level === 'ERROR')   { statusColor = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'; dotColor = 'bg-orange-500'; }
                  if (item.level === 'WARNING') { statusColor = 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';  dotColor = 'bg-amber-500'; }

                  return (
                    <div key={idx} onClick={() => onLogClick(item)}
                      className={`relative pl-8 group cursor-pointer ${isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100 transition-opacity'}`}>
                      <div className={`absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full border border-white dark:border-[#0f172a] ${dotColor} z-10`}></div>
                      <div className={`p-3 rounded-lg border text-sm flex gap-3 items-start transition-colors ${isSelected ? 'bg-[#005686]/10 border-[#005686]/50 ring-1 ring-[#005686]/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <span className="text-slate-500 font-mono text-[10px]">
                            {item.log_time ? new Date(item.log_time).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border font-mono max-w-[80px] truncate ${isSelected ? 'bg-[#005686] text-white border-[#005686]' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'}`}>
                            {item.username || item.user || item.host || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getServiceStyle(item.service)}`}>{item.service}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 ${statusColor}`}>
                              {item.level === 'SEVERE'  && <AlertOctagon size={10} />}
                              {item.level === 'ERROR'   && <AlertCircle  size={10} />}
                              {item.level === 'WARNING' && <AlertTriangle size={10} />}
                              {item.level === 'INFO'    && <CheckCircle  size={10} />}
                              {item.level}
                            </span>
                            <span className="ml-auto text-[10px] font-mono text-slate-400">{item.host}</span>
                          </div>
                          <div className="text-slate-800 dark:text-slate-300 font-mono text-xs break-words whitespace-pre-wrap">
                            {typeof item.message === 'object' ? JSON.stringify(item.message) : item.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CUSTOM DATEPICKER INPUT ---
const DatePickerCustomInput = forwardRef(({ value, onClick }, ref) => (
  <button className="relative bg-white/10 dark:bg-slate-800 border border-white/20 dark:border-slate-700 text-white dark:text-slate-300 hover:bg-white/20 transition-all flex items-center justify-center gap-2 min-w-[40px] shadow-sm active:scale-95 h-[42px] rounded-lg px-3"
    onClick={onClick} ref={ref} title="Select Date Range" type="button">
    <CalendarIcon size={18} />
    {value && <span className="text-xs font-mono font-bold text-white">{value}</span>}
    {value && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-[#005686]"></span>}
  </button>
));

// --- MAIN COMPONENT ---
export default function LiveLogs() {
  const { theme, toggleTheme } = useTheme();

  const [logs, setLogs]               = useState([]);
  const [fetchError, setFetchError]   = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [status, setStatus]           = useState('Connecting...');
  const [searchTerm, setSearchTerm]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(50);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalLogs, setTotalLogs]     = useState(0);
  const [dateRange, setDateRange]     = useState([null, null]);
  const [startDate, endDate]          = dateRange;
  const [selectedLog, setSelectedLog] = useState(null);

  const [selectedLevel,   setSelectedLevel]   = useState('ALL');
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedUser,    setSelectedUser]    = useState('ALL');
  const [availableUsers,  setAvailableUsers]  = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    let url = `${API_BASE}/dashboard-stats?time_range=30d`;
    if (selectedService && selectedService !== 'ALL') url += `&service=${selectedService}`;

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setAvailableUsers(data?.kpi?.user_list ?? []);
      })
      .catch(err => {
        console.error('Error fetching user list:', err);
        setAvailableUsers([]);
      });
  }, [selectedService]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.reload();
      return;
    }

    let url = `${API_BASE}/logs?page=${page}&limit=${limit}&time_range=30d`;
    if (selectedLevel   && selectedLevel   !== 'ALL') url += `&level=${selectedLevel}`;
    if (selectedService && selectedService !== 'ALL') url += `&service=${selectedService}`;
    if (selectedUser    && selectedUser    !== 'ALL') url += `&username=${encodeURIComponent(selectedUser)}`;
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
    if (startDate) {
      url += `&start_date=${startDate.toISOString()}`;
      const endOfDay = new Date(endDate || startDate);
      endOfDay.setHours(23, 59, 59, 999);
      url += `&end_date=${endOfDay.toISOString()}`;
    }

    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          window.location.reload();
          return null;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!data) return;

        if (!data.data || !Array.isArray(data.data)) {
          console.error('Unexpected /logs response shape:', data);
          setFetchError('Server returned an unexpected response. Check the console.');
          setIsLoading(false);
          return;
        }

        const sorted = [...data.data].sort((a, b) => {
          const ta = new Date(a.es_sort_time || a.log_time || 0).getTime();
          const tb = new Date(b.es_sort_time || b.log_time || 0).getTime();
          return tb - ta;
        });

        setLogs(sorted);
        setTotalPages(data.pagination?.total_pages ?? 0);
        setTotalLogs(data.pagination?.total_items ?? 0);
        setFetchError(null);
        setIsLoading(false);
        setStatus('Live');
      })
      .catch(err => {
        console.error('fetchLogs error:', err);
        setFetchError(`Could not reach the log server: ${err.message}`);
        setStatus('Offline');
        setIsLoading(false);
      });
  }, [page, limit, selectedLevel, selectedService, selectedUser, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    fetchLogs();

    const isCleanView = (
      page === 1 && !debouncedSearch && !startDate && !endDate &&
      !selectedLog && selectedLevel === 'ALL' && selectedService === 'ALL' && selectedUser === 'ALL'
    );

    let interval;
    if (isCleanView) {
      interval = setInterval(fetchLogs, 5000);
    } else {
      if (selectedLog) setStatus('Paused (Viewing Details)');
      else setStatus('Filtered Results');
    }
    return () => clearInterval(interval);
  }, [fetchLogs, page, debouncedSearch, startDate, endDate, selectedLog, selectedLevel, selectedService, selectedUser]);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));
  const clearDates = () => { setDateRange([null, null]); setPage(1); };

  const handleServiceChange = (svc) => {
    setSelectedService(svc);
    setSelectedUser('ALL');
    setPage(1);
  };

  const isFiltered = debouncedSearch || startDate || selectedLevel !== 'ALL' || selectedService !== 'ALL' || selectedUser !== 'ALL';

  // --- REWRITTEN BULLETPROOF TIMELINE CLICK HANDLER ---
  const handleTimelineLogClick = async (clickedItem) => {
    const targetId = clickedItem.id || clickedItem._id;
    
    // If there is no ID returned by the trace API at all, we can't fetch it.
    if (!targetId) {
        setSelectedLog(clickedItem);
        return;
    }

    // 1. Skip if clicking the currently open log
    if (selectedLog?.id === targetId || selectedLog?._id === targetId) return;
    
    // 2. Try to find the full log in current page data first (Instant load)
    const localFullLog = logs.find(l => l.id === targetId || l._id === targetId);
    
    if (localFullLog) {
      setSelectedLog(localFullLog);
      return;
    } 

    // 3. Fallback: Temporarily set the UI to show it's loading
    setSelectedLog({ 
      ...clickedItem, 
      message: `${clickedItem.message}\n\n[...Fetching full payload from server...]` 
    });

    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Attempt 1: Standard REST detail endpoint (GET /logs/{id})
      let res = await fetch(`${API_BASE}/logs/${targetId}`, { headers });
      
      if (res.ok) {
        const fullData = await res.json();
        setSelectedLog(fullData);
        return;
      }

      // Attempt 2: The "Time-Window Extraction" Method
      // Since generic `?search=` might not query database IDs correctly, 
      // we query the main `/logs` endpoint for a 10-second window exactly where this log occurred.
      const logTimeMs = new Date(clickedItem.log_time || clickedItem.timestamp || Date.now()).getTime();
      const startIso = new Date(logTimeMs - 5000).toISOString();
      const endIso = new Date(logTimeMs + 5000).toISOString();
      
      // Narrow the search to the specific service to keep the payload small
      const serviceQuery = clickedItem.service ? `&service=${encodeURIComponent(clickedItem.service)}` : '';
      
      const fallbackUrl = `${API_BASE}/logs?start_date=${startIso}&end_date=${endIso}${serviceQuery}&limit=100`;
      const fallbackRes = await fetch(fallbackUrl, { headers });
      
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        
        if (fallbackData.data && Array.isArray(fallbackData.data)) {
          // Iterate through the results to find our exact log
          const matchedLog = fallbackData.data.find(l => l.id === targetId || l._id === targetId);
          if (matchedLog) {
            setSelectedLog(matchedLog);
            return;
          }
        }
      }
      
      // If all API extraction attempts fail, fall back to the truncated version
      setSelectedLog(clickedItem);
      
    } catch (err) {
      console.error('Failed to fetch full log payload:', err);
      setSelectedLog(clickedItem); 
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 overflow-hidden relative font-sans transition-colors duration-200">

      {selectedLog && (
        <LogDetailModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
          onLogClick={handleTimelineLogClick} 
        />
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-[#005686] dark:bg-[#1e293b] transition-colors duration-200">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            {isFiltered ? 'Search Results' : 'Live System Logs'}
            {status === 'Live' && !isFiltered && <span className="animate-pulse w-2 h-2 bg-emerald-400 rounded-full"></span>}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {isLoading ? 'Loading...' : `Found ${totalLogs.toLocaleString()} ${isFiltered ? 'matches' : 'logs'}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 dark:bg-slate-800 text-white border border-white/20 dark:border-slate-700 transition-colors h-[42px] flex items-center justify-center">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="w-px h-8 bg-white/30 dark:bg-slate-700 mx-1"></div>

          <LevelFilterPills current={selectedLevel} onChange={(lvl) => { setSelectedLevel(lvl); setPage(1); }} />

          <div className="relative flex items-center gap-2">
            <DatePickerWrapper>
              <DatePicker
                selectsRange startDate={startDate} endDate={endDate}
                onChange={(update) => { setDateRange(update); if (update[0]) setPage(1); }}
                isClearable customInput={<DatePickerCustomInput />}
                preventOpenOnFocus popperPlacement="bottom-end"
              />
            </DatePickerWrapper>
            {(startDate || endDate) && (
              <button onClick={clearDates}
                className="bg-white/10 dark:bg-slate-800 p-2 rounded-lg border border-white/20 dark:border-slate-700 hover:bg-white/20 text-white transition-colors h-[42px] w-[42px] flex items-center justify-center">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/60 dark:text-slate-500" size={18} />
            <input type="text" value={searchTerm} placeholder="Search..."
              className="bg-white/10 dark:bg-slate-800 border border-white/20 dark:border-slate-700 text-white pl-10 pr-10 py-2 rounded-lg w-64 focus:outline-none focus:border-white transition-colors placeholder-white/50 h-[42px]"
              onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-white/60 hover:text-white"><X size={16} /></button>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-6">

        {/* ERROR BANNER */}
        {fetchError && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            <WifiOff size={18} className="shrink-0" />
            <span className="flex-1">{fetchError}</span>
            <button onClick={() => { setFetchError(null); fetchLogs(); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-800/40 rounded-md hover:bg-red-200 transition-colors font-semibold text-xs">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* LOADING SKELETON */}
        {isLoading && !fetchError && (
          <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="h-12 bg-[#005686]"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
        )}

        {/* LOG TABLE */}
        {!isLoading && !fetchError && (
          <LogTable
            logs={logs}
            searchQuery={searchTerm}
            onRowClick={(log) => setSelectedLog(log)}
            selectedLevel={selectedLevel}
            onLevelChange={(lvl) => { setSelectedLevel(lvl); setPage(1); }}
            selectedService={selectedService}
            onServiceChange={handleServiceChange}
            selectedUser={selectedUser}
            onUserChange={(usr) => { setSelectedUser(usr); setPage(1); }}
            availableUsers={availableUsers}
          />
        )}
      </div>

      {/* FOOTER PAGINATION */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] flex justify-between items-center transition-colors duration-200">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Rows:</span>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-white focus:outline-none transition-colors">
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <span className="text-slate-600 dark:text-slate-400 text-sm">
          Page <span className="text-slate-900 dark:text-white font-bold">{page}</span> of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button onClick={handlePrev} disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent disabled:opacity-50 rounded text-sm transition-colors">
            <ChevronLeft size={16} /> Prev
          </button>
          <button onClick={handleNext} disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent disabled:opacity-50 rounded text-sm transition-colors">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}