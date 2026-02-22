import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { universityAPI } from '../../services/api';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    university_id: '',
    phone: '',
  });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', university_id: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    universityAPI.getAll({ status: 'active', limit: 100 })
      .then(({ data }) => setUniversities(data.data))
      .catch(() => {});
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name || form.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email || !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Invalid email';
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match';
    if (form.role === 'student' && !form.university_id) newErrors.university_id = 'Please select your university';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      university_id: form.university_id || undefined,
      phone: form.phone,
    });

    if (result.success) {
      if (result.role === 'owner') navigate('/owner/dashboard');
      else navigate('/student/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-orange-500/50">
              🍽️
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Campus Cravings</h1>
          <p className="text-gray-300 text-lg">Join thousands of hungry students</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-slide-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-300">Get started in less than a minute</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 text-sm rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">Who are you?</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'owner'].map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setForm({ ...form, role: roleOption })}
                    className={`p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                      form.role === roleOption
                        ? 'border-orange-500 bg-orange-500/20 text-orange-200'
                        : 'border-white/20 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    {roleOption === 'student' ? '👨‍🎓 Student' : '🏪 Owner'}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">👤</span>
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 ${
                    errors.name ? 'border-red-500' : 'border-white/20'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-sm mt-1.5">⚠️ {errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📧</span>
                </div>
                <input
                  type="email"
                  placeholder="john@university.edu"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1.5">⚠️ {errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2.5">Phone (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">📱</span>
                </div>
                <input
                  type="tel"
                  placeholder="+91 9999999999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            {/* University Selection */}
            {form.role === 'student' && (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-200 mb-2.5">University</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">🏫</span>
                  </div>
                  <select
                    value={form.university_id}
                    onChange={(e) => {
                      setForm({ ...form, university_id: e.target.value });
                      if (errors.university_id) setErrors({ ...errors, university_id: '' });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 appearance-none ${
                      errors.university_id ? 'border-red-500' : 'border-white/20'
                    }`}
                  >
                    <option value="" className="bg-slate-800">Select University</option>
                    {universities.map((u) => (
                      <option key={u._id} value={u._id} className="bg-slate-800">
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.university_id && <p className="text-red-400 text-sm mt-1.5">⚠️ {errors.university_id}</p>}
              </div>
            )}

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔒</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1.5">⚠️ {errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-200 mb-2.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">✓</span>
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1.5">⚠️ {errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <span>{form.role === 'owner' ? 'Register as Owner' : 'Create Account'}</span>
                  <span>➜</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-400">
                Already registered?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="w-full block text-center py-3 px-4 border-2 border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition duration-300"
          >
            Sign In Instead
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-8">
          By registering, you agree to our
          <a href="#" className="text-orange-400 hover:text-orange-300 mx-1">
            Terms & Conditions
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
