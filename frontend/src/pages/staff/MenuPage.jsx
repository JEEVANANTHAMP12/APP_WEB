// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const StaffMenuPage = () => {
  const { user } = useAuth();
  const canteenId = user?.canteen_id?._id || user?.canteen_id;

  const [items, setItems] = useState(/** @type {any[]} */([]));
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(/** @type {string | null} */(null));
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!canteenId) { setLoading(false); return; }
    menuAPI.getAll({ canteen_id: canteenId })
      .then(({ data }) => setItems(data.data.items))
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [canteenId]);

  /** @param {string} id */
  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await menuAPI.toggleAvailability(id);
      setItems((prev) =>
        prev.map((i) => i._id === id ? { ...i, availability: data.data.availability } : i)
      );
      toast.success(data.data.availability ? 'Item marked available' : 'Item marked unavailable');
    } catch { toast.error('Toggle failed'); }
    finally { setToggling(null); }
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  const available = filtered.filter((i) => i.availability);
  const unavailable = filtered.filter((i) => !i.availability);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Menu Items</h1>
        <p className="page-subtitle">Toggle availability for items in your canteen</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-emerald-400">{items.filter((i) => i.availability).length}</p>
          <p className="text-slate-400 text-sm mt-1">Available</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-3xl font-bold text-red-400">{items.filter((i) => !i.availability).length}</p>
          <p className="text-slate-400 text-sm mt-1">Unavailable</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        className="input"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <Loading /> : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="text-white font-medium">No menu items found</p>
        </div>
      ) : (
        <>
          {/* Available items */}
          {available.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                ✅ Available ({available.length})
              </h2>
              {available.map((item) => (
                <MenuItemRow key={item._id} item={item} onToggle={handleToggle} toggling={toggling} />
              ))}
            </div>
          )}

          {/* Unavailable items */}
          {unavailable.length > 0 && (
            <div className="space-y-3 mt-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                ❌ Unavailable ({unavailable.length})
              </h2>
              {unavailable.map((item) => (
                <MenuItemRow key={item._id} item={item} onToggle={handleToggle} toggling={toggling} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * @param {{ item: any; onToggle: (id: string) => void; toggling: string | null }} props
 */
const MenuItemRow = ({ item, onToggle, toggling }) => (
  <div className={`card flex items-center gap-4 transition-all ${!item.availability ? 'opacity-60' : ''}`}>
    {item.image ? (
      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
    ) : (
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">🍽️</div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-white text-sm truncate">{item.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_veg ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {item.is_veg ? '🟢 Veg' : '🔴 Non-veg'}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-0.5">{item.category} · ₹{item.price}</p>
    </div>
    <button
      onClick={() => onToggle(item._id)}
      disabled={toggling === item._id}
      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
        item.availability
          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/20'
          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/20'
      }`}
    >
      {toggling === item._id ? '...' : item.availability ? 'Mark Unavailable' : 'Mark Available'}
    </button>
  </div>
);

export default StaffMenuPage;
