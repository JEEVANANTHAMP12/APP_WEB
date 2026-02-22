// @ts-nocheck
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Utensils, ClipboardList, DollarSign,
  Users, QrCode, Store, Menu, X, Sun, Moon, LogOut,
  ChevronRight, Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/orders',    icon: ClipboardList,   label: 'Orders'    },
  { to: '/owner/menu',      icon: Utensils,        label: 'Menu'      },
  { to: '/owner/earnings',  icon: DollarSign,      label: 'Earnings'  },
  { to: '/owner/staff',     icon: Users,           label: 'Staff'     },
  { to: '/owner/qr-verify', icon: QrCode,          label: 'QR Verify' },
  { to: '/owner/profile',   icon: Store,           label: 'Profile'   },
];

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold shadow-brand">
            C
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-none" style={{ color: 'var(--text-primary)' }}>
              Campus<span className="gradient-text"> Cravings</span>
            </p>
            <p className="text-2xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Owner Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost btn-icon lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-2xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
          Management
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} strokeWidth={1.75} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background: 'var(--bg-elevated)' }}>
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
              : initials
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-2xs truncate" style={{ color: 'var(--text-muted)' }}>Canteen Owner</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
};

const OwnerLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg-base)' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col lg:hidden
                       border-r animate-slide-left"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              padding: '1.5rem 1rem',
            }}
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost btn-icon lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="font-display font-bold text-sm lg:hidden flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-xs">C</div>
              Cravings
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost btn-icon" aria-label="Toggle theme">
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
