import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  placed: { next: 'confirmed', label: 'Accept Order', color: 'bg-blue-500 hover:bg-blue-600' },
  confirmed: { next: 'preparing', label: 'Start Preparing', color: 'bg-indigo-500 hover:bg-indigo-600' },
  preparing: { next: 'ready', label: 'Mark Ready', color: 'bg-green-500 hover:bg-green-600' },
  ready: { next: 'picked_up', label: 'Mark Picked Up', color: 'bg-gray-500 hover:bg-gray-600' },
};

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
    orderAPI
      .getCanteenOrders(canteenId, { status: filter || undefined, limit: 50 })
      .then(({ data }) => setOrders(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canteenId, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Live new order notifications
  useEffect(() => {
    if (!on) return;
    const handler = (data) => {
      toast.success(`🛎️ New Order #${data.order_number}!`, { duration: 5000 });
      fetchOrders();
    };
    on('new_order', handler);
    return () => off?.('new_order', handler);
  }, [on, off, fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, order_status: newStatus } : o))
      );
      toast.success(`Order updated to: ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Live Orders</h1>
        <button onClick={fetchOrders} className="btn-secondary text-sm">
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', 'placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === s
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s ? s.replace('_', ' ').toUpperCase() : 'ALL'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🛎️</div>
          <p>No {filter || ''} orders</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const flow = STATUS_FLOW[order.order_status];
            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">#{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <StatusBadge status={order.order_status} />
                </div>

                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-medium text-gray-700">
                    👤 {order.user_id?.name}
                  </p>
                  {order.user_id?.phone && (
                    <p className="text-xs text-gray-400 mt-0.5">📞 {order.user_id.phone}</p>
                  )}
                </div>

                {/* Items */}
                <div>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{order.total_amount}</span>
                  </div>
                </div>

                {/* Special instructions */}
                {order.special_instructions && (
                  <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
                    📝 {order.special_instructions}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {flow && (
                    <button
                      disabled={updating === order._id}
                      onClick={() => handleStatusUpdate(order._id, flow.next)}
                      className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${flow.color} disabled:opacity-50`}
                    >
                      {updating === order._id ? '...' : flow.label}
                    </button>
                  )}
                  {['placed', 'confirmed'].includes(order.order_status) && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="px-3 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm font-semibold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
