import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI, orderAPI } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

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
      .then(([analyticsRes, ordersRes]) => {
        setAnalytics(analyticsRes.data.data);
        setRecentOrders(ordersRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loading />;

  const chartLabels = analytics?.last_7_days?.map((d) => d._id) || [];
  const revenueData = analytics?.last_7_days?.map((d) => d.revenue) || [];
  const ordersData = analytics?.last_7_days?.map((d) => d.orders) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name} 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: analytics?.total_orders || 0, icon: '📦', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Revenue', value: `₹${analytics?.total_revenue || 0}`, icon: '💰', color: 'bg-green-50 text-green-600' },
          { label: 'Today Orders', value: analytics?.last_7_days?.[analytics.last_7_days.length - 1]?.orders || 0, icon: '🛎️', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Pending', value: analytics?.status_breakdown?.find(s => s._id === 'placed')?.count || 0, icon: '⏳', color: 'bg-orange-50 text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-2xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4">Revenue (Last 7 Days)</h3>
          <Bar
            data={{
              labels: chartLabels,
              datasets: [{
                label: 'Revenue (₹)',
                data: revenueData,
                backgroundColor: 'rgba(249,115,22,0.7)',
                borderRadius: 6,
              }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4">Orders (Last 7 Days)</h3>
          <Line
            data={{
              labels: chartLabels,
              datasets: [{
                label: 'Orders',
                data: ordersData,
                borderColor: '#f97316',
                backgroundColor: 'rgba(249,115,22,0.1)',
                fill: true,
                tension: 0.4,
              }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header text-left">Order #</th>
                  <th className="table-header text-left">Customer</th>
                  <th className="table-header text-left">Amount</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="table-cell font-medium">#{order.order_number}</td>
                    <td className="table-cell">{order.user_id?.name}</td>
                    <td className="table-cell font-semibold">₹{order.total_amount}</td>
                    <td className="table-cell"><StatusBadge status={order.order_status} /></td>
                    <td className="table-cell text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</td>
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
