import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HIGHLIGHTS = [
  { icon: '⚡', title: 'Skip the queue', desc: 'Order ahead, pick up when it\'s ready', gradient: 'from-orange-500/20 to-red-500/20' },
  { icon: '💳', title: 'Campus Wallet', desc: 'Top up once, pay instantly every time', gradient: 'from-blue-500/20 to-cyan-500/20' },
  { icon: '🔔', title: 'Live order tracking', desc: 'Real-time status updates on every order', gradient: 'from-emerald-500/20 to-teal-500/20' },
  { icon: '🍽️', title: 'Multiple canteens', desc: 'Browse every canteen on your campus', gradient: 'from-violet-500/20 to-purple-500/20' },
];

const STATS = [
  { value: '10K+', label: 'Students served' },
  { value: '50+', label: 'Canteens onboard' },
  { value: '4.8★', label: 'Average rating' },
];

const EyeIcon = ({ open }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </>
    )}
  </svg>
);

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const validateForm = () => {
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
    if (!validateForm()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      const from = location.state?.from?.pathname;
      if (result.role === 'admin') navigate('/admin/dashboard');
      else if (['owner', 'staff'].includes(result.role)) navigate('/owner/dashboard');
      else navigate(from || '/student/home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── LEFT VISUAL PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/80 via-slate-900 to-slate-950" />

        {/* Ambient blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[60px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Brand */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/40">
                🍽️
              </div>
              <div>
                <p className="text-white font-bold text-xl tracking-tight">Campus Cravings</p>
                <p className="text-orange-400/80 text-xs font-medium">Your campus food, simplified</p>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div>
              <h2 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight">
                Order smart,<br />
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">eat better.</span>
              </h2>
              <p className="text-slate-400 text-lg mt-4 leading-relaxed max-w-sm">
                Skip the queue and get your favourite campus meals ready for pick-up.
              </p>
            </div>

            {/* Platform highlights */}
            <div className="grid grid-cols-2 gap-3">
              {HIGHLIGHTS.map((h, i) => (
                <div
                  key={h.title}
                  className={`flex flex-col gap-2 bg-gradient-to-br ${h.gradient} border border-white/10 rounded-2xl p-4 backdrop-blur-sm`}
                  style={{ animation: 'slide-up 0.5s ease both', animationDelay: `${150 + i * 60}ms` }}
                >
                  <span className="text-2xl">{h.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{h.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-snug">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex gap-6 pt-2">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 xl:px-16 relative overflow-hidden">
        {/* Subtle radial glow behind the form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile brand (only shown on small screens) */}
          <div className="lg:hidden text-center mb-10 animate-fade-in">
            <div className="inline-flex w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl items-center justify-center text-3xl shadow-lg shadow-orange-500/40 mb-4">
              🍽️
            </div>
            <h1 className="text-2xl font-black text-white">Campus Cravings</h1>
            <p className="text-slate-400 text-sm mt-1">Your campus food, simplified</p>
          </div>

          {/* Heading */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-slate-400 mt-1.5">Sign in to your account to continue</p>
          </div>

          {/* Form card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email address</label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  errors.email
                    ? 'border-red-500/60 bg-red-500/5'
                    : focused === 'email'
                    ? 'border-orange-500/60 bg-orange-500/5 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}>
                  <svg className={`absolute left-3.5 w-4.5 h-4.5 flex-shrink-0 transition-colors ${focused === 'email' || form.email ? 'text-orange-400' : 'text-slate-500'}`} style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    value={form.email}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                  errors.password
                    ? 'border-red-500/60 bg-red-500/5'
                    : focused === 'password'
                    ? 'border-orange-500/60 bg-orange-500/5 shadow-[0_0_0_3px_rgba(249,115,22,0.12)]'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}>
                  <svg className={`absolute left-3.5 flex-shrink-0 transition-colors ${focused === 'password' || form.password ? 'text-orange-400' : 'text-slate-500'}`} style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: '' }); }}
                    className="w-full pl-10 pr-12 py-3 bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative mt-2 group overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 font-bold text-white text-sm shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-orange-500/50 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-slate-600 text-xs">New to Campus Cravings?</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Register link */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/[0.06] hover:border-white/20 hover:text-white transition-all duration-200"
            >
              Create your account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">
            By signing in you agree to our{' '}
            <a href="#" className="text-slate-500 hover:text-slate-400 transition-colors underline underline-offset-2">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
