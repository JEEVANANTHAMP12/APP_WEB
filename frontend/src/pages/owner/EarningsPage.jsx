import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Loading from '../../components/common/Loading';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EarningsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const canteenId = user?.canteen_id?._id || user?.canteen_id;

  useEffect(() => {
    canteenAPI.analytics(canteenId)
      .then(({ data }) => setAnalytics(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canteenId]);

  if (loading) return <Loading />;

  const labels = analytics?.last_7_days?.map((d) => d._id) || [];
  const revenue = analytics?.last_7_days?.map((d) => d.revenue) || [];
  const avgOrderValue = analytics?.total_orders > 0
    ? Math.round(analytics.total_revenue / analytics.total_orders)
    : 0;

  const breakdown = analytics?.status_breakdown || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Earnings</h1>
        <p className="page-subtitle">Revenue overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${analytics?.total_revenue || 0}`, icon: '💰', color: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-300' },
          { label: 'Total Orders', value: analytics?.total_orders || 0, icon: '📦', color: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-300' },
          { label: 'Avg Order Value', value: `₹${avgOrderValue}`, icon: '📊', color: 'from-violet-500/20 to-purple-500/20', text: 'text-violet-300' },
        ].map((s) => (
          <div key={s.label} className={`card bg-gradient-to-br ${s.color}`}>
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card">
        <h3 className="font-bold text-white mb-4">Daily Revenue — Last 7 Days</h3>
        <Bar
          data={{
            labels,
            datasets: [{
              label: 'Revenue (₹)',
              data: revenue,
              backgroundColor: 'rgba(34,197,94,0.6)',
              borderRadius: 8,
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            },
          }}
        />
      </div>

      {/* Order status breakdown */}
      {breakdown.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-white mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {breakdown.map((s) => {
              const pct = analytics.total_orders > 0 ? Math.round((s.count / analytics.total_orders) * 100) : 0;
              return (
                <div key={s._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 capitalize">{s._id.replace('_', ' ')}</span>
                    <span className="text-white font-semibold">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsPage;
