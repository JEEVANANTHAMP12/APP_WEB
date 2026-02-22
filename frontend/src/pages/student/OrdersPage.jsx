import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';

const FILTERS = ['', 'placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'];
const FILTER_LABELS = { '': 'All', placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', picked_up: 'Picked Up', cancelled: 'Cancelled' };

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    orderAPI
      .getMyOrders({ limit: 30, status: filter || undefined })
      .then(({ data }) => setOrders(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const stages = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">Track your food orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-slate-400 mb-6">Your orders will appear here</p>
          <button onClick={() => navigate('/student/canteens')} className="btn-primary">Order Now</button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/student/orders/${order._id}`)}
              className="card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-bold text-white">#{order.order_number}</h3>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">🍽️ {order.canteen_id?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.items?.length} items · {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-white text-lg">₹{order.total_amount}</p>
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>

              {order.order_status !== 'cancelled' && order.order_status !== 'picked_up' && (
                <div className="mt-4 flex items-center gap-1">
                  {stages.map((stage, i) => {
                    const current = stages.indexOf(order.order_status);
                    return (
                      <div key={stage} className="flex items-center flex-1">
                        <div className={`w-3 h-3 rounded-full transition-all ${i <= current ? 'bg-orange-500 shadow-sm shadow-orange-500' : 'bg-white/20'}`} />
                        {i < stages.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-0.5 ${i < current ? 'bg-orange-500' : 'bg-white/10'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
