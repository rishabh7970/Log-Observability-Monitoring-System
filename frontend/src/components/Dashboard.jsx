import React, { useState, useEffect, useMemo, useCallback, forwardRef } from 'react';
import { 
  Activity, AlertTriangle, Server, CheckCircle, AlertOctagon, 
  Maximize2, Zap, Thermometer, Filter, Calendar as CalendarIcon, 
  X, Wifi, WifiOff, Loader, AlertCircle, Sun, Moon 
} from 'lucide-react';
import { VolumeChart, ServiceHealthChart, SeverityChart } from "./dashboard/charts/Charts";
import { FocusModal, KpiCard } from "./dashboard/ui/DashboardUI";
import { ErrorList, HostGrid, TraceSteps } from "./dashboard/sections/AnalysisLists";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GrafanaPanel from "./dashboard/ui/GrafanaPanel";
import { useTheme } from '../hooks/useTheme'; 

// --- CUSTOM DATEPICKER STYLES ---
const DatePickerWrapper = ({ children }) => (
  <div className="relative">
    <style>{`
      /* BASE/LIGHT THEME */
      .react-datepicker {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
      .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #005686 !important; color: white !important; }
      .react-datepicker__day--disabled { color: #94a3b8 !important; opacity: 0.5; }
      .react-datepicker__triangle { display: none !important; }
      .react-datepicker__input-container input { width: 100%; }

      /* DARK THEME */
      .dark .react-datepicker {
        background-color: #0f172a !important;
        border-color: #334155 !important;
        color: #cbd5e1 !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
      }
      .dark .react-datepicker__header {
        background-color: #1e293b !important;
        border-bottom-color: #334155 !important;
      }
      .dark .react-datepicker__current-month, .dark .react-datepicker-time__header { color: #f1f5f9 !important; }
      .dark .react-datepicker__day-name { color: #94a3b8 !important; }
      .dark .react-datepicker__day { color: #cbd5e1 !important; }
      .dark .react-datepicker__day:hover { background-color: #334155 !important; color: white !important; }
    `}</style>
    {children}
  </div>
);

