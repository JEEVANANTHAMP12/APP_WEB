// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import {
  Bar, Line, ComposedChart, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Label,
} from 'recharts';
import { ChartTooltipContent, selectEvenlySpacedItems } from '../../components/charts/ChartsBase';
import { Users, ShoppingCart, IndianRupee, Clock, ArrowUpRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STAT_CARDS = [
  {
    key: 'total_users',
    label: 'Total Users',
    sub: 'Registered accounts',
    icon: Users,
    iconBg: 'rgba(79,70,229,0.1)',
    iconColor: '#4F46E5',
  },
  {
    key: 'total_orders',
    label: 'Total Orders',
    sub: 'All time',
    icon: ShoppingCart,
    iconBg: 'rgba(124,58,237,0.1)',
    iconColor: '#7C3AED',
  },
  {
    key: 'platform_revenue',
    label: 'Platform Revenue',
    sub: 'Commission earned',
    icon: IndianRupee,
    prefix: '₹',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#10B981',
  },
  {
    key: 'pending_approvals',
    label: 'Pending Approvals',
    sub: 'Canteen owners',
    icon: Clock,
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#F59E0B',
  },
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
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  const chartData = (stats?.last_30_days || []).map((d) => ({
    date: d._id,
    A: d.orders,
    B: d.revenue,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          const raw = stats?.[card.key] ?? 0;
          const display = `${card.prefix || ''}${raw.toLocaleString()}`;
          return (
            <div key={card.key} className="card card-hover group animate-slide-up">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                     style={{ background: card.iconBg }}>
                  <Icon size={18} style={{ color: card.iconColor }} />
                </div>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity"
                              style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {display}
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Last 30 Days — Orders &amp; Revenue
          </h2>
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
        <div style={{ height: 240 }}>
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
                ticks={selectEvenlySpacedItems(chartData, 6).map((d) => d.date)}
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
                maxBarSize={12}
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
                yAxisId={0}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Approvals */}
      {stats?.pendingOwners?.length > 0 && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Pending Owner Approvals</h2>
            <button
              onClick={() => navigate('/admin/canteens')}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <ul className="space-y-2">
            {stats.pendingOwners.map((o) => (
              <li key={o._id} className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                       style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                    {o.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{o.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/canteens')}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  style={{ background: 'rgba(79,70,229,0.1)', color: '#4F46E5' }}
                >
                  <CheckCircle size={12} /> Review
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
