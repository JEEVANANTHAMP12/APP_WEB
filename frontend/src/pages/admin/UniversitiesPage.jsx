import { useState, useEffect } from 'react';
import CustomSelect from '../../components/common/CustomSelect';
import { universityAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', location: { city: '', state: '', address: '' }, code: '', status: 'active' };

const AdminUniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      // Pass status='' to bypass the backend's 'active' default filter — admin needs all
      const { data } = await universityAPI.getAll({ status: '', limit: 100 });
      // paginatedResponse returns array directly in data.data
      setUniversities(Array.isArray(data.data) ? data.data : data.data?.universities || []);
    } catch { toast.error('Failed to load universities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u._id);
    setForm({
      name: u.name,
      location: {
        city: u.location?.city || '',
        state: u.location?.state || '',
        address: u.location?.address || '',
      },
      code: u.code,
      status: u.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await universityAPI.update(editing, form);
        toast.success('University updated');
      } else {
        await universityAPI.create(form);
        toast.success('University added');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this university? This cannot be undone.')) return;
    try {
      await universityAPI.delete(id);
      toast.success('University deleted');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Universities</h1>
          <p className="page-subtitle">{universities.length} registered institutions</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add University</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Name', 'Code', 'Location', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {universities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-14">
                      <div className="text-3xl mb-2">🎓</div>
                      No universities yet
                    </td>
                  </tr>
                ) : universities.map((u, i) => (
                  <tr key={u._id} className={`border-t border-white/5 hover:bg-white/[0.02] transition-colors animate-slide-up delay-${Math.min((i + 1) * 100, 500)}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {u.code?.slice(0, 2)}
                        </div>
                        <span className="font-medium text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs font-mono bg-slate-700/60 text-slate-300 px-2 py-1 rounded-md uppercase">{u.code}</span>
                    </td>
                    <td className="table-cell text-slate-400 text-sm">
                      {[u.location?.city, u.location?.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors">Edit</button>
                        <button onClick={() => handleDelete(u._id)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-100">{editing ? 'Edit University' : 'Add University'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 text-xl leading-none transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="University full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Code</label>
                  <input
                    className="input uppercase"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g. MIT"
                  />
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <CustomSelect
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
                  />
                </div>
              </div>
              <div>
                <label className="input-label">City</label>
                <input
                  className="input"
                  value={form.location.city}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label className="input-label">State</label>
                <input
                  className="input"
                  value={form.location.state}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })}
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div>
                <label className="input-label">Address (optional)</label>
                <input
                  className="input"
                  value={form.location.address}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                  placeholder="Street / campus address"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Add University'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversitiesPage;
