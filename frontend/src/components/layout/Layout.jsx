import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, ShieldCheck } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-background font-sans relative overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#0a0f1c]/80 backdrop-blur-3xl flex flex-col z-20 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-primary">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">AI KYC</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 ml-2">Main Menu</div>
          
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold ${isActive('/admin') && !isActive('/admin/logs') ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/20 shadow-glow-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                <LayoutDashboard className="h-5 w-5" /> Admin Panel
              </Link>
              <Link to="/admin/logs" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold ${isActive('/admin/logs') ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/20 shadow-glow-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                <FileText className="h-5 w-5" /> Audit Logs
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-bold ${isActive('/dashboard') ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border border-primary/20 shadow-glow-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
              <LayoutDashboard className="h-5 w-5" /> My Verifications
            </Link>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4 px-4 py-3 mb-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-glow-primary">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.username}</p>
              <p className="text-xs text-primary font-medium tracking-wide truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-transparent transition-all text-sm font-bold text-muted-foreground"
          >
            <LogOut className="h-4 w-4" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-transparent relative z-10">
        <div className="p-10 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
