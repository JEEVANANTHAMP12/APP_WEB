import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Clock, Building2 } from 'lucide-react';
import { canteenAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const CanteensPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [canteens, setCanteens] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Always locked to the student's university
  const universityId = user?.university_id?._id || user?.university_id;
  const universityName = user?.university_id?.name || '';

  useEffect(() => {
    if (!universityId) { setLoading(false); return; }
    setLoading(true);
    canteenAPI
      .getAll({ university_id: universityId, limit: 50 })
      .then(({ data }) => setCanteens(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [universityId]);

  const filtered = canteens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // No university assigned
  if (!universityId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-title">Browse Canteens</h1>
          <p className="page-subtitle">Canteens at your campus</p>
        </div>
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Building2 size={24} style={{ color: '#F59E0B' }} />
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>No university linked</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your account is not linked to a university. Please contact admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Browse Canteens</h1>
        <p className="page-subtitle">
          {universityName && <span className="text-indigo-400 font-medium">{universityName} · </span>}
          {filtered.length} canteen{filtered.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search canteens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="empty-state py-20">
          <div className="empty-icon">🔍</div>
          <p className="empty-title">No canteens found</p>
          <p className="empty-desc">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((canteen, i) => (
            <div
              key={canteen._id}
              onClick={() => navigate(`/student/canteens/${canteen._id}`)}
              className="card-hover group overflow-hidden cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-44 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative"
                   style={{ background: 'linear-gradient(135deg, #6366f115, #a855f715)' }}>
                {canteen.image ? (
                  <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-5xl">🍽️</span>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm
                  ${canteen.is_open ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                  {canteen.is_open ? '● Open' : '● Closed'}
                </span>
              </div>
              <h3 className="font-bold text-base truncate group-hover:text-indigo-400 transition-colors"
                  style={{ color: 'var(--text-primary)' }}>{canteen.name}</h3>
              {canteen.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{canteen.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{canteen.rating}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({canteen.total_reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={11} /> {canteen.opening_time} – {canteen.closing_time}
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
