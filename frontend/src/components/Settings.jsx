import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Users, FileText, Bell, Lock, Plus, Trash2, 
  CheckCircle, AlertTriangle, Globe, Save, Loader2, X 
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('keys');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data State
  const [apiKeys, setApiKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ slack_webhook: '' });

  // Form State
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');

  // --- FETCH DATA ---
  const fetchData = async (endpoint, setter) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setter(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'keys') fetchData('apikeys', setApiKeys);
    if (activeTab === 'users') fetchData('users', setUsers);
    if (activeTab === 'audit') fetchData('audit-logs', setAuditLogs);
    if (activeTab === 'alerts') fetchData('alerts', setAlertConfig);
  }, [activeTab]);

  const showNotify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- ACTIONS ---

  // 1. API KEYS
  const handleCreateKey = async () => {
    if (!newKeyName) return;
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://127.0.0.1:8000/settings/apikeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newKeyName, scope: 'Read/Write' })
    });
    if (res.ok) {
      fetchData('apikeys', setApiKeys);
      setShowAddKey(false);
      setNewKeyName('');
      showNotify("API Key Generated");
    }
  };

  const handleDeleteKey = async (id) => {
    if(!window.confirm("Revoke this API key? This cannot be undone.")) return;
    const token = localStorage.getItem('access_token');
    await fetch(`http://127.0.0.1:8000/settings/apikeys/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData('apikeys', setApiKeys);
    showNotify("API Key Revoked");
  };

  // 2. USERS
  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    const token = localStorage.getItem('access_token');
    const res = await fetch('http://127.0.0.1:8000/settings/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole })
    });
    if (res.ok) {
      fetchData('users', setUsers);
      setShowInvite(false);
      setInviteEmail('');
      showNotify("User Invited");
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Remove this user?")) return;
    const token = localStorage.getItem('access_token');
    await fetch(`http://127.0.0.1:8000/settings/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData('users', setUsers);
    showNotify("User Removed");
  };

  // 3. ALERTS
  const handleSaveAlerts = async () => {
    const token = localStorage.getItem('access_token');
    await fetch('http://127.0.0.1:8000/settings/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(alertConfig)
    });
    showNotify("Configuration Saved");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 overflow-y-auto font-sans transition-colors duration-200 p-8 relative">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-6 right-6 bg-[#005686] text-white px-4 py-2 rounded shadow-lg animate-in slide-in-from-top-2 z-50 flex items-center gap-2">
          <CheckCircle size={16} /> {notification}
        </div>
      )}

      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white transition-colors">
            <Shield className="text-[#005686]" size={32} /> Organization Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Manage your API keys, access control, and system alerts.</p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4 transition-colors">
          <TabButton icon={<Key size={16} />} label="API Keys" active={activeTab === 'keys'} onClick={() => setActiveTab('keys')} />
          <TabButton icon={<Users size={16} />} label="Access Control" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <TabButton icon={<FileText size={16} />} label="Audit Logs" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
          <TabButton icon={<Bell size={16} />} label="Alerts & Webhooks" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
        </div>

        {/* MAIN CONTENT */}
        <main className="min-h-[400px]">
          {loading && activeTab !== 'alerts' ? (
             <div className="flex items-center justify-center h-64 text-slate-400 gap-2"><Loader2 className="animate-spin" /> Loading data...</div>
          ) : (
             <>
             {/* --- TAB: API KEYS --- */}
             {activeTab === 'keys' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">API Access Tokens</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Manage ingestion keys for your collectors.</p>
                    </div>
                    <button onClick={() => setShowAddKey(true)} className="flex items-center gap-2 bg-[#005686] hover:bg-[#00446b] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md">
                      <Plus size={16} /> Generate New Key
                    </button>
                  </div>

                  {/* ADD KEY FORM */}
                  {showAddKey && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center gap-4 animate-in fade-in">
                       <input 
                         type="text" 
                         placeholder="Enter key name (e.g. 'Staging Agent')" 
                         className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none"
                         value={newKeyName}
                         onChange={(e) => setNewKeyName(e.target.value)}
                         autoFocus
                       />
                       <button onClick={handleCreateKey} className="bg-[#005686] text-white px-4 py-2 rounded font-bold text-sm">Create</button>
                       <button onClick={() => setShowAddKey(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
                    </div>
                  )}

                  <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#005686] text-white border-b border-[#00446b] uppercase text-xs font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Token Name</th>
                          <th className="px-6 py-4">Scope</th>
                          <th className="px-6 py-4">Last Used</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {apiKeys.map(key => (
                          <tr key={key.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900 dark:text-white">{key.name}</div>
                              <div className="font-mono text-xs text-slate-500 mt-0.5">{key.id}••••</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-600">{key.scope}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                               <Globe size={14} /> {key.last_used || 'Never'}
                            </td>
                            <td className="px-6 py-4">
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                                 <CheckCircle size={12} /> {key.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleDeleteKey(key.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {apiKeys.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No API keys found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
             )}

             {/* --- TAB: ACCESS CONTROL --- */}
             {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Team Members</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Manage who can access logs and configure settings.</p>
                    </div>
                    <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-300 dark:border-slate-600 shadow-sm">
                      <Plus size={16} /> Invite Member
                    </button>
                  </div>

                  {/* INVITE FORM */}
                  {showInvite && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4 animate-in fade-in">
                       <input 
                         type="email" 
                         placeholder="colleague@company.com" 
                         className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0f172a] focus:outline-none min-w-[200px]"
                         value={inviteEmail}
                         onChange={(e) => setInviteEmail(e.target.value)}
                       />
                       <select 
                         className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0f172a] focus:outline-none"
                         value={inviteRole}
                         onChange={(e) => setInviteRole(e.target.value)}
                       >
                         <option value="Viewer">Viewer</option>
                         <option value="Editor">Editor</option>
                         <option value="Admin">Admin</option>
                       </select>
                       <button onClick={handleInviteUser} className="bg-[#005686] text-white px-4 py-2 rounded font-bold text-sm">Send Invite</button>
                       <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
                    </div>
                  )}

                  <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-[#005686] text-white border-b border-[#00446b] uppercase text-xs font-bold tracking-wider">
                          <tr>
                              <th className="px-6 py-4">User</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">MFA Status</th>
                              <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {users.map(user => (
                              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                                  <div className="text-slate-500 text-xs">{user.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                   <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-xs">{user.role}</span>
                              </td>
                              <td className="px-6 py-4">
                                  {user.mfa ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs font-bold"><CheckCircle size={14} /> Enabled</span>
                                  ) : (
                                      <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1.5 text-xs font-bold"><AlertTriangle size={14} /> Disabled</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                   {user.id !== 1 && (
                                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 text-xs hover:underline">Remove</button>
                                   )}
                              </td>
                              </tr>
                          ))}
                          </tbody>
                      </table>
                  </div>
                </div>
             )}

             {/* --- TAB: AUDIT LOGS --- */}
             {activeTab === 'audit' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Audit Logs</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time record of all administrative actions in the system.</p>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-[#1e293b] shadow-sm transition-colors">
                      {auditLogs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 italic">No audit logs found. Try performing some actions!</div>
                      ) : (
                        auditLogs.map((log, i) => (
                          <div key={log.id} className={`flex items-center justify-between p-4 ${i !== auditLogs.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                              <div className="flex items-center gap-4">
                                   <div className={`p-2 rounded-full transition-colors ${log.action.includes('Revoke') || log.action.includes('Remove') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                        {log.action.includes('Key') ? <Key size={16} /> : log.action.includes('User') ? <Users size={16} /> : <FileText size={16} />}
                                   </div>
                                   <div>
                                       <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            <span className="font-bold text-slate-900 dark:text-white">{log.user || 'System'}</span> performed <span className="font-bold text-[#005686]">{log.action}</span> on {log.target}
                                       </div>
                                       <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                            <span>IP: {log.ip || '127.0.0.1'}</span> • <span>{new Date(log.time).toLocaleString()}</span>
                                       </div>
                                   </div>
                              </div>
                          </div>
                      ))
                      )}
                  </div>
               </div>
             )}

             {/* --- TAB: ALERTS --- */}
             {activeTab === 'alerts' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white">Alerting Endpoints</h3>
                       <p className="text-slate-500 dark:text-slate-400 mt-1">Configure external webhooks for severe incident reporting.</p>
                   </div>
                   <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4 shadow-sm transition-colors">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slack Webhook URL</label>
                           <input 
                             type="text" 
                             value={alertConfig.slack_webhook} 
                             onChange={(e) => setAlertConfig({...alertConfig, slack_webhook: e.target.value})}
                             placeholder="https://hooks.slack.com/services/..." 
                             className="w-full max-w-2xl bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-300 focus:outline-none focus:border-[#005686] font-mono text-sm" 
                           />
                       </div>
                       <div className="pt-2">
                           <button onClick={handleSaveAlerts} className="flex items-center gap-2 bg-[#005686] hover:bg-[#00446b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md">
                               <Save size={16} /> Save Configuration
                           </button>
                       </div>
                   </div>
                </div>
             )}
             </>
          )}

        </main>
      </div>
    </div>
  );
}

// --- LOCAL TAB COMPONENT ---
function TabButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-[#005686] text-white shadow-md shadow-blue-900/20' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}