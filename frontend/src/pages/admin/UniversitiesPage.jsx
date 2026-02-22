import { useState, useEffect } from 'react';
import { universityAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', location: '', code: '', status: 'active' };

const AdminUniversitiesPage = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = add mode
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const { data } = await universityAPI.getAll();
      setUniversities(data.data.universities);
    } catch { toast.error('Failed to load universities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (u) => { setEditing(u._id); setForm({ name: u.name, location: u.location, code: u.code, status: u.status }); setShowModal(true); };

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Universities</h1>
        <button onClick={openAdd} className="btn-primary">+ Add University</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {['Name', 'Code', 'Location', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {universities.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-10">No universities yet</td></tr>
              ) : universities.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm uppercase">{u.code}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{u.location}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(u)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-semibold">Edit</button>
                    <button onClick={() => handleDelete(u._id)} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-lg font-semibold">Delete</button>
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
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit University' : 'Add University'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. MIT" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
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
