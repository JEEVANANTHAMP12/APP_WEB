import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', description: '', price: '', category: '', image: '',
  is_veg: true, availability: true, preparation_time: 10, discount_percentage: 0,
};

const MenuManagePage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const canteenId = user?.canteen_id?._id || user?.canteen_id;

  const fetchMenu = () => {
    menuAPI.getAll({ canteen_id: canteenId })
      .then(({ data }) => setItems(data.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMenu(); }, [canteenId]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, image: item.image, is_veg: item.is_veg, availability: item.availability, preparation_time: item.preparation_time, discount_percentage: item.discount_percentage });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) { await menuAPI.update(editItem._id, form); toast.success('Item updated'); }
      else { await menuAPI.create(form); toast.success('Item added'); }
      fetchMenu();
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await menuAPI.delete(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await menuAPI.toggleAvailability(id);
      setItems((prev) => prev.map((i) => i._id === id ? { ...i, availability: data.data.availability } : i));
    } catch { toast.error('Toggle failed'); }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">{items.length} items</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">+ Add Item</button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-white font-medium">No items found</p>
          <button onClick={openAdd} className="btn-primary mt-4">Add First Item</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="card">
              <div className="flex gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🍱</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                    <span className={`shrink-0 w-3 h-3 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} title={item.is_veg ? 'Veg' : 'Non-veg'} />
                  </div>
                  <p className="text-indigo-400 font-bold text-sm">₹{item.price}</p>
                  <p className="text-slate-500 text-xs">{item.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  onClick={() => handleToggle(item._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    item.availability ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  }`}
                >
                  {item.availability ? '● Available' : '● Unavailable'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all">✏️</button>
                  <button onClick={() => handleDelete(item._id, item.name)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="font-bold text-white">{editItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="input-label">Item Name *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="input-label">Price (₹) *</label>
                  <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min={1} />
                </div>
                <div>
                  <label className="input-label">Category *</label>
                  <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                </div>
                <div>
                  <label className="input-label">Prep Time (min)</label>
                  <input type="number" className="input" value={form.preparation_time} onChange={(e) => setForm({ ...form, preparation_time: e.target.value })} min={1} />
                </div>
                <div>
                  <label className="input-label">Discount %</label>
                  <input type="number" className="input" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })} min={0} max={100} />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Description</label>
                  <textarea rows={2} className="input resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <ImageUpload
                    value={form.image}
                    onChange={(v) => setForm({ ...form, image: v })}
                    label="Item Photo"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="veg" checked={form.is_veg} onChange={(e) => setForm({ ...form, is_veg: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                  <label htmlFor="veg" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Vegetarian</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="avail" checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} className="w-4 h-4 accent-orange-500" />
                  <label htmlFor="avail" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Available</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagePage;
