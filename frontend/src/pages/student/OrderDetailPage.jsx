import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const stages = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];
const stageInfo = {
  placed:    { icon: '📋', label: 'Placed' },
  confirmed: { icon: '✅', label: 'Confirmed' },
  preparing: { icon: '👨‍🍳', label: 'Preparing' },
  ready:     { icon: '🔔', label: 'Ready' },
  picked_up: { icon: '✅', label: 'Picked Up' },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { on, off } = useSocket() || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!on) return;
    const handler = (data) => {
      if (data.order_id === id) {
        setOrder((prev) => prev ? { ...prev, order_status: data.order_status } : prev);
        toast.success(`Order ${data.order_status.replace('_', ' ').toUpperCase()} 🔔`);
      }
    };
    on('order_status_update', handler);
    return () => off?.('order_status_update', handler);
  }, [id, on, off]);

  if (loading) return <Loading />;
  if (!order) return <div className="text-center py-20 text-slate-400">Order not found</div>;

  const currentStage = stages.indexOf(order.order_status);
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/student/orders')} className="btn-ghost -ml-2">
        ← Back to Orders
      </button>

      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">Order #{order.order_number}</h1>
            <p className="text-sm text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right flex flex-col gap-1">
            <StatusBadge status={order.order_status} />
            <StatusBadge status={order.payment_status} />
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="mt-6">
            <div className="relative flex justify-between items-start">
              {stages.map((stage, i) => {
                const done = i <= currentStage;
                return (
                  <div key={stage} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${done ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30' : 'bg-white/10'}`}>
                      {done ? stageInfo[stage].icon : <span className="text-slate-500 text-xs">○</span>}
                    </div>
                    <span className={`text-xs font-medium text-center ${done ? 'text-orange-300' : 'text-slate-500'}`}>
                      {stageInfo[stage].label}
                    </span>
                    {i < stages.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-700 ${i < currentStage ? 'bg-orange-500' : 'bg-white/10'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm font-medium">
            ❌ This order was cancelled
            {order.payment_status === 'refunded' && ' · Refund initiated'}
          </div>
        )}

        {order.order_status === 'ready' && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-emerald-300 font-semibold mb-3">🔔 Your order is ready for pickup!</p>
            <div className="bg-black/20 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-2">Show this code at the counter</p>
              <p className="font-mono text-lg font-bold text-white bg-white/10 px-6 py-2 rounded-lg inline-block">
                {order.qr_code}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canteen */}
      <div className="card">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Canteen</p>
        <p className="font-semibold text-white">🍽️ {order.canteen_id?.name}</p>
        {order.canteen_id?.phone && <p className="text-sm text-slate-400 mt-1">📞 {order.canteen_id.phone}</p>}
      </div>

      {/* Items */}
      <div className="card">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Items Ordered</p>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>🍱</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">₹{item.price} × {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-white">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white">
            <span>Total</span>
            <span className="gradient-text text-lg">₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {order.special_instructions && (
        <div className="card">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Special Instructions</p>
          <p className="text-slate-300 text-sm">{order.special_instructions}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
