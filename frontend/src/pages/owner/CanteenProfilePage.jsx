import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI } from '../../services/api';
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
        setCanteen(data.data.canteen);
        setForm({
          name: data.data.canteen.name,
          description: data.data.canteen.description,
          phone: data.data.canteen.phone,
          opening_time: data.data.canteen.opening_time,
          closing_time: data.data.canteen.closing_time,
          image: data.data.canteen.image,
        });
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
      toast.success('Canteen profile updated!');
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

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Canteen Profile</h1>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            canteen?.is_open ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {canteen?.is_open ? '● Close Canteen' : '● Open Canteen'}
        </button>
      </div>

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Canteen Name</label>
          <input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input resize-none" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input className="input" value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
            <input type="time" className="input" value={form.opening_time || ''} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
            <input type="time" className="input" value={form.closing_time || ''} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Info cards */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-3">Canteen Status</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">Status</p>
            <p className="font-semibold capitalize text-gray-800">{canteen?.status}</p>
          </div>
          <div>
            <p className="text-gray-400">Commission</p>
            <p className="font-semibold text-gray-800">{canteen?.commission_percentage}%</p>
          </div>
          <div>
            <p className="text-gray-400">Total Revenue</p>
            <p className="font-semibold text-gray-800">₹{canteen?.total_earnings}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Orders</p>
            <p className="font-semibold text-gray-800">{canteen?.total_orders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanteenProfilePage;
