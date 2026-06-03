import React from 'react';
import { Home, Activity, Settings, LogOut, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Activity, label: 'Live Logs', path: '/logs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/'; 
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#001433] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Header - Updated to Deep Blue Background with White Text */}
      <div className="h-16 flex items-center px-6 border-b border-[#00446b] bg-[#005686] transition-colors duration-200">
        <h1 className="text-lg font-bold text-white flex items-center gap-3 tracking-wide transition-colors">
          {/* Logo Icon - Changed to White/90 to be visible on blue */}
          <Compass className="text-white/90 fill-current" size={28} />
          <span>3DS<span className="font-light opacity-80">Observe</span></span>
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group
              ${isActive 
                ? 'bg-[#005686] text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#002a66] hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            {/* Icon inherits text color from parent */}
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#00112b] transition-colors duration-200">
        <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-900/30 border border-transparent p-2 rounded-lg transition-all group text-left"
            title="Sign Out"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#005686] to-[#003d60] flex items-center justify-center text-white font-bold shadow-lg border border-white/10">
            R
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate transition-colors">Rishabh</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Admin Workspace</p>
          </div>
          <LogOut size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </aside>
  );
}   