import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'staff' | 'admin';
  canteen_id?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  token?: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar = () => {
  const auth = useAuth() as AuthContextType | null;
  const theme = useTheme() as ThemeContextType | null;
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});
  const isDark = theme?.isDark || false;
  const toggleTheme = theme?.toggleTheme || (() => {});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: React.MouseEvent<Document> | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handler = (e: any) => handleClick(e);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  const getRoleLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'student':
        return '/student/home';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm dark:shadow-2xl dark:shadow-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={getRoleLink()}
            className="flex items-center space-x-3 group"
          >
            <div className="relative w-11 h-11 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/50 group-hover:shadow-orange-500/70 group-hover:scale-110 transition-all duration-300">
              🍽️
            </div>
            <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Campus Cravings
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {user && (
              <Link
                to={getRoleLink()}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                Dashboard
              </Link>
            )}

            {user?.role === 'student' && (
              <>
                <Link
                  to="/student/canteens"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  Browse
                </Link>
                <Link
                  to="/student/cart"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  Cart
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 active:scale-95"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-gray-200 dark:border-gray-700 py-2 animate-fade-in backdrop-blur-sm bg-white/95 dark:bg-slate-800/95">
                    <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      {user.role === 'owner' ? '🏪 Owner' : user.role === 'admin' ? '🔐 Admin' : '👨‍🎓 Student'}
                    </div>
                    <Link
                      to="/student/profile"
                      className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 font-medium flex items-center gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span>👤</span> Profile
                    </Link>
                    {user.role === 'student' && (
                      <Link
                        to="/student/wallet"
                        className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 font-medium flex items-center gap-2"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span>💳</span> Wallet
                      </Link>
                    )}
                    <Link
                      to="/student/orders"
                      className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 font-medium flex items-center gap-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span>📦</span> Orders
                    </Link>
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 font-medium flex items-center gap-2"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-200 font-medium hidden sm:inline-block hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-down">
            {user && (
              <Link
                to={getRoleLink()}
                className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {user?.role === 'student' && (
              <>
                <Link
                  to="/student/canteens"
                  className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Canteens
                </Link>
                <Link
                  to="/student/cart"
                  className="block px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
