// @ts-nocheck
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, QrCode, Utensils, Menu, X, Sun, Moon, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { to: '/staff/orders',    icon: ClipboardList, label: 'Live Orders' },
  { to: '/staff/qr-verify', icon: QrCode,        label: 'QR Verify'  },
  { to: '/staff/menu',      icon: Utensils,      label: 'Menu Items' },
];

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const canteenName = (typeof user?.canteen_id === 'object' ? user?.canteen_id?.name : null) || 'Campus Cravings';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
               style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
            <UserCog size={18} />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>
              Staff <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Panel</span>
            </p>
            <p className="text-2xs mt-0.5 truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>{canteenName}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost btn-icon lg:hidden"><X size={18} /></button>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-2xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
          Operations
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} strokeWidth={1.75} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background: 'var(--bg-elevated)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
               style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-2xs" style={{ color: 'var(--text-muted)' }}>Staff Member</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
};

const StaffLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg-base)' }}>
      <aside className="hidden lg:flex sidebar">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
               onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col lg:hidden border-r animate-slide-left"
                 style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', padding: '1.5rem 1rem' }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="btn-ghost btn-icon lg:hidden"><Menu size={20} /></button>
            <div className="font-display font-bold text-sm lg:hidden flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <UserCog size={17} className="text-sky-500" /> Staff Panel
            </div>
          </div>
          <button onClick={toggleTheme} className="btn-ghost btn-icon">
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
