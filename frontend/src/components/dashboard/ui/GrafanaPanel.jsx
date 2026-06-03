import React from 'react';

const GrafanaPanel = ({ src, title, height = "100%" }) => {
  return (
    <div className="w-full h-full bg-[#1e293b] border border-slate-700 rounded-xl overflow-hidden flex flex-col relative group">
       {/* Overlay to prevent hijacking scroll interactions */}
      <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-[#005686]/30 transition-all rounded-xl z-10"></div>
      
      <iframe
        src={src}
        width="100%"
        height={height}
        frameBorder="0"
        title={title}
        className="absolute inset-0 w-full h-full"
      ></iframe>
    </div>
  );
};

export default GrafanaPanel;