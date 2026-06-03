import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import Sidebar from './components/Sidebar';
import LiveLogs from './components/LiveLogs';
import Dashboard from './components/Dashboard';
// Removed Ingestion import
import Settings from './components/Settings';
import Login from './components/Login';

function App() {
  // 1. Initialize state based on whether a token is already saved
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // 2. Handler to update state when Login.jsx succeeds
  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('access_token'));
  };

  // 3. If there is no token, FORCE the Login screen
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 4. If authenticated, render the main application
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar stays persistent */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Scrollable Route Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<LiveLogs />} />
            {/* Removed Ingestion Route */}
            <Route path="/settings" element={<Settings />} />
            {/* Default redirect to Dashboard if unknown path */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;