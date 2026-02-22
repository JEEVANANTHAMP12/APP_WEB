import { useState, useEffect } from 'react';
import CustomSelect from '../../components/common/CustomSelect';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const POSITIONS = ['home_banner', 'canteen_list', 'sidebar'];
const EMPTY = { title: '', image: '', link: '', position: POSITIONS[0], start_date: '', end_date: '', is_active: true };

const POSITION_COLORS = {
  home_banner: 'bg-orange-500/20 text-orange-400',
  canteen_list: 'bg-blue-500/20 text-blue-400',
  sidebar: 'bg-violet-500/20 text-violet-400',
};

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Advertisements</h1>
          <p className="page-subtitle">Manage platform banners and promotions</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ New Ad</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : ads.length === 0 ? (
        <div className="card text-center text-slate-500 py-16">
          <div className="text-4xl mb-3">📢</div>
          <p className="text-slate-400 font-medium">No advertisements yet</p>
          <p className="text-slate-600 text-sm mt-1">Create one to start promoting canteens</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">+ Create First Ad</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad, i) => (
            <div key={ad._id} className={`card card-hover flex gap-4 animate-slide-up delay-${Math.min((i + 1) * 100, 500)}`}>
              {ad.image ? (
                <img src={ad.image} alt={ad.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-slate-700" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-700/60 flex items-center justify-center text-2xl flex-shrink-0">📢</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-100 truncate">{ad.title}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${ad.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {ad.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 capitalize ${POSITION_COLORS[ad.position] || 'bg-slate-700 text-slate-400'}`}>
                  {ad.position?.replace(/_/g, ' ')}
                </span>
                <p className="text-xs text-slate-500 mt-1.5">{formatDate(ad.start_date)} → {formatDate(ad.end_date)}</p>
                {ad.link && (
                  <a href={ad.link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 truncate block mt-1 transition-colors">{ad.link}</a>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(ad)} className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors">Edit</button>
                  <button onClick={() => handleDelete(ad._id)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-100">{editing ? 'Edit Advertisement' : 'New Advertisement'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 text-xl leading-none transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Ad title..." />
              </div>
              <div>
                <label className="input-label">Image URL</label>
                <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                {form.image && (
                  <img src={form.image} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl bg-slate-700" onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>
              <div>
                <label className="input-label">Link (optional)</label>
                <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Position</label>
                  <CustomSelect
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    options={POSITIONS.map((p) => ({ value: p, label: p.replace(/_/g, ' ') }))}
                  />
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <CustomSelect
                    value={String(form.is_active)}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
                  />
                </div>
                <div>
                  <label className="input-label">Start Date</label>
                  <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="input-label">End Date</label>
                  <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create Ad'}
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
