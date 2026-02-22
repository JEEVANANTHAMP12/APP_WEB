import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wallet, Package, Store, ArrowRight, Star, Clock } from 'lucide-react';
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-white"
           style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-[80px]"
             style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10 blur-[60px]"
             style={{ background: 'radial-gradient(circle, #fff, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium mb-1 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-white/90">{firstName}!</span>
          </h1>
          <p className="mt-2 text-white/70 text-lg">What are you craving today?</p>

          {/* Search */}
          <div className="relative mt-6 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search canteens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder-white/50
                         focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Wallet, label: 'Wallet Balance',
            value: `₹${user?.wallet_balance?.toLocaleString() || 0}`,
            sub: 'Available', accent: '#6366f1',
            action: () => navigate('/student/wallet'),
          },
          {
            icon: Package, label: 'My Orders',
            value: 'View All', sub: 'Track your orders', accent: '#8b5cf6',
            action: () => navigate('/student/orders'),
          },
          {
            icon: Store, label: 'Canteens Nearby',
            value: canteens.length,
            sub: 'On your campus', accent: '#a855f7',
            action: () => navigate('/student/canteens'),
          },
        ].map(({ icon: Icon, label, value, sub, accent, action }) => (
          <button key={label} onClick={action}
                  className="card text-left hover:scale-[1.02] transition-transform group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: `${accent}20`, color: accent }}>
                <Icon size={18} />
              </div>
              <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: accent }} />
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-sm font-medium mt-0.5" style={{ color: accent }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
          </button>
        ))}
      </div>

      {/* Canteens */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="page-title" style={{ fontSize: '1.25rem' }}>
              {search ? `Results for "${search}"` : 'Available Canteens'}
            </h2>
            <p className="page-subtitle text-xs">{filtered.length} canteen{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={() => navigate('/student/canteens')} className="btn-secondary py-2 px-4 text-sm">
            See all
          </button>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <div className="empty-state py-20">
            <div className="empty-icon">🍽️</div>
            <p className="empty-title">No canteens found</p>
            <p className="empty-desc">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((canteen, idx) => (
              <CanteenCard key={canteen._id} canteen={canteen}
                           onClick={() => navigate(`/student/canteens/${canteen._id}`)}
                           delay={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CanteenCard = ({ canteen, onClick, delay }) => (
  <div onClick={onClick}
       style={{ animationDelay: `${delay * 60}ms` }}
       className="card-hover group overflow-hidden cursor-pointer animate-slide-up">
    {/* Image */}
    <div className="h-44 rounded-xl overflow-hidden flex items-center justify-center relative mb-4"
         style={{ background: 'linear-gradient(135deg, #6366f120, #a855f720)' }}>
      {canteen.image ? (
        <img src={canteen.image} alt={canteen.name}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <span className="text-5xl">🍽️</span>
      )}
      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm
        ${canteen.is_open ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
        {canteen.is_open ? '● Open' : '● Closed'}
      </span>
    </div>

    {/* Info */}
    <h3 className="font-bold text-base group-hover:text-indigo-400 transition-colors truncate"
        style={{ color: 'var(--text-primary)' }}>{canteen.name}</h3>
    {canteen.description && (
      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{canteen.description}</p>
    )}

    <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-1">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{canteen.rating || '4.0'}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({canteen.total_reviews || 0})</span>
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Clock size={11} />
        {canteen.opening_time}–{canteen.closing_time}
      </div>
    </div>
  </div>
);

export default HomePage;
