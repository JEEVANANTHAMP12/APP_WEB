import { useState } from 'react';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const QRVerifyPage = () => {
  const [qrInput, setQrInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setLoading(true);
    setOrder(null);
    setDone(false);
    try {
      const { data } = await orderAPI.verifyQR(qrInput.trim());
      setOrder(data.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid QR code');
    } finally { setLoading(false); }
  };

  const handleMarkPickedUp = async () => {
    setMarking(true);
    try {
      await orderAPI.updateStatus(order._id, 'picked_up');
      setDone(true);
      toast.success('Order marked as picked up!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setMarking(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">QR Verification</h1>

      <div className="card space-y-4">
        <p className="text-sm text-gray-500">
          Scan or paste the order QR code from the student's app to verify and confirm pickup.
        </p>
        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Paste QR code here..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary px-5">
            {loading ? '...' : 'Verify'}
          </button>
        </form>
      </div>

      {order && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</h2>
            <StatusBadge status={done ? 'picked_up' : order.order_status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Student</p>
              <p className="font-semibold text-gray-800">{order.user_id?.name || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Payment</p>
              <p className="font-semibold capitalize text-gray-800">{order.payment_method}</p>
            </div>
            <div>
              <p className="text-gray-400">Total</p>
              <p className="font-semibold text-gray-800">₹{order.total_amount}</p>
            </div>
            <div>
              <p className="text-gray-400">Payment Status</p>
              <p className={`font-semibold capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Items</p>
            <ul className="space-y-1">
              {order.items?.map((item, i) => (
                <li key={i} className="flex justify-between text-sm text-gray-700">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          {!done && order.order_status === 'ready' ? (
            <button onClick={handleMarkPickedUp} disabled={marking} className="btn-primary w-full">
              {marking ? 'Marking...' : '✓ Confirm Pickup'}
            </button>
          ) : done ? (
            <div className="bg-green-50 text-green-700 text-center py-3 rounded-xl text-sm font-semibold">
              ✓ Order successfully picked up!
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-700 text-center py-3 rounded-xl text-sm font-semibold">
              Order is not yet ready for pickup (status: {order.order_status})
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRVerifyPage;
