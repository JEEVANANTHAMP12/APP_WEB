import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const stages = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];
const stageIcons = { placed: '📋', confirmed: '✅', preparing: '👨‍🍳', ready: '🔔', picked_up: '✅' };

const OrderDetailPage = () => {
  const { id } = useParams();
  const { on, off } = useSocket() || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    orderAPI.getOne(id)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Live updates
  useEffect(() => {
    if (!on) return;
    const handler = (data) => {
      if (data.order_id === id) {
        setOrder((prev) => prev ? { ...prev, order_status: data.order_status } : prev);
        toast.success(`Order status: ${data.order_status.replace('_', ' ').toUpperCase()} 🔔`);
      }
    };
    on('order_status_update', handler);
    return () => off?.('order_status_update', handler);
  }, [id, on, off]);

  if (loading) return <Loading />;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const currentStage = stages.indexOf(order.order_status);
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <StatusBadge status={order.order_status} />
            <p className="text-xs text-gray-400 mt-1">
              <StatusBadge status={order.payment_status} />
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="mt-6">
            <div className="relative flex justify-between">
              {stages.map((stage, i) => (
                <div key={stage} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                    i <= currentStage ? 'bg-primary-500 shadow-lg shadow-primary-200' : 'bg-gray-100'
                  }`}>
                    {i <= currentStage ? stageIcons[stage] : <span className="text-gray-300">○</span>}
                  </div>
                  <span className={`text-xs font-medium capitalize ${i <= currentStage ? 'text-primary-600' : 'text-gray-400'}`}>
                    {stage.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 z-0">
                <div
                  className="h-full bg-primary-400 transition-all duration-700"
                  style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-4 bg-red-50 rounded-xl p-4 text-red-600 text-sm font-medium">
            ❌ This order was cancelled
            {order.payment_status === 'refunded' && ' · Refund initiated'}
          </div>
        )}

        {order.order_status === 'ready' && (
          <div className="mt-4 bg-green-50 rounded-xl p-4">
            <p className="text-green-700 font-semibold mb-2">🔔 Your order is ready for pickup!</p>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Show this QR code at the counter</p>
              <p className="font-mono text-sm font-bold text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">
                {order.qr_code}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canteen */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-2">🍽️ Canteen</h3>
        <p className="text-gray-800 font-medium">{order.canteen_id?.name}</p>
        {order.canteen_id?.phone && (
          <p className="text-sm text-gray-400 mt-1">📞 {order.canteen_id.phone}</p>
        )}
      </div>

      {/* Items */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4">Items Ordered</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>🍱</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">₹{item.price} × {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Special Instructions */}
      {order.special_instructions && (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-2">📝 Special Instructions</h3>
          <p className="text-sm text-gray-600">{order.special_instructions}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
