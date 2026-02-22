// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Clock, Wallet, Radio, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FEATURES = [
  { icon: Clock,  title: 'Skip the queue',   desc: 'Order ahead, pick up when ready'       },
  { icon: Wallet, title: 'Campus Wallet',     desc: 'Top up once, pay instantly every time' },
  { icon: Radio,  title: 'Live tracking',     desc: 'Real-time updates on every order'      },
  { icon: Store,  title: 'Multi-canteen',     desc: 'Every canteen on your campus'          },
];

const STATS = [
  { value: '10K+', label: 'Students' },
  { value: '50+',  label: 'Canteens' },
  { value: '4.8★', label: 'Rating'   },
];

const LogoMark = ({ size = 44 }) => (
  <div
    className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
    style={{
      width: size, height: size,
      fontSize: size * 0.45,
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    }}
  >
    C
  </div>
);

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

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
    if (result?.success) {
      const from = location.state?.from?.pathname;
      if (result.role === 'admin')  navigate('/admin/dashboard');
      else if (result.role === 'owner') navigate('/owner/dashboard');
      else if (result.role === 'staff') navigate('/staff/orders');
      else navigate(from || '/student/home');
    }
  };

  return (
    <div className="min-h-dvh flex" style={{ background: 'var(--bg-base)' }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col overflow-hidden"
           style={{ background: 'var(--bg-surface)' }}>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-[100px] pointer-events-none"
             style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-[80px] pointer-events-none"
             style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-14">
          <div className="flex items-center gap-3 animate-fade-in">
            <LogoMark size={40} />
            <div>
              <p className="font-display font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>Campus Cravings</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your campus food, simplified</p>
            </div>
          </div>

          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border"
                   style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.25)' }}>
                <Sparkles size={11} />
                Trusted by 10,000+ students
              </div>
              <h2 className="text-4xl xl:text-5xl font-display font-extrabold leading-[1.12] tracking-tight"
                  style={{ color: 'var(--text-primary)' }}>
                Order smart,<br />
                <span className="gradient-text">eat better.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Skip queues and get your favourite campus meals ready for pick-up.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="rounded-2xl p-4 border animate-slide-up"
                       style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)', animationDelay: `${160 + i * 55}ms` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                         style={{ background: 'rgba(79,70,229,0.12)' }}>
                      <Icon size={15} style={{ color: '#818cf8' }} />
                    </div>
                    <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                );
              })}
            </div>

            <div
              className="grid grid-cols-3 pt-6 mt-2"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 px-4 first:pl-0 last:pr-0 last:border-r-0"
                     style={{ borderRight: '1px solid var(--border-color)' }}
                >
                  <p
                    className="text-3xl font-display font-black tabular-nums leading-none"
                    style={{
                      background: 'linear-gradient(135deg,#c7d2fe,#a5b4fc,#818cf8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >{value}</p>
                  <p className="text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Campus Cravings · All rights reserved
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-14 xl:px-20">
        <div className="w-full max-w-[380px]">

          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10 animate-fade-in">
            <LogoMark size={56} />
            <div className="text-center">
              <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Campus Cravings</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your campus food, simplified</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 animate-fade-in">
            <h2
              className="font-display font-extrabold tracking-tight leading-[1.1]"
              style={{ fontSize: '2.25rem', color: 'var(--text-primary)' }}
            >
              Welcome back! <span className="wave">👋</span>
            </h2>
            <p className="mt-2 text-[0.9375rem]" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your account to continue enjoying your campus meals. We've missed you!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="animate-slide-up space-y-5">
            <div className="form-group mb-0">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                     style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  className={`input pl-10 ${errors.email ? 'border-rose-500/60' : ''}`}
                />
              </div>
              {errors.email && <p className="form-error"><span>⚠</span> {errors.email}</p>}
            </div>

            <div className="form-group mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label" htmlFor="login-password">Password</label>
                <a href="#" className="text-xs font-medium transition-colors hover:text-indigo-400"
                   style={{ color: 'var(--text-muted)' }}>Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                     style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your secure password"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  className={`input pl-10 pr-11 ${errors.password ? 'border-rose-500/60' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error"><span>⚠</span> {errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-7 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs whitespace-nowrap font-medium" style={{ color: 'var(--text-muted)' }}>Don't have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          <Link to="/register" className="btn-secondary w-full py-3">Create your account</Link>

          <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            By signing in you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-indigo-400 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline underline-offset-2 hover:text-indigo-400 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;