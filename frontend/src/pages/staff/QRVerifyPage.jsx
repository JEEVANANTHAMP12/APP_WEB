// @ts-nocheck
import { useState } from 'react';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const StaffQRVerifyPage = () => {
  const [qrInput, setQrInput] = useState('');
  const [order, setOrder] = useState(/** @type {any} */(null));
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);

  /** @param {React.FormEvent} e */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setLoading(true);
    setOrder(null);
    setDone(false);
    try {
      const { data } = await orderAPI.verifyQR(qrInput.trim());
      setOrder(data.data);
      toast.success('QR code verified!');
    } catch (/** @type {any} */ err) {
      toast.error(err.response?.data?.message || 'Invalid QR code');
    } finally { setLoading(false); }
  };

  const handleMarkPickedUp = async () => {
    if (!order) return;
    setMarking(true);
    try {
      await orderAPI.updateStatus(order.order_id || order._id, 'picked_up');
      setDone(true);
      toast.success('Order marked as picked up! ✅');
    } catch (/** @type {any} */ err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setMarking(false); }
  };

  const reset = () => {
    setQrInput('');
    setOrder(null);
    setDone(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">QR Verification</h1>
        <p className="page-subtitle">Scan or paste student order code to confirm pickup</p>
      </div>

      {/* Scanner placeholder + input */}
      <div className="card space-y-4">
        <div className="flex items-center justify-center h-32 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-dashed border-blue-500/30">
          <div className="text-center">
            <span className="text-4xl block mb-2">📷</span>
            <p className="text-slate-400 text-sm">Enter code manually below</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="flex gap-3">
          <input
            className="input flex-1 font-mono"
            placeholder="Paste QR / order code..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !qrInput.trim()}
            className="btn-primary shrink-0"
          >
            {loading ? '...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Order result */}
      {order && (
        <div className={`card space-y-4 border-2 transition-all ${done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-blue-500/30'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-lg">#{order.order_number}</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {order.user_name && <span>👤 {order.user_name}</span>}
              </p>
            </div>
            <StatusBadge status={done ? 'picked_up' : 'ready'} />
          </div>

          {/* Items */}
          {order.items && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Items</p>
              <div className="space-y-1">
                {order.items.map((/** @type {any} */ item, /** @type {number} */ i) => (
                  <div key={i} className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-slate-400">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-white font-bold text-lg">₹{order.total_amount}</span>
          </div>

          {!done && (
            <button
              onClick={handleMarkPickedUp}
              disabled={marking}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50"
            >
              {marking ? 'Marking...' : '✅ Mark as Picked Up'}
            </button>
          )}

          {done && (
            <>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
                <span className="text-3xl">✅</span>
                <p className="text-emerald-300 font-semibold mt-2">Successfully Picked Up!</p>
              </div>
              <button onClick={reset} className="btn-secondary w-full">
                Verify Another Order
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffQRVerifyPage;
