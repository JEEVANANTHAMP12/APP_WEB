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
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Avatar */}
      <div className="card text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600 mx-auto mb-3">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
        <p className="text-gray-400 text-sm">{user?.email}</p>
        <span className="inline-block mt-2 bg-primary-50 text-primary-600 text-xs px-3 py-1 rounded-full font-medium capitalize">
          {user?.role}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['profile', 'password'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-medium capitalize transition-all border-b-2 ${
              tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t === 'profile' ? '👤 Profile' : '🔒 Change Password'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input className="input bg-gray-50 cursor-not-allowed" value={user?.email} disabled />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              className="input"
              value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              className="input"
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            />
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
