import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI, orderAPI } from '../../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const chartOptions = (label) => ({
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
  },
});

const DashboardPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.canteen_id) { setLoading(false); return; }
    const canteenId = user.canteen_id._id || user.canteen_id;
    Promise.all([
      canteenAPI.analytics(canteenId),
      orderAPI.getCanteenOrders(canteenId, { limit: 5 }),
    ])
      .then(([a, o]) => { setAnalytics(a.data.data); setRecentOrders(o.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loading />;

  const labels = analytics?.last_7_days?.map((d) => d._id) || [];
  const revenueData = analytics?.last_7_days?.map((d) => d.revenue) || [];
  const ordersData = analytics?.last_7_days?.map((d) => d.orders) || [];

  const stats = [
    { label: 'Total Orders', value: analytics?.total_orders || 0, icon: '📦', color: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-300' },
    { label: 'Total Revenue', value: `₹${analytics?.total_revenue || 0}`, icon: '💰', color: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-300' },
    { label: "Today's Orders", value: analytics?.last_7_days?.[analytics.last_7_days.length - 1]?.orders || 0, icon: '🛎️', color: 'from-orange-500/20 to-amber-500/20', text: 'text-orange-300' },
    { label: 'Pending', value: analytics?.status_breakdown?.find(s => s._id === 'placed')?.count || 0, icon: '⏳', color: 'from-violet-500/20 to-purple-500/20', text: 'text-violet-300' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`card bg-gradient-to-br ${s.color}`}>
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-bold text-white mb-4">Revenue — Last 7 Days</h3>
          <Bar
            data={{ labels, datasets: [{ label: 'Revenue (₹)', data: revenueData, backgroundColor: 'rgba(249,115,22,0.6)', borderRadius: 6 }] }}
            options={chartOptions('Revenue')}
          />
        </div>
        <div className="card">
          <h3 className="font-bold text-white mb-4">Orders — Last 7 Days</h3>
          <Line
            data={{ labels, datasets: [{ label: 'Orders', data: ordersData, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.1)', fill: true, tension: 0.4 }] }}
            options={chartOptions('Orders')}
          />
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h3 className="font-bold text-white mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="table-header">Order #</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="table-cell font-medium text-white">#{o.order_number}</td>
                    <td className="table-cell">{o.user_id?.name}</td>
                    <td className="table-cell font-semibold text-white">₹{o.total_amount}</td>
                    <td className="table-cell"><StatusBadge status={o.order_status} /></td>
                    <td className="table-cell">{new Date(o.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
