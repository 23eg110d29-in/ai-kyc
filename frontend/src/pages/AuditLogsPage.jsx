import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Activity, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

const AuditLogsPage = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/admin/logs?limit=100');
      setLogs(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  const getActionStyle = (action) => {
    if (action?.includes('FAILED')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (action?.includes('COMPLETED') || action?.includes('LOGIN')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (action?.includes('STARTED') || action?.includes('UPLOADED')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-10">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Audit Logs</h1>
          <p className="text-muted-foreground text-lg">Recent security and verification activity.</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-blue-500">
          <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <FileText className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Logs</p>
            <h3 className="text-3xl font-black text-white">{logs.length}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-emerald-500">
          <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Latest Action</p>
            <h3 className="text-lg font-black text-white truncate max-w-[220px]">{logs[0]?.action || 'None'}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[1.5rem] flex items-center gap-5 border-l-4 border-l-purple-500">
          <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <Activity className="h-7 w-7 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Audit Status</p>
            <h3 className="text-3xl font-black text-emerald-400">Live</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4 rounded-tr-xl">Resource</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5 text-muted-foreground whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide whitespace-nowrap ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-white/90">{log.details}</td>
                    <td className="px-6 py-5 text-white/70 font-mono text-xs">{log.user_id || 'N/A'}</td>
                    <td className="px-6 py-5 text-white/70">
                      {log.resource_type || 'N/A'}
                      {log.resource_id ? <span className="block font-mono text-xs text-muted-foreground mt-1">{log.resource_id}</span> : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
