import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Users, FileSearch, AlertTriangle, Activity, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const getPieData = () => {
    if (!stats || !stats.status_distribution) return [];
    return Object.keys(stats.status_distribution).map(key => ({
      name: key.replace('_', ' '),
      value: stats.status_distribution[key]
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse flex flex-col items-center gap-4 text-primary">
        <Sparkles className="h-8 w-8" />
        <p className="font-medium text-lg">Loading AI Insights...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">System Overview</h1>
          <p className="text-muted-foreground text-lg">Real-time metrics from the KYC multi-agent pipeline.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-purple-500 hover:-translate-y-1 transition-transform group">
          <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:shadow-glow-accent transition-shadow">
            <Users className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
            <h3 className="text-3xl font-black text-white">{stats?.total_users || 0}</h3>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform group">
          <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:shadow-glow-primary transition-shadow">
            <FileSearch className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Documents Verified</p>
            <h3 className="text-3xl font-black text-white">{stats?.total_documents || 0}</h3>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform group">
          <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center transition-shadow">
            <AlertTriangle className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Manual Reviews</p>
            <h3 className="text-3xl font-black text-white">{stats?.status_distribution?.MANUAL_REVIEW || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform group">
          <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center transition-shadow">
            <Activity className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">System Health</p>
            <h3 className="text-3xl font-black text-emerald-400">99.9%</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="glass-panel p-8 rounded-[2rem] h-[400px]">
          <h3 className="text-xl font-bold mb-6 text-white">Verification Outcomes</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getPieData()}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {getPieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(17,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] h-[400px]">
          <h3 className="text-xl font-bold mb-6 text-white">Verification Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getPieData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                contentStyle={{ backgroundColor: 'rgba(17,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel p-8 rounded-[2rem] mt-4">
        <h3 className="text-xl font-bold mb-6 text-white">Registered Identities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 rounded-tr-xl">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 font-bold text-white">{u.username}</td>
                  <td className="px-6 py-5 text-white/80">{u.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
