import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StaffPage = () => {
  const { user } = useAuth();
  const canteenId = user?.canteen_id?._id || user?.canteen_id;

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const { data } = await adminAPI.getUsers({ role: 'staff', canteen_id: canteenId });
      setStaff(data.data.users);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authAPI.register({ ...form, role: 'staff', canteen_id: canteenId });
      toast.success('Staff account created');
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create staff');
    } finally { setSubmitting(false); }
  };

  const handleBlock = async (id, is_blocked) => {
    try {
      await adminAPI.toggleBlock(id);
      setStaff((prev) => prev.map((s) => s._id === id ? { ...s, is_blocked: !is_blocked } : s));
      toast.success(is_blocked ? 'Staff unblocked' : 'Staff blocked');
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Staff</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : staff.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">No staff accounts yet.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {['Name', 'Email', 'Phone', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{s.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.is_blocked ? 'badge-red' : 'badge-green'}`}>
                      {s.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBlock(s._id, s.is_blocked)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                        s.is_blocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      {s.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
