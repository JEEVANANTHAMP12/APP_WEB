import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { canteenAPI, menuAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import { ShieldX } from 'lucide-react';
import toast from 'react-hot-toast';

const CanteenDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const [canteen, setCanteen] = useState(null);
  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('menu');

  useEffect(() => {
    Promise.all([
      canteenAPI.getOne(id),
      menuAPI.getAll({ canteen_id: id }),
      reviewAPI.getCanteenReviews(id),
    ])
      .then(([canteenRes, menuRes, reviewRes]) => {
        setCanteen(canteenRes.data.data.canteen);
        setMenu(menuRes.data.data.grouped);
        setCategories(Object.keys(menuRes.data.data.grouped));
        setReviews(reviewRes.data.data.reviews);
      })
      .catch(() => toast.error('Failed to load canteen'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!canteen) return <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Canteen not found</div>;

  // Block ordering if canteen belongs to a different university
  const studentUniId = user?.university_id?._id || user?.university_id || '';
  const canteenUniId = canteen.university_id?._id || canteen.university_id || '';
  const isSameUniversity = !studentUniId || !canteenUniId || String(studentUniId) === String(canteenUniId);

  if (!isSameUniversity) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <ShieldX size={28} className="text-red-400" />
        </div>
        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Not available for your university</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This canteen belongs to a different university. You can only order from canteens at your campus.</p>
        <button onClick={() => navigate('/student/canteens')} className="btn-primary mx-auto">Back to My Canteens</button>
      </div>
    );
  }

  const filteredMenu = Object.entries(menu).reduce((acc, [cat, items]) => {
    const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  const cartItemCount = (itemId) => cart.find((i) => i._id === itemId)?.quantity || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="h-56 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #6366f115, #a855f715)' }}>
          {canteen.image ? (
            <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">🍽️</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold border ${canteen.is_open ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
            {canteen.is_open ? '● Open' : '● Closed'}
          </span>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{canteen.name}</h1>
              {canteen.description && <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{canteen.description}</p>}
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>🎓 {canteen.university_id?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400">★</span>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{canteen.rating}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({canteen.total_reviews} reviews)</span>
            </div>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>⏱️ {canteen.opening_time} – {canteen.closing_time}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
        {['menu', 'reviews'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-brand-gradient text-white shadow-brand' : ''
            }
            style={tab !== t ? { color: 'var(--text-muted)' } : {}}`}
          >
            {t === 'menu' ? '🍔 Menu' : `⭐ Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-8 text-sm" />
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider px-1 mb-2">Categories</p>
              <button
                onClick={() => setActiveCategory('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${!activeCategory ? 'bg-indigo-500/15 text-indigo-400' : 'hover:bg-white/5'}`}
                style={activeCategory ? { color: 'var(--text-muted)' } : {}}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex justify-between ${activeCategory === cat ? 'bg-indigo-500/15 text-indigo-400' : 'hover:bg-white/5'}`}
                  style={activeCategory !== cat ? { color: 'var(--text-muted)' } : {}}
                >
                  {cat}
                  <span className="text-xs opacity-60">{menu[cat]?.length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="lg:col-span-3 space-y-6">
            {Object.entries(filteredMenu)
              .filter(([cat]) => !activeCategory || cat === activeCategory)
              .map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-5 bg-brand-gradient rounded-full" />
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{category}</h3>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const qty = cartItemCount(item._id);
                      return (
                        <div key={item._id} className="card flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🍱</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                            {item.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>}
                            <p className="text-sm font-bold text-indigo-400 mt-1">₹{item.price}</p>
                          </div>
                          {item.availability ? (
                            qty > 0 ? (
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => updateQuantity(item._id, qty - 1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all">−</button>
                                <span className="w-5 text-center font-bold" style={{ color: 'var(--text-primary)' }}>{qty}</span>
                                <button onClick={() => updateQuantity(item._id, qty + 1)} className="w-8 h-8 rounded-lg bg-brand-gradient text-white font-bold flex items-center justify-center shadow-brand transition-all">+</button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(item, id)} className="btn-primary shrink-0 text-xs px-3 py-2">Add</button>
                            )
                          ) : (
                            <span className="badge-danger text-xs shrink-0">Unavailable</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">⭐</div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No reviews yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Be the first to review!</p>
            </div>
          ) : reviews.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                    {r.user_id?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.user_id?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={s <= r.rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>}
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Floating cart button */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
          <button
            onClick={() => navigate('/student/cart')}
            className="flex items-center gap-2 px-5 py-3 bg-brand-gradient text-white rounded-2xl shadow-brand-lg font-semibold hover:scale-105 transition-all"
          >
            🛒 View Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)
          </button>
        </div>
      )}
    </div>
  );
};

export default CanteenDetailPage;
