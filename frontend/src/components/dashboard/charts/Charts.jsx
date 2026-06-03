import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Line, Area, AreaChart 
} from 'recharts';

// ==========================================
// 1. DATA PROCESSORS
// ==========================================

const processHeatmapData = (rawData) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const grid = {};
    days.forEach(day => {
        grid[day] = new Array(24).fill(0);
    });

    if (rawData && rawData.length > 0) {
        rawData.forEach(item => {
            const date = new Date(item.time); 
            const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' }); 
            const hour = date.getHours(); 

            if (grid[dayName]) {
                grid[dayName][hour] += item.count;
            }
        });
    }

    return days.map(day => ({
        day,
        hours: grid[day]
    }));
};

// ==========================================
// 2. CHART COMPONENTS
// ==========================================

export const VolumeChart = React.memo(({ data, timeRange, isExpanded }) => {
  
  // Shared Props for Axes
  const xAxisProps = {
    dataKey: "time",
    stroke: "#94a3b8",
    fontSize: isExpanded ? 12 : 10,
    tickLine: false,
    axisLine: false,
    minTickGap: 30,
    tickFormatter: (str) => {
       if(!str) return '';
       const d = new Date(str);
       return (timeRange === '7d' || timeRange === '30d') 
         ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
         : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  };

  const yAxisProps = {
    stroke: "#94a3b8",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
    tickFormatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
  };

  // UPDATED TOOLTIP PROPS
  const tooltipProps = {
    contentStyle: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' },
    itemStyle: { color: '#fff' },
    // LOGIC CHANGE HERE:
    labelFormatter: (l) => {
        if (!l) return '';
        const d = new Date(l);
        
        // If viewing 24h, show Time. Otherwise (7d, 30d, Custom), show only Date.
        if (timeRange === '24h') {
            return d.toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
        }
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {isExpanded ? (
        // --- EXPANDED VIEW: BAR CHART ---
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...tooltipProps} cursor={{ fill: '#1e293b', opacity: 0.5 }} />
          <Bar dataKey="count" fill="#005686" radius={[4, 4, 0, 0]} barSize={timeRange === '24h' ? 20 : undefined} />
        </BarChart>
      ) : (
        // --- MINIMIZED VIEW: AREA CHART ---
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#005686" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#005686" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip {...tooltipProps} cursor={{ stroke: '#005686', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="count" stroke="#005686" fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
});

export const ServiceHealthChart = React.memo(({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} dy={10} />
        <YAxis yAxisId="left" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis yAxisId="right" orientation="right" stroke="#10b981" tickLine={false} axisLine={false} fontSize={12} domain={['auto', 100]} unit="%" />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar yAxisId="left" dataKey="total" name="Log Volume" fill="#005686" barSize={40} radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="health" name="Health Score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
));

export const SeverityChart = React.memo(({ data, isExpanded }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie 
        data={data} cx="50%" cy="50%" 
        innerRadius={isExpanded ? 120 : 80} 
        outerRadius={isExpanded ? 160 : 110} 
        paddingAngle={5} dataKey="value" stroke="none"
      >
        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
      </Pie>
      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
      {isExpanded && <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />}
    </PieChart>
  </ResponsiveContainer>
));

export const Heatmap = React.memo(({ data }) => {
    const localData = useMemo(() => processHeatmapData(data), [data]);
    
    const allValues = localData.flatMap(d => d.hours);
    const maxVal = Math.max(...allValues, 1);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex justify-between items-end mb-2 px-1">
                 <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                    Past 7 Days (Local Time)
                </span>
                <div className="flex items-center gap-2 text-[9px] text-slate-500">
                    <span>Less</span>
                    <div className="flex gap-[1px]">
                        {[0.2, 0.4, 0.6, 0.8, 1].map(op => (
                            <div key={op} className="w-2 h-2 bg-[#0ea5e9]" style={{ opacity: op }} />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex mb-1 ml-10 text-[10px] text-slate-500">
                {[0, 6, 12, 18].map(h => (
                    <div key={h} className="flex-1 text-left border-l border-slate-800 pl-1">
                        {h}:00
                    </div>
                ))}
                <div className="w-4"></div> 
            </div>

            <div className="flex-1 flex flex-col justify-between gap-[2px]">
                {localData.map((row) => (
                    <div key={row.day} className="flex items-center gap-2 h-full">
                        <span className="w-8 text-xs font-semibold text-slate-400 text-right">
                            {row.day}
                        </span>

                        <div className="flex-1 flex gap-[2px] h-full">
                            {row.hours.map((val, i) => {
                                const opacity = val === 0 ? 0.05 : Math.max(0.15, (val / maxVal));

                                return (
                                    <div 
                                        key={i} 
                                        className="flex-1 relative group/cell rounded-[1px] transition-all duration-200"
                                        style={{ 
                                            backgroundColor: '#0ea5e9', 
                                            opacity: opacity
                                        }}
                                    >
                                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block min-w-[120px]">
                                            <div className="bg-slate-900 text-slate-200 text-[10px] p-2 rounded border border-slate-700 shadow-2xl whitespace-nowrap">
                                                <div className="font-bold text-white mb-1 border-b border-slate-700 pb-1">
                                                    {row.day} @ {i}:00 - {i + 1}:00
                                                </div>
                                                <div className="flex justify-between items-center gap-4">
                                                    <span>Volume:</span>
                                                    <span className="font-mono text-[#38bdf8] font-bold">{val.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-700 absolute left-1/2 -translate-x-1/2"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});