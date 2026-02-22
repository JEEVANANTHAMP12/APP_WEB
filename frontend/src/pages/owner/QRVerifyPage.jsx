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
      toast.success('Order marked as picked up! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setMarking(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">QR Verification</h1>
        <p className="page-subtitle">Scan or paste a student order code to confirm pickup</p>
      </div>

      {/* Input form */}
      <div className="card space-y-4">
        <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed" style={{ background: 'var(--bg-elevated)', borderColor: '#6366f150' }}>
          <div className="text-center">
            <span className="text-4xl block mb-2">📷</span>
            <p className="text-slate-400 text-sm">Manual code entry below</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex gap-3">
          <input
            className="input flex-1 font-mono"
            placeholder="Paste QR code or order code..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
          <button type="submit" disabled={loading || !qrInput.trim()} className="btn-primary shrink-0">
            {loading ? '...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Order Result */}
      {order && (
        <div className={`card space-y-4 border-2 transition-all ${done ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}
             style={!done ? { borderColor: '#6366f150' } : {}}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-lg">#{order.order_number}</h2>
              <p className="text-slate-400 text-sm mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <StatusBadge status={done ? 'picked_up' : order.order_status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Student', order.user_id?.name || '—'],
              ['Payment', order.payment_method?.replace('_', ' ')],
              ['Total', `₹${order.total_amount}`],
              ['Pay Status', order.payment_status],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="font-semibold text-white text-sm capitalize">{val}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-1">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-slate-300">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {!done && order.order_status === 'ready' && (
            <button onClick={handleMarkPickedUp} disabled={marking} className="btn-primary w-full py-3">
              {marking ? 'Marking...' : '✅ Mark as Picked Up'}
            </button>
          )}

          {done && (
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
              <span className="text-3xl">✅</span>
              <p className="text-emerald-300 font-semibold mt-2">Order Successfully Picked Up!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRVerifyPage;
