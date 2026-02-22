import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { canteenAPI, menuAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const CanteenDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
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
  if (!canteen) return <div className="text-center py-20 text-gray-400">Canteen not found</div>;

  const filteredMenu = Object.entries(menu).reduce((acc, [cat, items]) => {
    const filtered = items.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  const cartItemCount = (itemId) =>
    cart.find((i) => i._id === itemId)?.quantity || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-52 bg-gradient-to-br from-orange-100 to-primary-100 flex items-center justify-center relative">
          {canteen.image ? (
            <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">🍽️</span>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{canteen.name}</h1>
              <p className="text-gray-500 mt-1">{canteen.description}</p>
              <p className="text-sm text-gray-400 mt-2">🎓 {canteen.university_id?.name}</p>
            </div>
            <span className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold ${canteen.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {canteen.is_open ? '● Open' : '● Closed'}
            </span>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400">★</span>
              <span className="font-semibold">{canteen.rating}</span>
              <span className="text-gray-400 text-sm">({canteen.total_reviews} reviews)</span>
            </div>
            <span className="text-gray-400 text-sm">⏱️ {canteen.opening_time} – {canteen.closing_time}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {['menu', 'reviews'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-semibold capitalize transition-all border-b-2 ${
              tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'menu' ? '🍔 Menu' : `⭐ Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-24">
              <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input text-sm mb-3"
              />
              <p className="text-xs text-gray-400 font-semibold uppercase px-2 mb-2">Categories</p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                  <span className="ml-auto text-xs text-gray-400 float-right">
                    {menu[cat]?.length}
                  </span>
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
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary-500 rounded-full inline-block" />
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">🍱</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-sm border-2 inline-block ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                              <span className={`block w-1.5 h-1.5 rounded-sm m-auto mt-0.5 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                            </span>
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                          <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price}</p>
                        </div>
                        <div className="shrink-0">
                          {!item.availability ? (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">Unavailable</span>
                          ) : cartItemCount(item._id) > 0 ? (
                            <div className="flex items-center gap-2 bg-primary-50 rounded-xl px-1 py-1">
                              <button
                                onClick={() => {/* handled by CartContext */}}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-500 text-white text-lg font-bold"
                              >−</button>
                              <span className="text-sm font-bold text-primary-600 w-4 text-center">
                                {cartItemCount(item._id)}
                              </span>
                              <button
                                onClick={() => addToCart(item, id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-500 text-white text-lg font-bold"
                              >+</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item, id)}
                              className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">⭐</div>
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                      {review.user_id?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{review.user_id?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => navigate('/cart')}
            className="bg-primary-500 text-white px-8 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 hover:bg-primary-600 transition-all"
          >
            <span>🛒</span>
            View Cart
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CanteenDetailPage;
