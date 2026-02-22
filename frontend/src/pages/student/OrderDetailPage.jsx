import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  ClipboardList, CheckCircle2, ChefHat, Bell, PackageCheck,
  ArrowLeft, Phone, QrCode, XCircle, Utensils,
} from 'lucide-react';

const stages = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];
const stageInfo = {
  placed:    { icon: ClipboardList, label: 'Placed'    },
  confirmed: { icon: CheckCircle2,  label: 'Confirmed' },
  preparing: { icon: ChefHat,       label: 'Preparing' },
  ready:     { icon: Bell,          label: 'Ready'     },
  picked_up: { icon: PackageCheck,  label: 'Picked Up' },
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
  if (!order) return <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>Order not found</div>;

  const currentStage = stages.indexOf(order.order_status);
  const isCancelled = order.order_status === 'cancelled';

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/student/orders')}
              className="btn-ghost -ml-2 gap-2 flex items-center text-sm">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Order #{order.order_number}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <StatusBadge status={order.order_status} />
            <StatusBadge status={order.payment_status} />
          </div>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="mt-8 mb-2">
            <div className="relative flex justify-between items-start">
              {/* Connector line base */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5" style={{ background: 'var(--border-color)' }} />
              {/* Connector line progress */}
              {currentStage > 0 && (
                <div
                  className="absolute top-5 left-[10%] h-0.5 transition-all duration-700"
                  style={{
                    background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                    width: `${(currentStage / (stages.length - 1)) * 80}%`,
                  }}
                />
              )}
              {stages.map((stage, i) => {
                const Icon = stageInfo[stage].icon;
                const done  = i <= currentStage;
                const active = i === currentStage;
                return (
                  <div key={stage} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                      style={done
                        ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: active ? '0 0 16px rgba(79,70,229,0.5)' : 'none' }
                        : { background: 'var(--bg-elevated)', border: '2px solid var(--border-color)' }
                      }
                    >
                      <Icon
                        size={16}
                        strokeWidth={2}
                        style={{ color: done ? '#fff' : 'var(--text-muted)' }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium text-center leading-tight"
                      style={{ color: done ? '#4F46E5' : 'var(--text-muted)' }}
                    >
                      {stageInfo[stage].label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-5 flex items-start gap-3 rounded-xl p-4 border"
               style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Order cancelled</p>
              {order.payment_status === 'refunded' && (
                <p className="text-xs mt-0.5 text-red-300/70">Refund has been initiated</p>
              )}
            </div>
          </div>
        )}

        {order.order_status === 'ready' && (
          <div className="mt-5 rounded-xl p-4 border"
               style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Bell size={16} className="text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-400">Your order is ready for pickup!</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl"
                 style={{ background: 'var(--bg-elevated)' }}>
              <QrCode size={18} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Show this code at the counter</p>
              <p className="font-mono text-lg font-bold px-6 py-2 rounded-lg"
                 style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', letterSpacing: '0.15em' }}>
                {order.qr_code}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Canteen */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Canteen</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'rgba(79,70,229,0.1)' }}>
            <Utensils size={17} style={{ color: '#4F46E5' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{order.canteen_id?.name}</p>
            {order.canteen_id?.phone && (
              <a href={`tel:${order.canteen_id.phone}`}
                 className="text-xs flex items-center gap-1 mt-0.5 hover:text-indigo-400 transition-colors"
                 style={{ color: 'var(--text-muted)' }}>
                <Phone size={11} /> {order.canteen_id.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Items Ordered</p>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Utensils size={14} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>₹{item.price} × {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <span>Total</span>
            <span className="gradient-text text-lg">₹{order.total_amount}</span>
          </div>
        </div>
      </div>

      {order.special_instructions && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Special Instructions</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.special_instructions}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
