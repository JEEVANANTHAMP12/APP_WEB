// @ts-nocheck
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Utensils, ShoppingBag, ClipboardList, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const NAV = [
  { to: '/student/home',     icon: Home,         label: 'Home'    },
  { to: '/student/canteens', icon: Utensils,     label: 'Canteens'},
  { to: '/student/cart',     icon: ShoppingBag,  label: 'Cart'    },
  { to: '/student/orders',   icon: ClipboardList,label: 'Orders'  },
  { to: '/student/profile',  icon: User,         label: 'Profile' },
];

const StudentLayout = () => {
  const { cartCount } = useCart();

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Main scrollable content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div className="flex items-stretch h-16 px-2">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 text-2xs font-semibold
                 rounded-xl mx-0.5 my-1 transition-all duration-200
                 ${isActive
                   ? 'text-indigo-400'
                   : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <div className="absolute inset-0 rounded-lg bg-indigo-500/12 scale-125" />
                    )}
                    <div className="relative">
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                      {label === 'Cart' && cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-2xs font-bold flex items-center justify-center">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default StudentLayout;
