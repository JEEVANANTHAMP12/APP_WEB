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

const StatCard = ({ label, value, sub, color }) => (
  <div className="card">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

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

  if (loading) return <div className="flex justify-center py-12"><div className="spinner" /></div>;

  const labels = stats?.last30Days?.map((d) => d.date) || [];
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: stats?.last30Days?.map((d) => d.orders) || [],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.08)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Revenue (₹)',
        data: stats?.last30Days?.map((d) => d.revenue) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        yAxisID: 'rev',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Orders' } },
      rev: { position: 'right', beginAtZero: true, title: { display: true, text: 'Revenue (₹)' }, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} color="text-blue-600" />
        <StatCard label="Total Orders" value={stats?.totalOrders || 0} color="text-orange-500" />
        <StatCard label="Platform Revenue" value={`₹${stats?.platformRevenue || 0}`} color="text-green-600" />
        <StatCard label="Pending Approvals" value={stats?.pendingApprovals || 0} color="text-red-500" sub="Canteen owners" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Last 30 Days — Orders & Revenue</h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      {stats?.pendingOwners?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Pending Owner Approvals</h2>
            <button onClick={() => navigate('/admin/canteens')} className="text-sm text-primary-600 hover:underline">View all →</button>
          </div>
          <ul className="divide-y">
            {stats.pendingOwners.map((o) => (
              <li key={o._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{o.name}</p>
                  <p className="text-xs text-gray-400">{o.email}</p>
                </div>
                <button
                  onClick={() => navigate('/admin/canteens')}
                  className="text-xs bg-orange-50 text-orange-500 hover:bg-orange-100 px-3 py-1 rounded-lg font-semibold"
                >
                  Review
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
