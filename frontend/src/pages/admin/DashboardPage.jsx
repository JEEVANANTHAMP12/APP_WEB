import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const STAT_CARDS = [
  { key: 'total_users', label: 'Total Users', icon: '👤', gradient: 'from-blue-500 to-cyan-500', sub: 'Registered accounts' },
  { key: 'total_orders', label: 'Total Orders', icon: '🛒', gradient: 'from-indigo-500 to-violet-500', sub: 'All time' },
  { key: 'platform_revenue', label: 'Platform Revenue', icon: '💰', gradient: 'from-emerald-500 to-teal-500', sub: 'Commission earned', prefix: '₹' },
  { key: 'pending_approvals', label: 'Pending Approvals', icon: '⏳', gradient: 'from-violet-500 to-purple-600', sub: 'Canteen owners' },
];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );

  const labels = stats?.last_30_days?.map((d) => d._id) || [];
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: stats?.last_30_days?.map((d) => d.orders) || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 3,
      },
      {
        label: 'Revenue (₹)',
        data: stats?.last_30_days?.map((d) => d.revenue) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        yAxisID: 'rev',
        pointBackgroundColor: '#22c55e',
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(148,163,184,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b' },
        grid: { color: 'rgba(255,255,255,0.04)' },
        title: { display: true, text: 'Orders', color: '#64748b' },
      },
      rev: {
        position: 'right',
        beginAtZero: true,
        ticks: { color: '#64748b' },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Revenue (₹)', color: '#64748b' },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <div key={card.key} className={`card card-hover animate-slide-up delay-${(i + 1) * 100}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-lg mb-3`}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-sm">{card.label}</p>
            <p className={`text-2xl md:text-3xl font-extrabold mt-1 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.prefix || ''}{stats?.[card.key] ?? 0}
            </p>
            <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card animate-slide-up delay-300">
        <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Last 30 Days — Orders &amp; Revenue</h2>
        <div className="h-64">
          <Line data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Pending Approvals */}
      {stats?.pendingOwners?.length > 0 && (
        <div className="card animate-slide-up delay-400">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pending Owner Approvals</h2>
            <button
              onClick={() => navigate('/admin/canteens')}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all →
            </button>
          </div>
          <ul className="space-y-3">
            {stats.pendingOwners.map((o) => (
              <li key={o._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {o.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{o.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/canteens')}
                  className="text-xs bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  Review →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