// --- CUSTOM INPUT COMPONENT ---
const DatePickerCustomInput = forwardRef(({ value, onClick }, ref) => (
  <button 
    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#005686] dark:hover:border-[#005686] p-2 rounded-lg transition-all flex items-center justify-center gap-2 min-w-[40px] shadow-sm active:scale-95 h-[38px]" 
    onClick={onClick} 
    ref={ref} 
    title="Select Date"
    type="button" 
  >
    <CalendarIcon size={18} />
    {value ? <span className="text-xs font-mono font-bold text-[#005686]">{value}</span> : null}
    {value && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#005686] rounded-full border-2 border-white dark:border-slate-900"></span>}
  </button>
));

// --- HELPER COMPONENT (Blue Header + White Text) ---
const SectionContainer = ({ title, icon, children, onClick }) => (
  <div onClick={onClick} className={`bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl h-[320px] hover:border-slate-300 dark:hover:border-[#005686]/50 transition-all group flex flex-col shadow-sm hover:shadow-md overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
    
    {/* HEADER with #005686 Background and White Text */}
    <div className="bg-[#005686] px-5 py-3 flex justify-between items-center shrink-0">
      <h3 className="font-bold text-sm text-white transition-colors flex items-center gap-2">
        {React.cloneElement(icon, { className: "text-white/80" })} 
        {title}
      </h3>
      {onClick && <Maximize2 size={16} className="text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all" />}
    </div>

    {/* BODY */}
    <div className="flex-1 min-h-0 relative p-5">
        {children}
    </div>
  </div>
);

// --- INGESTION MODAL CONTENT (Blue Header + White Text) ---
const IngestionModalContent = ({ nodes, stats, onSelect }) => {
    const timeAgo = (dateString) => {
        if (!dateString) return 'Offline';
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] transition-colors">
            {/* MODAL HEADER */}
            <div className="flex items-center gap-2 border-b border-[#00446b] bg-[#005686] px-6 py-4 text-white font-bold text-sm uppercase tracking-wide transition-colors">
                <Activity size={16} className="text-white/80" /> Live Node Status
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-slate-900 dark:text-white"><Activity size={50} /></div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Ingestion Rate</div>
                        <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 transition-colors">{stats.rate} <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">logs/s</span></div>
                    </div>
                    <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-emerald-600 dark:text-white"><Wifi size={50} /></div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Online Agents</div>
                        <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 transition-colors">{stats.active_agents} <span className="text-xs text-slate-400 dark:text-slate-500 font-sans">/ {nodes.length}</span></div>
                    </div>
                    <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group transition-colors">
                        <div className="absolute right-0 top-0 p-4 opacity-5 dark:opacity-10 text-slate-900 dark:text-white"><AlertCircle size={50} /></div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Offline Nodes</div>
                        <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 transition-colors">{nodes.length - stats.active_agents}</div>
                    </div>
                </div>

                {/* Nodes Table */}
                <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                    {nodes.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 dark:text-slate-500">No active nodes found.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-[#0f172a] text-slate-500 dark:text-slate-400 font-bold uppercase text-xs transition-colors">
                                <tr><th className="px-6 py-3">Hostname</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Rate</th><th className="px-6 py-3">Last Seen</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 transition-colors">
                                {nodes.map((node, i) => (
                                    <tr 
                                        key={i} 
                                        onClick={() => onSelect(node.name)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-3 font-mono text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 font-bold underline decoration-blue-500/30 underline-offset-4 decoration-dashed transition-colors">
                                            {node.name}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border transition-colors ${node.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'}`}>
                                                {node.status === 'Active' ? <Wifi size={10} /> : <WifiOff size={10} />} {node.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-mono text-slate-700 dark:text-slate-300 transition-colors">{node.rate} /s</td>
                                        <td className="px-6 py-3 font-mono text-slate-500 dark:text-slate-500 transition-colors">{timeAgo(node.lastSeen)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme(); 
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [focusedView, setFocusedView] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [customDate, setCustomDate] = useState(null); 
  const [selectedHost, setSelectedHost] = useState("ALL"); 
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [traceFlow, setTraceFlow] = useState([]);
  const [isTraceLoading, setIsTraceLoading] = useState(false);

  // -- INGESTION STATE --
  const [ingestionNodes, setIngestionNodes] = useState([]);
  const [ingestionStats, setIngestionStats] = useState({ rate: 0, active_agents: 0, total_agents: 0 });
  const [ingestionLoading, setIngestionLoading] = useState(true);

  // --- GRAFANA HELPER (UNIX MS) ---
  const getGrafanaUrl = useCallback((basePanelUrl) => {
    const grafanaTheme = theme === 'dark' ? 'dark' : 'light';
    
    if (customDate) {
        const start = new Date(customDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customDate);
        end.setHours(23, 59, 59, 999);
        return `${basePanelUrl}&from=${start.getTime()}&to=${end.getTime()}&theme=${grafanaTheme}`;
    }
    let from = "now-30d";
    if (timeRange === "24h") from = "now-24h";
    if (timeRange === "7d") from = "now-7d";
    return `${basePanelUrl}&from=${from}&to=now&theme=${grafanaTheme}`;
  }, [timeRange, customDate, theme]);

  const safeData = data || {};
  const kpi = safeData.kpi || { total_logs: 0, active_hosts: 0, error_rate: 0, host_list: [] };
  const charts = safeData.charts || { volume: [], severity: [] };
  const analytics = safeData.analytics || { service_health: [], top_errors: [], heatmap: [] };
  const criticals = safeData.criticals || []; 

  const sortedServices = useMemo(() => {
    const rawData = analytics.service_health || [];
    const aggregated = rawData.reduce((acc, curr) => {
      const name = curr.name;
      if (!acc[name]) { acc[name] = { name: name, total: 0, healthSum: 0, count: 0 }; }
      acc[name].total += curr.total;
      acc[name].healthSum += curr.health;
      acc[name].count += 1;
      return acc;
    }, {});
    return Object.values(aggregated).map(item => ({
      name: item.name,
      total: item.total,
      health: Number((item.healthSum / item.count).toFixed(2))
    })).sort((a, b) => a.health - b.health);
  }, [analytics.service_health]);

  const allErrors = useMemo(() => {
      return analytics.top_errors || [];
  }, [analytics.top_errors]);

  // --- Calculate Enriched Hosts ---
  const enrichedHosts = useMemo(() => {
      const logHosts = kpi.host_list || [];
      const ingestionMap = new Map();
      ingestionNodes.forEach(n => ingestionMap.set(n.name, n)); 

      const allHostNames = new Set([...logHosts, ...ingestionNodes.map(n => n.name)]);

      return Array.from(allHostNames).map(hostname => {
          const liveNode = ingestionMap.get(hostname);
          return {
              name: hostname,
              status: liveNode ? liveNode.status : 'Offline',
              rate: liveNode ? liveNode.rate : 0,
              lastSeen: liveNode ? liveNode.lastSeen : null
          };
      });
  }, [kpi.host_list, ingestionNodes]);

  // --- FETCHERS ---
  const fetchIngestion = useCallback(() => {
      const token = localStorage.getItem('access_token');
      fetch('http://127.0.0.1:8000/ingestion/status', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
              setIngestionNodes(data.nodes);
              setIngestionStats(data.global);
              setIngestionLoading(false);
          })
          .catch(err => console.error(err));
  }, []);

  const fetchStats = useCallback(() => {
    let url = `http://127.0.0.1:8000/dashboard-stats?time_range=${timeRange}`;
    if (selectedHost !== "ALL") url += `&host=${selectedHost}`;
    
    if (customDate) {
        const year = customDate.getFullYear();
        const month = String(customDate.getMonth() + 1).padStart(2, '0');
        const day = String(customDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        url += `&start_date=${formattedDate}`;
    }

    const token = localStorage.getItem('access_token');
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { localStorage.removeItem('access_token'); window.location.reload(); return; }
        return res.json();
      })
      .then(apiData => { setData(apiData); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [timeRange, selectedHost, customDate]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    fetchIngestion();
    
    const statsInterval = setInterval(fetchStats, 60000);
    const ingestInterval = setInterval(fetchIngestion, 10000);
    
    return () => { clearInterval(statsInterval); clearInterval(ingestInterval); };
  }, [fetchStats, fetchIngestion]);

  useEffect(() => {
    if (!selectedTrace) return;
    setIsTraceLoading(true);
    const token = localStorage.getItem('access_token');
    fetch(`http://127.0.0.1:8000/logs/trace/${selectedTrace}`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => { 
          setTraceFlow(data.steps); 
          setIsTraceLoading(false); 
      })
      .catch(() => setIsTraceLoading(false));
  }, [selectedTrace]);

  const handleDateChange = (date) => { setCustomDate(date); if(date) setTimeRange("custom"); };
  const handleTimeRangeClick = (range) => { setTimeRange(range); setCustomDate(null); };
  const clearDate = () => { setCustomDate(null); setTimeRange("30d"); }
  const displayDate = customDate ? customDate.toLocaleDateString('en-CA') : ""; 

  const handleIngestionHostClick = (hostname) => {
      setSelectedHost(hostname);
      setFocusedView(null); 
  };

  if (loading && !data) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a] text-[#005686] font-mono animate-pulse transition-colors">LOADING DASHBOARD...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 overflow-y-auto font-sans relative transition-colors duration-200">
      
      {/* HEADER WITH BLUE BACKGROUND & WHITE TEXT */}
      <div className="sticky top-0 z-40 bg-[#005686] dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 px-6 py-4 flex flex-col md:flex-row md:items-end justify-between gap-4 transition-colors duration-200 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 transition-colors">
            System Overview 
            {selectedHost !== "ALL" && (<span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-in fade-in">{selectedHost} <button onClick={() => setSelectedHost("ALL")} className="hover:text-blue-200 font-bold">×</button></span>)}
            {customDate && (<span className="bg-white/20 text-white border border-white/30 text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-in fade-in transition-colors">Date: {displayDate}</span>)}
          </h1>
          <p className="text-white/80 text-sm mt-1 transition-colors">Analyzing <strong className="text-white">{kpi.total_logs?.toLocaleString()}</strong> events.</p>
        </div>
        <div className="flex items-center gap-3">
            {/* THEME TOGGLE */}
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-white/10 dark:bg-slate-800 text-white dark:text-slate-400 hover:bg-white/20 dark:hover:text-white border border-white/20 dark:border-slate-700 transition-colors h-[38px] flex items-center justify-center">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative flex items-center gap-2">
               <DatePickerWrapper>
                  <DatePicker selected={customDate} onChange={handleDateChange} customInput={<DatePickerCustomInput />} preventOpenOnFocus={true} popperPlacement="bottom-center" placeholderText="Select Date" dateFormat="yyyy-MM-dd"/>
               </DatePickerWrapper>
               {customDate && (<button onClick={clearDate} className="bg-white/10 dark:bg-slate-800 border border-white/20 dark:border-slate-700 p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700 text-white dark:text-slate-400 transition-colors"><X size={18} /></button>)}
            </div>
            <div className="w-px h-8 bg-white/30 dark:bg-slate-700 mx-1 transition-colors"></div>
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800 border border-white/20 dark:border-slate-700 rounded-lg p-1 shadow-sm transition-colors">
              {['24h', '7d', '30d'].map((range) => (
                <button key={range} onClick={() => handleTimeRangeClick(range)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range ? 'bg-white text-[#005686] shadow' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>{range}</button>
              ))}
            </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Total Logs" value={kpi.total_logs?.toLocaleString()} icon={<Activity size={20} className="text-[#005686]" />} onClick={() => setFocusedView('volume')} />
            <KpiCard title="Active Hosts" value={ingestionStats.active_agents || 0} icon={<Server size={20} className="text-indigo-600 dark:text-indigo-400" />} onClick={() => setFocusedView('ingestion')} />
            
            {/* UPDATED: 3-Tier color logic for Error Rate */}
            <KpiCard 
                title="Error & Severe Rate" 
                value={`${kpi.error_rate}%`} 
                icon={<AlertTriangle size={20} className={kpi.error_rate > 5 ? "text-red-500" : kpi.error_rate > 2 ? "text-orange-500" : "text-emerald-500"} />} 
                onClick={() => setFocusedView('severity')} 
                trend={kpi.error_rate > 5 ? "Critical" : kpi.error_rate > 2 ? "Degraded" : "Stable"} 
            />
            
            {/* UPDATED: 3-Tier logic for System Health */}
            <KpiCard 
                title="System Health" 
                value={kpi.error_rate > 5 ? "Critical" : kpi.error_rate > 2 ? "Degraded" : "Healthy"} 
                icon={<CheckCircle size={20} className={kpi.error_rate > 5 ? "text-red-500" : kpi.error_rate > 2 ? "text-orange-500" : "text-emerald-500"} />} 
                onClick={() => setFocusedView('services')} 
            />
        </div>

        {/* Row 2: Live Grafana Dashboard (Full Width) */}
        <div className="w-full">
             <SectionContainer title="Live Traffic Monitor (Grafana)" icon={<Activity size={16} />}>
                <GrafanaPanel 
                    src={getGrafanaUrl("http://localhost:3000/d-solo/adwms6k/api-overview?orgId=1&panelId=panel-1&__feature.dashboardSceneSolo=true")} 
                    title="Real-time Traffic" 
                />
             </SectionContainer>
        </div>

        {/* Row 3: Historical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionContainer title="Traffic Volume History" icon={<Activity size={16} />} onClick={() => setFocusedView('volume')}>
                <VolumeChart data={charts.volume} isExpanded={false} timeRange={timeRange} />
            </SectionContainer>
            <SectionContainer title="Severity Distribution" icon={<AlertTriangle size={16} />} onClick={() => setFocusedView('severity')}>
                <div className="flex items-center gap-6 h-full p-1">
                    <div className="w-[55%] h-full"><SeverityChart data={charts.severity} isExpanded={false} /></div>
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        {/* Dynamic mapping handles 4 items perfectly */}
                        {charts.severity.slice(0, 4).map((item) => (
                            <div key={item.name} className="flex justify-between items-center p-3 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 transition-colors">
                                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: item.color}}></div><span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">{item.name}</span></div>
                                <span className="text-base font-bold text-slate-900 dark:text-white font-mono transition-colors">{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionContainer>
        </div>

        {/* Row 4: Heatmap (Grafana) */}
        <SectionContainer title="Peak Traffic Heatmap (Grafana)" icon={<Thermometer size={16} />}>
            <GrafanaPanel 
                src={getGrafanaUrl("http://localhost:3000/d-solo/adwms6k/api-overview?orgId=1&panelId=panel-2&__feature.dashboardSceneSolo=true")}
                title="Traffic Heatmap" 
            />
        </SectionContainer>

        {/* Row 5: Services & Errors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionContainer title="Service Health Scorecard" icon={<Zap size={16} />} onClick={() => setFocusedView('services')}>
                <div className="h-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-colors"><ServiceHealthChart data={sortedServices} /></div>
            </SectionContainer>
            
            <SectionContainer title={customDate ? `Top Errors on ${displayDate}` : "Top Error Patterns"} icon={<AlertOctagon size={16} />} onClick={() => setFocusedView('errors')}>
                <div className="h-full overflow-y-auto custom-scrollbar">
                    <ErrorList errors={allErrors} onCopy={(t) => navigator.clipboard.writeText(t)} isDateView={!!customDate} />
                </div>
            </SectionContainer>
        </div>

      </div>

      {/* --- MODALS --- */}
      {focusedView === 'ingestion' && (
        <FocusModal title="Data Ingestion & Active Nodes" onClose={() => setFocusedView(null)}>
            <IngestionModalContent nodes={enrichedHosts} stats={ingestionStats} onSelect={handleIngestionHostClick} />
        </FocusModal>
      )}

      {selectedTrace && (
        <FocusModal title={`Trace Lifecycle: ${selectedTrace}`} onClose={() => setSelectedTrace(null)}>
           {isTraceLoading ? <div className="flex justify-center p-10 font-mono animate-pulse text-[#005686]">LOADING TRACE...</div> : <TraceSteps steps={traceFlow} />}
        </FocusModal>
      )}

      {focusedView === 'volume' && (
        <FocusModal title={`Traffic Analysis (${customDate ? displayDate : timeRange})`} onClose={() => setFocusedView(null)}>
           <div className="h-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-colors"><VolumeChart data={charts.volume} isExpanded={true} timeRange={timeRange} /></div>
        </FocusModal>
      )}
      
      {focusedView === 'severity' && (
        <FocusModal title="Severity Distribution" onClose={() => setFocusedView(null)}>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col transition-colors">
                    <h4 className="text-sm font-bold text-[#005686] dark:text-slate-400 mb-4 uppercase tracking-wider transition-colors">Global Distribution</h4>
                    <div className="flex-1 min-h-0">
                        <SeverityChart data={charts.severity} isExpanded={true} />
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex-1 flex flex-col min-h-0 transition-colors">
                        <h4 className="text-sm font-bold text-[#005686] dark:text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors"><Activity size={16} /> Impacted Services</h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {sortedServices.filter(s => s.health < 100).length === 0 ? <div className="text-slate-500 italic text-sm">All services operating at 100% health.</div> : sortedServices.filter(s => s.health < 100).map((svc) => ( 
                            
                            <div key={svc.name} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-colors"> 
                                <div className="flex items-center gap-3"> 
                                    {/* UPDATED: 3-Tier Health Colors */}
                                    <div className={`w-2 h-8 rounded-full ${svc.health < 90 ? 'bg-red-500' : svc.health < 95 ? 'bg-orange-500' : 'bg-emerald-500'}`}></div> 
                                    <div> 
                                        <div className="font-bold text-slate-900 dark:text-slate-200 text-sm transition-colors">{svc.name}</div> 
                                        <div className="text-xs text-slate-500">{svc.total.toLocaleString()} logs</div> 
                                    </div> 
                                </div> 
                                <div className="text-right"> 
                                    {/* UPDATED: 3-Tier Text Colors */}
                                    <div className={`font-mono font-bold ${svc.health < 90 ? 'text-red-500 dark:text-red-400' : svc.health < 95 ? 'text-orange-500 dark:text-orange-400' : 'text-emerald-500 dark:text-emerald-400'} transition-colors`}>{svc.health}%</div> 
                                    <div className="text-[10px] text-slate-500 uppercase">Health</div> 
                                </div> 
                            </div> ))}
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex-1 flex flex-col min-h-0 transition-colors">
                         <h4 className="text-sm font-bold text-[#005686] dark:text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider transition-colors"><AlertOctagon size={16} /> Top Critical Patterns</h4>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                             <ErrorList errors={allErrors.slice(0, 10)} onCopy={(t) => navigator.clipboard.writeText(t)} isDateView={false} />
                        </div>
                    </div>
                </div>
             </div>
        </FocusModal>
      )}

      {focusedView === 'hosts' && (
        <FocusModal title="Active Host Registry" onClose={() => setFocusedView(null)}>
             <HostGrid hosts={enrichedHosts} selectedHost={selectedHost} onSelect={(h) => { setSelectedHost(h); setFocusedView(null); }} />
        </FocusModal>
      )}

      {focusedView === 'services' && (
        <FocusModal title="Service Health Analytics" onClose={() => setFocusedView(null)}>
             <div className="h-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-colors"><ServiceHealthChart data={sortedServices} /></div>
        </FocusModal>
      )}

      {focusedView === 'errors' && (
         <FocusModal title={customDate ? `Errors Analysis (${displayDate})` : "Error Patterns Analysis"} onClose={() => setFocusedView(null)}>
            <div className="flex flex-col gap-4 h-full">
                <div className="flex-1 overflow-auto"><ErrorList errors={allErrors} onCopy={(t) => navigator.clipboard.writeText(t)} isDateView={!!customDate} /></div>
            </div>
         </FocusModal>
      )}
    </div>
  );
}