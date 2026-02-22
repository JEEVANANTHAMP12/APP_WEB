import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI } from '../../services/api';
import Loading from '../../components/common/Loading';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    canteenAPI
      .getAll({ university_id: user?.university_id?._id || user?.university_id, limit: 20 })
      .then(({ data }) => setCanteens(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = canteens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-500 to-orange-400 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Hello, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-white/80 mb-6">
          What would you like to eat today?
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Search canteens or food items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/60 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">🔍</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-1">💰</div>
          <p className="text-xl font-bold text-gray-800">₹{user?.wallet_balance || 0}</p>
          <p className="text-xs text-gray-400">Wallet Balance</p>
        </div>
        <div className="card text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/orders')}>
          <div className="text-2xl mb-1">📦</div>
          <p className="text-xl font-bold text-gray-800">Orders</p>
          <p className="text-xs text-gray-400">View all</p>
        </div>
        <div className="card text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/canteens')}>
          <div className="text-2xl mb-1">🍽️</div>
          <p className="text-xl font-bold text-gray-800">{canteens.length}</p>
          <p className="text-xs text-gray-400">Canteens</p>
        </div>
      </div>

      {/* Canteens */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Available Canteens</h2>
          <button
            onClick={() => navigate('/canteens')}
            className="text-sm text-primary-600 font-medium hover:underline"
          >
            See all →
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p>No canteens found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((canteen) => (
              <CanteenCard key={canteen._id} canteen={canteen} onClick={() => navigate(`/canteens/${canteen._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CanteenCard = ({ canteen, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
  >
    {/* Image */}
    <div className="h-40 bg-gradient-to-br from-orange-100 to-primary-100 flex items-center justify-center relative">
      {canteen.image ? (
        <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-6xl">🍽️</span>
      )}
      <div className="absolute top-3 right-3">
        <span className={`badge text-xs font-semibold ${canteen.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {canteen.is_open ? '● Open' : '● Closed'}
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="p-4">
      <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors">
        {canteen.name}
      </h3>
      <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{canteen.description || 'Campus canteen'}</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-medium text-gray-700">{canteen.rating || '4.0'}</span>
          <span className="text-xs text-gray-400">({canteen.total_reviews || 0})</span>
        </div>
        <span className="text-xs text-gray-400">⏱️ {canteen.opening_time} – {canteen.closing_time}</span>
      </div>
    </div>
  </div>
);

export default HomePage;
