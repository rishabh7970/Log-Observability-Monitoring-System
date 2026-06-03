import React, { useState } from 'react';
import { Lock, User, ArrowRight, Loader, Compass, ShieldCheck } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // FIX: Use URLSearchParams for application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        // Helpful for debugging if it fails again
        const errorDetails = await response.json();
        console.error("Backend rejected the request:", errorDetails);
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess();
    } catch (err) {
      console.error("Login failed:", err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans bg-gradient-to-br from-[#001433] via-[#002a66] to-[#005686]">
      
      {/* Abstract Corporate Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#005686]/20 rounded-full blur-[120px]"></div>
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-[#001433]/60 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full shadow-2xl backdrop-blur-md">
                <Compass className="text-white" size={24} />
                <span className="text-white font-bold tracking-widest text-sm uppercase">3DEXPERIENCE <span className="font-light text-blue-200">ID</span></span>
            </div>
        </div>

        <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-blue-100 text-sm mt-2 font-light">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 text-blue-300" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg leading-5 bg-blue-900/40 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="admin"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 text-blue-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg leading-5 bg-blue-900/40 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                    <ShieldCheck size={16} />
                    <span>{error}</span>
                </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-[#001433] bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#001433] focus:ring-white shadow-lg transition-all hover:scale-[1.02]"
            >
              {loading ? <><Loader className="animate-spin" size={18} /> Verifying...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-blue-200/60 mt-8">© 2026 Dassault Systèmes. All rights reserved.</p>
      </div>
    </div>
  );
}