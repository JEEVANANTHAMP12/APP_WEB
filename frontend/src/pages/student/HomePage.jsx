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
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-orange-500/30">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="text-5xl">👋</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Hello, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-white/80 text-lg mt-1">Let's find something delicious</p>
            </div>
          </div>

          <div className="relative mt-8 group">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg group-focus-within:bg-white/30 transition-all duration-300" />
            <div className="relative flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-white/50 transition-all duration-300">
              <span className="text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Search canteens or dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/60 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Wallet Card */}
        <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">💰</span>
              <span className="px-3 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg text-xs font-semibold">Wallet</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">₹{user?.wallet_balance || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Available balance</p>
          </div>
        </div>

        {/* Orders Card */}
        <div 
          onClick={() => navigate('/student/orders')}
          className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-6 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📦</span>
              <span className="px-3 py-1 bg-purple-200 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-lg text-xs font-semibold">Orders</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">View</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">All your orders</p>
          </div>
        </div>

        {/* Canteens Card */}
        <div 
          onClick={() => navigate('/student/canteens')}
          className="group relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl p-6 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🍽️</span>
              <span className="px-3 py-1 bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 rounded-lg text-xs font-semibold">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{canteens.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Available canteens</p>
          </div>
        </div>
      </div>

      {/* Canteens Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Canteens</h2>
          <button
            onClick={() => navigate('/student/canteens')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            See All →
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-6xl mb-4 animate-bounce">🍽️</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">No canteens found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((canteen, idx) => (
              <CanteenCard 
                key={canteen._id} 
                canteen={canteen} 
                onClick={() => navigate(`/student/canteens/${canteen._id}`)}
                delay={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CanteenCard = ({ canteen, onClick, delay }) => (
  <div
    onClick={onClick}
    style={{ animationDelay: `${delay * 0.1}s` }}
    className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg hover:shadow-xl dark:hover:shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer overflow-hidden animate-fade-in"
  >
    {/* Image */}
    <div className="relative h-48 bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center overflow-hidden group">
      {canteen.image ? (
        <img 
          src={canteen.image} 
          alt={canteen.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <span className="text-6xl group-hover:scale-125 transition-transform duration-300">🍽️</span>
      )}
      
      {/* Status Badge */}
      <div className="absolute top-4 right-4 backdrop-blur-md">
        <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
          canteen.is_open 
            ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/50' 
            : 'bg-red-500/90 text-white shadow-lg shadow-red-500/50'
        }`}>
          {canteen.is_open ? '🟢 Open' : '🔴 Closed'}
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="p-5">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 truncate">
        {canteen.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
        {canteen.description || 'Campus canteen offering delicious meals'}
      </p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">★</span>
          <span className="font-semibold text-gray-900 dark:text-white">{canteen.rating || '4.0'}</span>
          <span className="text-xs text-gray-400">({canteen.total_reviews || 0})</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
          {canteen.opening_time} – {canteen.closing_time}
        </span>
      </div>
    </div>

    {/* Hover Arrow */}
    <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
      →
    </div>
  </div>
);

export default HomePage;
