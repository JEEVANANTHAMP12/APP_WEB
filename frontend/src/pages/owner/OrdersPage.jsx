import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  placed:    { next: 'confirmed', label: 'Accept',   color: 'bg-blue-500 hover:bg-blue-600' },
  confirmed: { next: 'preparing', label: 'Preparing', color: 'bg-indigo-500 hover:bg-indigo-600' },
  preparing: { next: 'ready',    label: 'Mark Ready', color: 'bg-emerald-500 hover:bg-emerald-600' },
  ready:     { next: 'picked_up', label: 'Picked Up',  color: 'bg-slate-500/20 text-slate-500 hover:bg-slate-500/30' },
};

const FILTERS = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled', ''];
const FILTER_LABELS = { '': 'All', placed: 'New', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', picked_up: 'Done', cancelled: 'Cancelled' };

const OrdersPage = () => {
  const { user } = useAuth();
  const { on, off } = useSocket() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('placed');
  const [updating, setUpdating] = useState(null);

  const canteenId = user?.canteen_id?._id || user?.canteen_id;

  const fetchOrders = useCallback(() => {
    if (!canteenId) return;
    setLoading(true);
    orderAPI
      .getCanteenOrders(canteenId, { status: filter || undefined, limit: 50 })
      .then(({ data }) => setOrders(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canteenId, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!on) return;
    const handler = (data) => {
      toast.success(`🛎️ New Order #${data.order_number}!`, { duration: 6000, icon: '🔔' });
      fetchOrders();
    };
    on('new_order', handler);
    return () => off?.('new_order', handler);
  }, [on, off, fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, order_status: newStatus } : o));
      toast.success(`Order → ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(orderId, 'cancelled');
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      toast.success('Order cancelled');
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Live Orders</h1>
          <p className="page-subtitle">{orders.length} orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm">↻ Refresh</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-brand-gradient text-white shadow-brand'
                : 'hover:bg-white/10'
            }`}
            style={filter !== f ? { background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' } : {}}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : orders.length === 0 ? (
        <div className="empty-state py-16">
          <div className="empty-icon">📭</div>
          <p className="empty-title">No orders here</p>
          <p className="empty-desc">New orders will appear in real-time</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>#{order.order_number}</span>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{order.user_id?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <p className="font-bold text-lg shrink-0" style={{ color: 'var(--text-primary)' }}>₹{order.total_amount}</p>
              </div>

              {/* Items preview */}
              <div className="space-y-1">
                {order.items?.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                  {order.items?.length > 3 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+{order.items.length - 3} more items</p>}
              </div>

              {order.special_instructions && (
                <p className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg px-3 py-2">
                  📝 {order.special_instructions}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                {STATUS_FLOW[order.order_status] && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, STATUS_FLOW[order.order_status].next)}
                    disabled={updating === order._id}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all ${STATUS_FLOW[order.order_status].color} disabled:opacity-50`}
                  >
                    {updating === order._id ? '...' : STATUS_FLOW[order.order_status].label}
                  </button>
                )}
                {['placed', 'confirmed'].includes(order.order_status) && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    disabled={updating === order._id}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
