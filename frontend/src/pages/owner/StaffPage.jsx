import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loading from '../../components/common/Loading';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', date_of_birth: '', hometown: '' };

const calcAge = (dob) => {
  if (!dob) return '—';
  const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  return age >= 0 ? age : '—';
};

const formatDOB = (dob) => {
  if (!dob) return '—';
  return new Date(dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StaffPage = () => {
  const { user } = useAuth();
  const canteenId = user?.canteen_id?._id || user?.canteen_id;
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    if (!canteenId) { setLoading(false); return; }
    try {
      const { data } = await canteenAPI.getStaff(canteenId);
      setStaff(data.data.users);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('create'); };
  const openEdit = (s) => {
    setEditTarget(s);
    setForm({
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      password: '',
      date_of_birth: s.date_of_birth ? s.date_of_birth.slice(0, 10) : '',
      hometown: s.hometown || '',
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'create') {
        await canteenAPI.createStaff(canteenId, form);
        toast.success('Staff account created');
      } else {
        const payload = { name: form.name, phone: form.phone, date_of_birth: form.date_of_birth, hometown: form.hometown };
        if (form.password.trim()) payload.password = form.password;
        await canteenAPI.updateStaff(canteenId, editTarget._id, payload);
        toast.success('Staff updated');
      }
      closeModal();
      fetchStaff();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleBlock = async (id, is_blocked) => {
    try {
      await adminAPI.toggleBlock(id);
      setStaff((prev) => prev.map((s) => s._id === id ? { ...s, is_blocked: !is_blocked } : s));
      toast.success(is_blocked ? 'Unblocked' : 'Blocked');
    } catch { toast.error('Action failed'); }
  };

  const isEdit = modal === 'edit';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">{staff.length} staff members</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Add Staff</button>
      </div>

      {loading ? <Loading /> : staff.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-white font-medium">No staff yet</p>
          <button onClick={openCreate} className="btn-primary mt-4">Add First Staff</button>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-white/10">
              <tr>
                {['Name', 'Email', 'Phone', 'Date of Birth', 'Age', 'Hometown', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="table-cell font-medium text-white">{s.name}</td>
                  <td className="table-cell text-slate-400">{s.email}</td>
                  <td className="table-cell">{s.phone || '—'}</td>
                  <td className="table-cell">{formatDOB(s.date_of_birth)}</td>
                  <td className="table-cell">{calcAge(s.date_of_birth)}</td>
                  <td className="table-cell">{s.hometown || '—'}</td>
                  <td className="table-cell">
                    <span className={`badge ${s.is_blocked ? 'badge-danger' : 'badge-success'}`}>
                      {s.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleBlock(s._id, s.is_blocked)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          s.is_blocked ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        }`}
                      >
                        {s.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-bold text-white">{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="input-label">Full Name *</label>
                <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              {/* Email — read-only on edit */}
              <div>
                <label className="input-label">Email {!isEdit && '*'}</label>
                <input
                  type="email"
                  className={`input ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={form.email}
                  onChange={(e) => !isEdit && setForm({ ...form, email: e.target.value })}
                  required={!isEdit}
                  disabled={isEdit}
                />
                {isEdit && <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="input-label">Phone</label>
                <input type="text" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="input-label">Date of Birth</label>
                <input type="date" className="input" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                {form.date_of_birth && (
                  <p className="text-xs text-slate-400 mt-1">Age: <span className="text-orange-400 font-medium">{calcAge(form.date_of_birth)} years</span></p>
                )}
              </div>

              {/* Hometown */}
              <div>
                <label className="input-label">Hometown / Place of Origin</label>
                <input type="text" className="input" placeholder="City, Country" value={form.hometown} onChange={(e) => setForm({ ...form, hometown: e.target.value })} />
              </div>

              {/* Password */}
              <div>
                <label className="input-label">Password {isEdit ? <span className="text-slate-500 font-normal">(leave blank to keep current)</span> : '*'}</label>
                <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!isEdit} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Account')}
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
