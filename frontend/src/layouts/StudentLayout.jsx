import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const navItems = [
  { to: '/student/home',     label: 'Home',     icon: '🏠', exact: true },
  { to: '/student/canteens', label: 'Canteens', icon: '🍽️' },
  { to: '/student/orders',   label: 'Orders',   icon: '📦' },
  { to: '/student/wallet',   label: 'Wallet',   icon: '💳' },
  { to: '/student/profile',  label: 'Profile',  icon: '👤' },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">

      {/* ── Top Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => navigate('/student/home')}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent hidden sm:block">
              Campus Cravings
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Cart pill */}
            <button
              onClick={() => navigate('/student/cart')}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
            >
              <span className="text-lg">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Avatar + name */}
            <button
              onClick={() => navigate('/student/profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden lg:block text-sm font-medium text-slate-300">{user?.name}</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              title="Logout"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              🚪
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white transition-all"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-slide-up">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            <div className="divider" />
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
            >
              <span className="text-lg">🚪</span> Logout
            </button>
          </div>
        )}
      </header>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Nav ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-orange-400' : 'text-slate-500 hover:text-white'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
          {/* Cart in bottom nav */}
          <button
            onClick={() => navigate('/student/cart')}
            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-white transition-all"
          >
            <span className="text-xl">🛒</span>
            <span className="text-[10px] font-medium">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

    </div>
  );
};

export default StudentLayout;
