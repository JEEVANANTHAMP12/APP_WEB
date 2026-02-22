// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Edit3, Save, Lock, Sun, Moon,
  LogOut, ToggleLeft, ToggleRight, Camera, ShieldCheck,
  Users, Store, Building2, LayoutDashboard, TrendingUp,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI, adminAPI } from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',   label: 'Personal Info',    icon: User,           color: '#8b5cf6' },
  { id: 'overview',  label: 'Platform Stats',   icon: TrendingUp,     color: '#0ea5e9' },
  { id: 'settings',  label: 'Settings',         icon: Lock,           color: '#64748b' },
];

/* ─── Personal Info ─────────────────────────────────────── */
const PersonalInfoSection = ({ user, updateUser }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await authAPI.updateProfile({ name: form.name, phone: form.phone, avatar: form.avatar });
      updateUser(data.data.user); toast.success('Profile updated!'); setEditing(false);
    } catch { toast.error('Update failed'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="section-title">Personal Info</h2><p className="section-desc">Platform administrator account</p></div>
        {!editing && <button onClick={() => setEditing(true)} className="btn-outline flex items-center gap-2"><Edit3 size={14} /> Edit</button>}
      </div>

      <div className="card flex flex-col sm:flex-row items-center gap-5">
        <div className="relative shrink-0">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-2" style={{ borderColor: 'var(--border-color)' }} />
            : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          }
          {editing && <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#8b5cf6' }}><Camera size={11} className="text-white" /></div>}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
              <ShieldCheck size={11} /> Platform Admin
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Activity size={11} /> Active
            </span>
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="card space-y-4">
          <ImageUpload label="Profile Photo" value={form.avatar} onChange={v => setForm({ ...form, avatar: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="input-label">Full Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><label className="input-label">Phone</label><input className="input" type="tel" value={form.phone} placeholder="+91 XXXXX XXXXX" onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="input-label">Email</label><input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled /></div>
            <div><label className="input-label">Role</label><input className="input opacity-60 cursor-not-allowed" value="Platform Administrator" disabled /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><Save size={14} />{loading ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: User,        label: 'Full Name', value: user?.name },
            { icon: Phone,       label: 'Phone',     value: user?.phone || 'Not set' },
            { icon: Mail,        label: 'Email',     value: user?.email },
            { icon: ShieldCheck, label: 'Role',      value: 'Platform Administrator' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.1)' }}><Icon size={14} style={{ color: '#8b5cf6' }} /></div>
              <div className="min-w-0">
                <p className="text-2xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Platform Overview ─────────────────────────────────── */
const PlatformOverviewSection = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => setStats(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tiles = stats ? [
    { icon: Users,      label: 'Total Users',       value: stats.total_users || 0,       color: '#6366f1', path: '/admin/users' },
    { icon: Store,      label: 'Canteens',          value: stats.total_canteens || 0,    color: '#0ea5e9', path: '/admin/canteens' },
    { icon: Building2,  label: 'Universities',      value: stats.total_universities || 0,color: '#8b5cf6', path: '/admin/universities' },
    { icon: TrendingUp, label: 'Total Orders',       value: stats.total_orders || 0,      color: '#10b981', path: '/admin/dashboard' },
    { icon: Users,      label: 'Pending Approvals', value: stats.pending_owners || 0,    color: '#f59e0b', path: '/admin/users' },
    { icon: Activity,   label: 'Active Canteens',   value: stats.active_canteens || 0,   color: '#ec4899', path: '/admin/canteens' },
  ] : [];

  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Platform Stats</h2><p className="section-desc">Real-time overview of the campus platform</p></div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="card py-6 animate-pulse"><div className="h-4 bg-white/10 rounded mb-2 mx-4" /><div className="h-6 bg-white/5 rounded mx-4" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tiles.map(({ icon: Icon, label, value, color, path }) => (
            <button key={label} onClick={() => navigate(path)} className="card text-left transition-all hover:scale-[1.02] active:scale-100 cursor-pointer">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}><Icon size={18} style={{ color }} /></div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value.toLocaleString()}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Quick Access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: '#8b5cf6' },
            { label: 'Users',     icon: Users,           path: '/admin/users',     color: '#6366f1' },
            { label: 'Canteens',  icon: Store,           path: '/admin/canteens',  color: '#0ea5e9' },
            { label: 'Unis',      icon: Building2,       path: '/admin/universities', color: '#10b981' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button key={label} onClick={() => navigate(path)} className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-all hover:opacity-90"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Icon size={20} style={{ color }} />
              <span className="text-xs font-semibold" style={{ color }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Settings ──────────────────────────────────────────── */
const SettingsSection = ({ user, logout }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handlePw = async e => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!'); setPwForm({ current_password: '', new_password: '', confirm: '' }); setShowPw(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Settings</h2><p className="section-desc">App preferences and account security</p></div>

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Appearance</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>{isDark ? <Moon size={16} style={{ color: '#f59e0b' }} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}</div>
          <div className="flex-1"><p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</p></div>
          <button onClick={toggleTheme}>{isDark ? <ToggleRight size={28} style={{ color: '#8b5cf6' }} /> : <ToggleLeft size={28} style={{ color: 'var(--text-muted)' }} />}</button>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.1)' }}><Lock size={16} style={{ color: '#8b5cf6' }} /></div>
            <div><p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Change Password</p></div>
          </div>
          <button onClick={() => setShowPw(!showPw)} className="btn-outline text-xs">{showPw ? 'Cancel' : 'Change'}</button>
        </div>
        {showPw && (
          <form onSubmit={handlePw} className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {[['current_password', 'Current Password'], ['new_password', 'New Password'], ['confirm', 'Confirm Password']].map(([k, l]) => (
              <div key={k}><label className="input-label">{l}</label><input type="password" className="input" value={pwForm[k]} onChange={e => setPwForm({ ...pwForm, [k]: e.target.value })} required /></div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Changing...' : 'Update Password'}</button>
          </form>
        )}
      </div>

      <div className="card p-4 flex items-center gap-4 border" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 shrink-0"><LogOut size={16} className="text-red-400" /></div>
        <div className="flex-1"><p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Sign Out</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p></div>
        <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border hover:bg-red-500/10 transition-colors" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>Logout</button>
      </div>
    </div>
  );
};

/* ─── Root ──────────────────────────────────────────────── */
const AdminProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">My Profile</h1><p className="page-subtitle">Administrator account and platform overview</p></div>
      <div className="flex gap-6 items-start">
        <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-24 card p-2 gap-0.5">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            {user?.avatar ? <img src={user.avatar} className="w-9 h-9 rounded-xl object-cover" alt="" /> : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>}
            <div className="min-w-0"><p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Admin</p></div>
          </div>
          {TABS.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setActiveTab(id)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full"
              style={activeTab === id ? { background: `linear-gradient(135deg,${color}cc,${color}88)`, color: '#fff', boxShadow: `0 4px 12px ${color}40` } : { color: 'var(--text-secondary)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: activeTab === id ? 'rgba(255,255,255,0.2)' : 'var(--bg-elevated)' }}>
                <Icon size={14} style={{ color: activeTab === id ? '#fff' : color }} />
              </div>{label}
            </button>
          ))}
        </aside>
        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:hidden">
            {TABS.map(({ id, label, icon: Icon, color }) => (
              <button key={id} onClick={() => setActiveTab(id)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={activeTab === id ? { background: `${color}20`, color, border: `1.5px solid ${color}60` } : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                <Icon size={13} /><span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          {activeTab === 'profile'  && <PersonalInfoSection user={user} updateUser={updateUser} />}
          {activeTab === 'overview' && <PlatformOverviewSection />}
          {activeTab === 'settings' && <SettingsSection user={user} logout={logout} />}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
