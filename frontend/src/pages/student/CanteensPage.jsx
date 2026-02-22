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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Browse Canteens</h1>
        <p className="page-subtitle">{filtered.length} canteens available</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search canteens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
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
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-white font-semibold text-lg">No canteens found</p>
          <p className="text-slate-400 text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((canteen, i) => (
            <div
              key={canteen._id}
              onClick={() => navigate(`/student/canteens/${canteen._id}`)}
              className="card-hover group overflow-hidden animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-44 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4 relative">
                {canteen.image ? (
                  <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-5xl">🍽️</span>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${canteen.is_open ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                  {canteen.is_open ? '● Open' : '● Closed'}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg group-hover:text-orange-300 transition-colors">{canteen.name}</h3>
              {canteen.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{canteen.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white font-semibold text-sm">{canteen.rating}</span>
                  <span className="text-slate-500 text-xs">({canteen.total_reviews})</span>
                </div>
                <span className="text-slate-400 text-xs">⏱️ {canteen.opening_time} – {canteen.closing_time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CanteensPage;
