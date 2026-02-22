// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Bell, Sun, Moon, LogOut, User, ChevronDown,
  Wallet, ClipboardList, Home, Utensils, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 1px 0 var(--border-color)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/student/home" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand text-white font-bold text-sm select-none">
            C
          </div>
          <span className="font-display font-bold text-base hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            Campus <span className="gradient-text">Cravings</span>
          </span>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-ghost btn-icon rounded-xl"
            aria-label="Toggle theme"
          >
            {isDark
              ? <Sun size={18} className="text-amber-400" />
              : <Moon size={18} />
            }
          </button>

          {/* Cart */}
          <Link to="/student/cart" className="btn-ghost btn-icon relative rounded-xl" aria-label="Cart">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-brand-gradient text-white text-2xs font-bold
                               flex items-center justify-center shadow-brand-sm animate-scale-in">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(p => !p)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:bg-elevated"
              style={{ background: profileOpen ? 'var(--bg-elevated)' : undefined }}
            >
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-xs shadow-brand-sm select-none">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                  : initials
                }
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="text-2xs" style={{ color: 'var(--text-muted)' }}>
                  Student
                </span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden animate-scale-in z-50"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>

                {/* Links */}
                {[
                  { icon: User,          label: 'Profile',  to: '/student/profile' },
                  { icon: Wallet,        label: 'Wallet',   to: '/student/wallet' },
                  { icon: ClipboardList, label: 'Orders',   to: '/student/orders' },
                ].map(({ icon: Icon, label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-elevated transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                ))}

                <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }} />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
