// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canteenAPI, orderAPI } from '../../services/api';
import {
  Bar, Line, ComposedChart, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Label,
} from 'recharts';
import { ChartTooltipContent, selectEvenlySpacedItems } from '../../components/charts/ChartsBase';
import { ShoppingBag, IndianRupee, Bell, Clock, ArrowUpRight } from 'lucide-react';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';

const KPI_DEFS = [
  {
    key: 'total_orders',
    label: 'Total Orders',
    icon: ShoppingBag,
    iconBg: 'rgba(79,70,229,0.1)',
    iconColor: '#4F46E5',
    valueFn: (a) => a?.total_orders ?? 0,
  },
  {
    key: 'total_revenue',
    label: 'Total Revenue',
    icon: IndianRupee,
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#10B981',
    valueFn: (a) => `₹${(a?.total_revenue ?? 0).toLocaleString()}`,
  },
  {
    key: 'today_orders',
    label: "Today's Orders",
    icon: Bell,
    iconBg: 'rgba(124,58,237,0.1)',
    iconColor: '#7C3AED',
    valueFn: (a) => a?.last_7_days?.[a.last_7_days.length - 1]?.orders ?? 0,
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: Clock,
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#F59E0B',
    valueFn: (a) => a?.status_breakdown?.find(s => s._id === 'placed')?.count ?? 0,
  },
];

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

  const chartData = (analytics?.last_7_days || []).map((d) => ({
    date: d._id,
    A: d.orders,
    B: d.revenue,
  }));

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
             style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DEFS.map((kpi) => {
          const Icon = kpi.icon;
          const value = kpi.valueFn(analytics);
          return (
            <div key={kpi.key} className="card card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                     style={{ background: kpi.iconBg }}>
                  <Icon size={18} style={{ color: kpi.iconColor }} />
                </div>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {value}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                {kpi.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Orders &amp; Revenue — Last 7 Days</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Daily breakdown</p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#6366f1' }} />
              Orders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: '#818cf8' }} />
              Revenue (₹)
            </span>
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ left: 4, right: 0, top: 8, bottom: 18 }}
            >
              <CartesianGrid vertical={false} stroke="var(--border-color)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                ticks={selectEvenlySpacedItems(chartData, 7).map((d) => d.date)}
              >
                <Label value="Date" fill="var(--text-muted)" style={{ fontSize: 11 }} position="bottom" />
              </XAxis>
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                tickFormatter={(v) => Number(v).toLocaleString()}
              >
                <Label
                  value="Orders"
                  fill="var(--text-muted)"
                  style={{ fontSize: 11, textAnchor: 'middle' }}
                  angle={-90}
                  position="insideLeft"
                />
              </YAxis>
              <Tooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  name === 'Revenue (₹)' ? `₹${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                  name,
                ]}
                labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
              />
              <Bar
                isAnimationActive={false}
                name="Orders"
                dataKey="A"
                stackId="a"
                fill="#6366f1"
                maxBarSize={14}
                radius={[4, 4, 0, 0]}
              />
              <Line
                isAnimationActive={false}
                name="Revenue (₹)"
                dataKey="B"
                type="monotone"
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray="0.1 8"
                strokeLinecap="round"
                activeDot={false}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h3 className="font-semibold text-sm mb-5" style={{ color: 'var(--text-primary)' }}>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="empty-state py-12">
            <ShoppingBag size={32} className="mb-3 opacity-30" />
            <p className="empty-title">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="table-header pl-6">Order #</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header pr-6">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="table-cell pl-6 font-mono font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                      #{o.order_number}
                    </td>
                    <td className="table-cell">{o.user_id?.name || '—'}</td>
                    <td className="table-cell font-semibold" style={{ color: 'var(--text-primary)' }}>₹{o.total_amount}</td>
                    <td className="table-cell"><StatusBadge status={o.order_status} /></td>
                    <td className="table-cell pr-6 tabular-nums">{new Date(o.createdAt).toLocaleTimeString()}</td>
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
