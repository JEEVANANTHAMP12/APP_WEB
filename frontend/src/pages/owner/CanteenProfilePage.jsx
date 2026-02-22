import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const CanteenProfilePage = () => {
  const { user } = useAuth();
  const [canteen, setCanteen] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canteenId = user?.canteen_id?._id || user?.canteen_id;

  useEffect(() => {
    canteenAPI.getOne(canteenId)
      .then(({ data }) => {
        const c = data.data.canteen;
        setCanteen(c);
        setForm({ name: c.name, description: c.description, phone: c.phone, opening_time: c.opening_time, closing_time: c.closing_time, image: c.image });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canteenId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await canteenAPI.update(canteenId, form);
      setCanteen(data.data.canteen);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    try {
      await canteenAPI.toggle(canteenId);
      setCanteen((prev) => ({ ...prev, is_open: !prev.is_open }));
      toast.success(`Canteen is now ${!canteen.is_open ? 'open' : 'closed'}`);
    } catch { toast.error('Toggle failed'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Canteen Profile</h1>
          <p className="page-subtitle">Manage your canteen settings</p>
        </div>
        <button
          onClick={handleToggle}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            canteen?.is_open
              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
        >
          {canteen?.is_open ? '● Close Canteen' : '● Open Canteen'}
        </button>
      </div>

      {/* Preview card */}
      {canteen?.image && (
        <div className="relative h-40 rounded-2xl overflow-hidden">
          <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="font-bold text-white text-lg">{canteen.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${canteen.is_open ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
              {canteen.is_open ? '● Open' : '● Closed'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="input-label">Canteen Name *</label>
          <input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea className="input resize-none" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <ImageUpload
          value={form.image || ''}
          onChange={(v) => setForm({ ...form, image: v })}
          label="Canteen Photo"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Phone</label>
            <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Opening Time</label>
            <input type="time" className="input" value={form.opening_time || ''} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Closing Time</label>
            <input type="time" className="input" value={form.closing_time || ''} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default CanteenProfilePage;
