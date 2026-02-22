import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '', image: '',
  is_veg: true, availability: true, preparation_time: 10, discount_percentage: 0,
};

const MenuManagePage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
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

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description, price: item.price,
      category: item.category, image: item.image, is_veg: item.is_veg,
      availability: item.availability, preparation_time: item.preparation_time,
      discount_percentage: item.discount_percentage,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await menuAPI.update(editItem._id, form);
        toast.success('Item updated');
      } else {
        await menuAPI.create(form);
        toast.success('Item added');
      }
      fetchMenu();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await menuAPI.delete(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await menuAPI.toggleAvailability(id);
      setItems((prev) => prev.map((i) => i._id === id ? data.data.item : i));
    } catch { toast.error('Toggle failed'); }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          + Add Item
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search menu items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input max-w-xs"
      />

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🍔</div>
          <p>No menu items yet. Add your first item!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item._id} className={`bg-white rounded-2xl border ${item.availability ? 'border-gray-100' : 'border-red-100 opacity-70'} shadow-sm overflow-hidden`}>
              <div className="h-36 bg-orange-50 flex items-center justify-center relative">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">🍱</span>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.is_veg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.is_veg ? '🟢 Veg' : '🔴 Non-veg'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <p className="font-bold text-primary-600 shrink-0">₹{item.price}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleToggle(item._id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      item.availability
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    {item.availability ? '✓ Available' : '✗ Unavailable'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">✏️</button>
                    <button onClick={() => handleDelete(item._id, item.name)} className="p-2 hover:bg-red-50 rounded-lg text-red-400">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input className="input" placeholder="e.g. Snacks, Meals" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" className="input" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input type="number" className="input" value={form.preparation_time} onChange={(e) => setForm({...form, preparation_time: e.target.value})} min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input type="number" className="input" value={form.discount_percentage} onChange={(e) => setForm({...form, discount_percentage: e.target.value})} min={0} max={100} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input className="input" placeholder="https://..." value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_veg" checked={form.is_veg} onChange={(e) => setForm({...form, is_veg: e.target.checked})} className="accent-green-500" />
                  <label htmlFor="is_veg" className="text-sm font-medium text-gray-700">Vegetarian</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="availability" checked={form.availability} onChange={(e) => setForm({...form, availability: e.target.checked})} className="accent-primary-500" />
                  <label htmlFor="availability" className="text-sm font-medium text-gray-700">Available</label>
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
