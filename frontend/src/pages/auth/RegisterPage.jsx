// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Building2, Lock, CheckCircle2, GraduationCap, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universityAPI } from '../../services/api';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student',      Icon: GraduationCap, desc: 'Order food from campus canteens'        },
  { value: 'owner',   label: 'Canteen Owner', Icon: Store,          desc: 'Manage your canteen and menu'          },
];

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', university_id: '', phone: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    universityAPI.getAll({ status: 'active', limit: 100 })
      .then(({ data }) => setUniversities(data.data))
      .catch(() => {});
  }, []);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email address';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    if (form.role === 'student' && !form.university_id) e.university_id = 'Please select your university';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await register({
      name: form.name, email: form.email, password: form.password,
      role: form.role, university_id: form.university_id || undefined, phone: form.phone,
    });
    if (result.success) {
      if (result.role === 'owner') navigate('/owner/dashboard');
      else navigate('/student/home');
    }
  };

  const InputRow = ({ id, label, icon: Icon, error, children }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />}
        {children}
      </div>
      {error && <p className="form-error"><span>⚠</span> {error}</p>}
    </div>
  );

  return (
    <div className="min-h-dvh flex" style={{ background: 'var(--bg-base)' }}>

      {/* ── LEFT PANEL ───────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col overflow-hidden"
           style={{ background: 'var(--bg-surface)' }}>

        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-25 blur-[90px]"
             style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15 blur-[80px]"
             style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand text-white font-bold text-xl">C</div>
            <div>
              <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Campus Cravings</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your campus food, simplified</p>
            </div>
          </div>

          {/* Hero content */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div>
              <h2 className="text-4xl xl:text-5xl font-display font-extrabold leading-tight tracking-tight"
                  style={{ color: 'var(--text-primary)' }}>
                Your campus food<br />
                <span className="gradient-text">experience starts here.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Join thousands of students who already order smarter. Set up your account in under a minute.
              </p>
            </div>

            <div className="space-y-3">
              {[
                ['🎓', 'Student', 'Order from any canteen on campus with a wallet you control'],
                ['🏪', 'Canteen Owner', 'List your menu, manage orders, and track earnings — all in one place'],
              ].map(([icon, role, desc]) => (
                <div key={role} className="flex items-start gap-3 p-4 rounded-xl border animate-slide-up"
                     style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{role}</p>
                    <p className="text-xs leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              Free to use — no hidden charges
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 Campus Cravings. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full py-10 px-6 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px]">

            {/* Mobile brand */}
            <div className="lg:hidden text-center mb-8 animate-fade-in">
              <div className="inline-flex w-12 h-12 rounded-xl bg-brand-gradient items-center justify-center text-white font-bold text-xl shadow-brand mb-3">C</div>
              <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Campus Cravings</h1>
            </div>

            <div className="mb-6 animate-fade-in">
              <h2 className="text-2xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Create your account
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Get started in less than a minute</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" noValidate>

              {/* Role */}
              <div className="form-group">
                <label className="form-label">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(({ value, label, Icon, desc }) => (
                    <button key={value} type="button" onClick={() => set('role', value)}
                            className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border text-left transition-all ${
                              form.role === value
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'hover:border-indigo-400/40'
                            }`}
                            style={{ borderColor: form.role === value ? '#6366f1' : 'var(--border-color)' }}>
                      <Icon size={16} style={{ color: form.role === value ? '#6366f1' : 'var(--text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: form.role === value ? '#6366f1' : 'var(--text-primary)' }}>{label}</p>
                      <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <InputRow id="name" label="Full Name" icon={User} error={errors.name}>
                <input id="name" type="text" placeholder="John Doe" value={form.name}
                       onChange={e => set('name', e.target.value)}
                       className={`input pl-10 ${errors.name ? 'border-rose-500/60' : ''}`} />
              </InputRow>

              {/* Email */}
              <InputRow id="email" label="Email Address" icon={Mail} error={errors.email}>
                <input id="email" type="email" placeholder="you@university.edu" value={form.email}
                       onChange={e => set('email', e.target.value)}
                       className={`input pl-10 ${errors.email ? 'border-rose-500/60' : ''}`} />
              </InputRow>

              {/* Phone */}
              <InputRow id="phone" label="Phone (optional)" icon={Phone}>
                <input id="phone" type="tel" placeholder="+91 99999 99999" value={form.phone}
                       onChange={e => set('phone', e.target.value)} className="input pl-10" />
              </InputRow>

              {/* University — students only */}
              {form.role === 'student' && (
                <InputRow id="university_id" label="University" icon={Building2} error={errors.university_id}>
                  <select id="university_id" value={form.university_id}
                          onChange={e => set('university_id', e.target.value)}
                          className={`input pl-10 ${errors.university_id ? 'border-rose-500/60' : ''}`}>
                    <option value="">Select your university...</option>
                    {universities.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </InputRow>
              )}

              {/* Password */}
              <InputRow id="password" label="Password" icon={Lock} error={errors.password}>
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters"
                       value={form.password} onChange={e => set('password', e.target.value)}
                       className={`input pl-10 pr-11 ${errors.password ? 'border-rose-500/60' : ''}`} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded-lg" aria-label="toggle">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </InputRow>

              {/* Confirm */}
              <InputRow id="confirmPassword" label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                       value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                       className={`input pl-10 pr-11 ${errors.confirmPassword ? 'border-rose-500/60' : ''}`} />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded-lg" aria-label="toggle">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </InputRow>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {form.role === 'owner' ? 'Register as Owner' : 'Create Account'}
                    <ArrowRight size={16} />
                  </span>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            </div>

            <Link to="/login" className="btn-secondary w-full justify-center py-3">Sign in instead</Link>

            <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
              By registering you agree to our{' '}
              <a href="#" className="underline underline-offset-2 hover:text-indigo-500 transition-colors">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
