// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, User, Mail, Phone, Building2, Lock,
  CheckCircle2, GraduationCap, ArrowRight, ArrowLeft,
  ShieldCheck, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universityAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';

// â”€â”€ Step indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const StepDot = ({ active, done, label, n }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
      style={{
        background: done ? '#10b981' : active ? '#6366f1' : 'var(--bg-elevated)',
        color: done || active ? '#fff' : 'var(--text-muted)',
        border: `2px solid ${done ? '#10b981' : active ? '#6366f1' : 'var(--border-color)'}`,
      }}
    >
      {done ? <CheckCircle2 size={14} /> : n}
    </div>
    <span className="text-xs font-medium" style={{ color: active ? '#6366f1' : 'var(--text-muted)' }}>{label}</span>
  </div>
);

// â”€â”€ OTP digit box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const OtpInput = ({ value, onChange, onKeyDown, inputRef, hasError }) => (
  <input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200"
    style={{
      background: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      borderColor: hasError ? '#ef4444' : value ? '#6366f1' : 'var(--border-color)',
      boxShadow: value ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
    }}
  />
);

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// -- InputRow --
const InputRow = ({ id, label, icon: Icon, error, children }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />}
      {children}
    </div>
    {error && <p className="form-error"><span>!</span> {error}</p>}
  </div>
);
const RegisterPage = () => {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', university_id: '', phone: '',
  });
  const [errors, setErrors] = useState({});
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => {
    universityAPI.getAll({ status: 'active', limit: 100 })
      .then(({ data }) => setUniversities(data.data))
      .catch(() => {});
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownRef.current = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(cooldownRef.current);
  }, [resendCooldown]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validateDetails = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email address';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!/[a-z]/.test(form.password)) e.password = 'Must include a lowercase letter';
    if (!/[A-Z]/.test(form.password)) e.password = 'Must include an uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Must include a number';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    if (form.role === 'student' && !form.university_id) e.university_id = 'Please select your university';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // Step 1 submit â€” send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateDetails()) return;
    setOtpLoading(true);
    try {
      await authAPI.sendOtp({ email: form.email, name: form.name.split(' ')[0] });
      toast.success('OTP sent — check your email');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setStep(2);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors(e => ({ ...e, email: msg }));
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    try {
      await authAPI.resendOtp({ email: form.email, name: form.name.split(' ')[0] });
      toast.success('New OTP sent — check your email');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP digit input handlers
  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    setOtpError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const next = paste.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtpDigits(next);
    setTimeout(() => otpRefs.current[Math.min(paste.length, 5)]?.focus(), 0);
  };

  // Step 2 submit â€” verify OTP + register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) { setOtpError('Please enter all 6 digits'); return; }
    setSubmitLoading(true);
    const result = await register({
      name: form.name, email: form.email, password: form.password,
      role: form.role, university_id: form.university_id || undefined,
      phone: form.phone || undefined, otp,
    });
    setSubmitLoading(false);
    if (result?.success) {
      navigate('/student/home');
    } else if (result?.message?.toLowerCase().includes('otp') || result?.message?.toLowerCase().includes('invalid')) {
      setOtpError(result.message || 'Invalid OTP');
    }
  };


  return (
    <div className="min-h-dvh flex" style={{ background: 'var(--bg-base)' }}>

      {/* â”€â”€ LEFT PANEL â”€â”€ */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col overflow-hidden"
           style={{ background: 'var(--bg-surface)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-25 blur-[90px]"
             style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-15 blur-[80px]"
             style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: 'radial-gradient(circle, var(--text-primary) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-14">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl"
                 style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>C</div>
            <div>
              <p className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Campus Cravings</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your campus food, simplified</p>
            </div>
          </div>

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

            <div className="flex items-start gap-3 p-4 rounded-xl border"
                 style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              <span className="text-xl"></span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Student</p>
                <p className="text-xs leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Order from any canteen on campus with a wallet you control
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              Free to use no hidden charges
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Â© 2026 Campus Cravings. All rights reserved.</p>
        </div>
      </div>

      {/* â”€â”€ RIGHT PANEL â”€â”€ */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full py-10 px-6 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px]">

            {/* Mobile brand */}
            <div className="lg:hidden text-center mb-8 animate-fade-in">
              <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-white font-bold text-xl shadow-lg mb-3"
                   style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>C</div>
              <h1 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>Campus Cravings</h1>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-4 mb-7 animate-fade-in">
              <StepDot n={1} label="Details" active={step === 1} done={step > 1} />
              <div className="flex-1 h-px max-w-[60px] transition-all duration-500"
                   style={{ background: step > 1 ? '#10b981' : 'var(--border-color)' }} />
              <StepDot n={2} label="Verify" active={step === 2} done={false} />
            </div>

            {/* â”€â”€â”€ STEP 1: Details â”€â”€â”€ */}
            {step === 1 && (
              <>
                <div className="mb-6 animate-fade-in">
                  <h2 className="text-2xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Create your account
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Fill in your details , we'll send you a verification code next
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4 animate-slide-up" noValidate>
                  <InputRow id="name" label="Full Name" icon={User} error={errors.name}>
                    <input id="name" type="text" placeholder="John Doe" value={form.name}
                           onChange={e => set('name', e.target.value)}
                           className={`input pl-10 ${errors.name ? 'border-rose-500/60' : ''}`} />
                  </InputRow>

                  <InputRow id="email" label="Email Address" icon={Mail} error={errors.email}>
                    <input id="email" type="email" placeholder="you@university.edu" value={form.email}
                           onChange={e => set('email', e.target.value)}
                           className={`input pl-10 ${errors.email ? 'border-rose-500/60' : ''}`} />
                  </InputRow>

                  <InputRow id="phone" label="Phone (optional)" icon={Phone}>
                    <input id="phone" type="tel" placeholder="+91 99999 99999" value={form.phone}
                           onChange={e => set('phone', e.target.value)} className="input pl-10" />
                  </InputRow>

                  <InputRow id="university_id" label="University" icon={Building2} error={errors.university_id}>
                    <select id="university_id" value={form.university_id}
                            onChange={e => set('university_id', e.target.value)}
                            className={`input pl-10 ${errors.university_id ? 'border-rose-500/60' : ''}`}>
                      <option value="">Select your university...</option>
                      {universities.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </InputRow>

                  <InputRow id="password" label="Password" icon={Lock} error={errors.password}>
                    <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 chars, Aâ€“Z, aâ€“z, 0â€“9"
                           value={form.password} onChange={e => set('password', e.target.value)}
                           className={`input pl-10 pr-11 ${errors.password ? 'border-rose-500/60' : ''}`} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded-lg">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </InputRow>

                  <InputRow id="confirmPassword" label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
                    <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                           value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                           className={`input pl-10 pr-11 ${errors.confirmPassword ? 'border-rose-500/60' : ''}`} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-ghost p-0.5 rounded-lg">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </InputRow>

                  <button type="submit" disabled={otpLoading} className="btn-primary w-full py-3 mt-2">
                    {otpLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Continue <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* â”€â”€â”€ STEP 2: OTP â”€â”€â”€ */}
            {step === 2 && (
              <>
                <div className="mb-6 animate-fade-in">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                       style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <ShieldCheck size={24} style={{ color: '#6366f1' }} />
                  </div>
                  <h2 className="text-2xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Verify your email
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyAndRegister} className="space-y-6 animate-slide-up" noValidate>
                  {/* 6-box OTP input */}
                  <div>
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <OtpInput
                          key={idx}
                          value={digit}
                          hasError={!!otpError}
                          inputRef={el => (otpRefs.current[idx] = el)}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="form-error mt-2"><span>âš </span> {otpError}</p>
                    )}
                  </div>

                  {/* Resend */}
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Didn't receive it?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || otpLoading}
                      className="flex items-center gap-1.5 font-semibold transition-colors"
                      style={{
                        color: resendCooldown > 0 ? 'var(--text-muted)' : '#6366f1',
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <RefreshCw size={13} className={otpLoading ? 'animate-spin' : ''} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button type="submit" disabled={submitLoading || authLoading} className="btn-primary w-full py-3">
                    {(submitLoading || authLoading) ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Verify &amp; Create Account <ArrowRight size={16} />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-ghost w-full justify-center py-2.5 flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft size={14} /> Back to details
                  </button>
                </form>
              </>
            )}

            {/* â”€â”€â”€ Footer â”€â”€â”€ */}
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
