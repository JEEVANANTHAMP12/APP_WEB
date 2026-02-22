// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: '?', title: 'Skip the queue',       desc: 'Order ahead, pick up when ready'         },
  { icon: '??', title: 'Campus Wallet',         desc: 'Top up once, pay instantly every time'   },
  { icon: '??', title: 'Live order tracking',   desc: 'Real-time updates on every order'        },
  { icon: '???', title: 'Multiple canteens',     desc: 'Every canteen on your campus'            },
];

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      const from = location.state?.from?.pathname;
      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'owner') navigate('/owner/dashboard');
      else if (result.role === 'staff') navigate('/staff/orders');
      else navigate(from || '/student/home');
    }
  };

  return (
    <div className="min-h-dvh flex" style={{ background: 'var(--bg-base)' }}>

      {/* -- LEFT PANEL -------------------------------------- */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden"
           style={{ background: 'var(--bg-surface)' }}>

        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-[100px]"
             style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-[80px]"
             style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand text-white font-bold text-xl">
              C
            </div>
            <div>
              <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Campus Cravings</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your campus food, simplified</p>
            </div>
          </div>

          {/* Hero */}
          <div className="space-y-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5
                              bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Sparkles size={12} />
                Trusted by 10,000+ students
              </div>
              <h2 className="text-5xl xl:text-6xl font-display font-extrabold leading-[1.1] tracking-tight"
                  style={{ color: 'var(--text-primary)' }}>
                Order smart,<br />
                <span className="gradient-text">eat better.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Skip the queue and get your favourite campus meals ready for pick-up.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <div key={f.title}
                     className="rounded-2xl p-4 border animate-slide-up"
                     style={{
                       background: 'var(--bg-elevated)',
                       borderColor: 'var(--border-color)',
                       animationDelay: `${150 + i * 60}ms`,
                     }}>
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-8">
              {[['10K+','Students served'],['50+','Canteens'],['4.8?','Avg rating']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-display font-black gradient-text">{v}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 Campus Cravings. All rights reserved.</p>
        </div>
      </div>

      {/* -- RIGHT PANEL ------------------------------------- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 xl:px-20">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10 animate-fade-in">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-gradient items-center justify-center text-white font-bold text-2xl shadow-brand mb-4">C</div>
            <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Campus Cravings</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your campus food, simplified</p>
          </div>

          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
                  className={`input pl-10 ${errors.email ? 'border-rose-500/60' : ''}`}
                />
              </div>
              {errors.email && <p className="form-error"><span>?</span> {errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: '' }); }}
                  className={`input pl-10 pr-11 ${errors.password ? 'border-rose-500/60' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded-lg"
                        aria-label="Toggle password">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error"><span>?</span> {errors.password}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>New here?</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          <Link to="/register" className="btn-secondary w-full justify-center py-3">
            Create your account
          </Link>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            By signing in you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-indigo-500 transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
