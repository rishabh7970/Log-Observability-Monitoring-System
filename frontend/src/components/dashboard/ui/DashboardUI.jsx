import React from 'react';
import { X } from 'lucide-react';

export const KpiCard = ({ title, value, icon, onClick, trend }) => (
  <div
    onClick={onClick}
    className={`relative p-5 rounded-xl border transition-all duration-200 group overflow-hidden
      bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700
      hover:border-slate-300 dark:hover:border-[#005686]/50
      ${onClick ? 'cursor-pointer hover:shadow-md' : 'shadow-sm'}
    `}
  >
    {/* Background accent hint */}
    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-50 dark:from-[#0f172a]/50 to-transparent transition-colors"></div>
    
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 transition-colors">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono transition-colors">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 transition-colors ${trend.includes('Alert') ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {trend}
          </p>
        )}
      </div>
      {/* Icon Container - Updated to Deep Blue Brand Color */}
      <div className="p-2 bg-[#005686] rounded-lg border border-[#00446b] text-white transition-colors shadow-sm">
        {React.cloneElement(icon, { className: "text-white" })}
      </div>
    </div>
  </div>
);

export const FocusModal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-slate-900/40 dark:bg-[#001433]/90 backdrop-blur-md transition-opacity" onClick={onClose}></div>
    
    {/* Modal Container */}
    <div className="relative bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
      
      {/* Modal Header - Updated to Deep Blue Background & White Text */}
      <div className="flex justify-between items-center p-6 border-b border-[#00446b] bg-[#005686] transition-colors shrink-0">
        <h3 className="text-xl font-bold text-white transition-colors">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      {/* Modal Body */}
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0f172a] transition-colors p-6">
        {children}
      </div>
    </div>
  </div>
);