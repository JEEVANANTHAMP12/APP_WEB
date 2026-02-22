import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    orderAPI
      .getMyOrders({ limit: 30, status: filter || undefined })
      .then(({ data }) => setOrders(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-40 text-sm"
        >
          <option value="">All Orders</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="picked_up">Picked Up</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-6">Your orders will appear here</p>
          <button onClick={() => navigate('/canteens')} className="btn-primary">
            Order Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-800">#{order.order_number}</h3>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    🍽️ {order.canteen_id?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.items?.length} items · {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-lg">₹{order.total_amount}</p>
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>

              {/* Order status progress */}
              {order.order_status !== 'cancelled' && order.order_status !== 'picked_up' && (
                <div className="mt-4 flex items-center gap-1">
                  {['placed', 'confirmed', 'preparing', 'ready', 'picked_up'].map((s, i) => {
                    const stages = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];
                    const current = stages.indexOf(order.order_status);
                    const done = i <= current;
                    return (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-primary-500' : 'bg-gray-200'}`} />
                        {i < 4 && <div className={`flex-1 h-0.5 ${i < current ? 'bg-primary-500' : 'bg-gray-200'}`} />}
                      </div>
                    );
                  })}
                  <span className="ml-2 text-xs text-gray-400 capitalize">
                    {order.order_status.replace('_', ' ')}
                  </span>
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
