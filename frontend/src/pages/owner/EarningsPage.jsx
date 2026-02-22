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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Earnings</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-3xl font-bold text-green-600">₹{analytics?.total_revenue || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Total Net Revenue</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-gray-800">{analytics?.total_orders || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Total Orders</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-blue-600">
            ₹{analytics?.total_orders > 0 ? Math.round(analytics.total_revenue / analytics.total_orders) : 0}
          </p>
          <p className="text-sm text-gray-400 mt-1">Avg Order Value</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4">Daily Revenue (Last 7 Days)</h3>
        <Bar
          data={{
            labels,
            datasets: [{
              label: 'Net Revenue (₹)',
              data: revenue,
              backgroundColor: 'rgba(34,197,94,0.7)',
              borderRadius: 8,
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4">Order Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {analytics?.status_breakdown?.map((s) => (
            <div key={s._id} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{s.count}</p>
              <p className="text-sm text-gray-500 capitalize mt-1">{s._id.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
