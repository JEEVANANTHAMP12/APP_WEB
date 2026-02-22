import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canteenAPI, universityAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const CanteensPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [canteens, setCanteens] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState(
    user?.university_id?._id || user?.university_id || ''
  );
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    universityAPI.getAll({ limit: 100, status: 'active' })
      .then(({ data }) => setUniversities(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    canteenAPI
      .getAll({ university_id: selectedUni || undefined, limit: 50 })
      .then(({ data }) => setCanteens(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedUni]);

  const filtered = canteens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Browse Canteens</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Search canteens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
        <select
          value={selectedUni}
          onChange={(e) => setSelectedUni(e.target.value)}
          className="input sm:w-56"
        >
          <option value="">All Universities</option>
          {universities.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-medium">No canteens found</p>
          <p className="text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((canteen) => (
            <div
              key={canteen._id}
              onClick={() => navigate(`/canteens/${canteen._id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
            >
              <div className="h-44 bg-gradient-to-br from-orange-50 to-primary-50 flex items-center justify-center relative">
                {canteen.image ? (
                  <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl">🍽️</span>
                )}
                <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-semibold ${canteen.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {canteen.is_open ? '● Open' : '● Closed'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {canteen.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  🎓 {canteen.university_id?.name || 'University'}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-semibold text-gray-700">{canteen.rating || '4.0'}</span>
                  </div>
                  <span className="text-xs text-gray-400">{canteen.total_orders || 0} orders</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CanteensPage;
