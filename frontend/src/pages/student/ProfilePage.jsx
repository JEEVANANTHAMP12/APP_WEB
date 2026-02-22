import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      {/* Avatar card */}
      <div className="card text-center py-8">
        <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-brand">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        <span className="inline-block mt-3 bg-indigo-500/15 text-indigo-400 text-xs px-3 py-1 rounded-full font-medium capitalize border border-indigo-500/20">
          {user?.role}
        </span>
        {user?.wallet_balance !== undefined && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Wallet Balance</p>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>₹{user.wallet_balance}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
        {[['profile', '👤 Profile'], ['password', '🔒 Password']].map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-brand-gradient text-white shadow-brand' : ''
            }`}
            style={tab !== t ? { color: 'var(--text-muted)' } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <div>
            <label className="input-label">Current Password</label>
            <input type="password" className="input" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
          </div>
          <div>
            <label className="input-label">New Password</label>
            <input type="password" className="input" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Confirm Password</label>
            <input type="password" className="input" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      <button onClick={logout} className="btn-danger w-full">
        🚪 Logout
      </button>
    </div>
  );
};

export default ProfilePage;
