import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const POSITIONS = ['home_banner', 'canteen_list', 'sidebar'];
const EMPTY = { title: '', image: '', link: '', position: POSITIONS[0], start_date: '', end_date: '', is_active: true };

const AdminAdsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchAds = async () => {
    try {
      const { data } = await adminAPI.getAds();
      setAds(data.data.ads);
    } catch { toast.error('Failed to load ads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAds(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (ad) => {
    setEditing(ad._id);
    setForm({
      title: ad.title, image: ad.image, link: ad.link,
      position: ad.position, is_active: ad.is_active,
      start_date: ad.start_date?.slice(0, 10) || '',
      end_date: ad.end_date?.slice(0, 10) || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await adminAPI.updateAd(editing, form);
        toast.success('Ad updated');
      } else {
        await adminAPI.createAd(form);
        toast.success('Ad created');
      }
      setShowModal(false);
      fetchAds();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advertisement?')) return;
    try {
      await adminAPI.deleteAd(id);
      toast.success('Ad deleted');
      fetchAds();
    } catch { toast.error('Delete failed'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Advertisements</h1>
        <button onClick={openAdd} className="btn-primary">+ New Ad</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : ads.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">No advertisements yet. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div key={ad._id} className="card flex gap-4">
              {ad.image && (
                <img src={ad.image} alt={ad.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 truncate">{ad.title}</p>
                  <span className={`badge flex-shrink-0 ${ad.is_active ? 'badge-green' : 'badge-red'}`}>
                    {ad.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{ad.position?.replace('_', ' ')}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(ad.start_date)} → {formatDate(ad.end_date)}</p>
                {ad.link && (
                  <a href={ad.link} target="_blank" rel="noreferrer" className="text-xs text-primary-500 hover:underline truncate block mt-1">{ad.link}</a>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(ad)} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg font-semibold">Edit</button>
                  <button onClick={() => handleDelete(ad._id)} className="text-xs bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-lg font-semibold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Ad' : 'New Advertisement'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                    {POSITIONS.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input" value={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdsPage;
