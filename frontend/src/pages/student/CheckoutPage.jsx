import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const { cart, cartTotal, canteenId, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const effectiveCanteenId = canteenId || cart[0]?.canteen_id?._id || cart[0]?.canteen_id;
      if (!effectiveCanteenId) {
        toast.error('Canteen info missing. Please clear cart and try again.');
        setLoading(false);
        return;
      }
      const { data: orderData } = await orderAPI.place({
        canteen_id: effectiveCanteenId,
        items: cart.map((i) => ({ menu_item_id: i._id, quantity: i.quantity })),
        payment_method: paymentMethod,
        special_instructions: instructions,
      });
      const order = orderData.data.order;

      if (paymentMethod === 'cash_on_pickup') {
        clearCart();
        toast.success('Order placed! Pay at pickup.');
        navigate(`/student/orders/${order._id}`);
        return;
      }

      if (paymentMethod === 'wallet') {
        clearCart();
        toast.success('Paid from wallet! 🎉');
        navigate(`/student/orders/${order._id}`);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed'); setLoading(false); return; }

      const { data: rzpData } = await paymentAPI.createOrder(order._id);
      const rzp = rzpData.data;

      const options = {
        key: rzp.key,
        amount: rzp.amount,
        currency: rzp.currency,
        name: 'Campus Cravings',
        description: `Order ${rzp.order_number}`,
        order_id: rzp.razorpay_order_id,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order._id,
            });
            clearCart();
            toast.success('Payment successful! 🎉');
            navigate(`/student/orders/${order._id}`);
          } catch { toast.error('Payment verification failed'); }
        },
        modal: { ondismiss: () => toast.error('Payment cancelled') },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const payMethods = [
    { id: 'online', label: 'Online Payment', desc: 'UPI, card, net banking via Razorpay', icon: '💳' },
    { id: 'wallet', label: 'Wallet', desc: `Balance: ₹${user?.wallet_balance || 0}`, icon: '🪙' },
    { id: 'cash_on_pickup', label: 'Cash on Pickup', desc: 'Pay when you collect your order', icon: '💵' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Review your order and pay</p>
      </div>

      {/* Order Summary */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Order Summary</h3>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="pt-3 flex justify-between font-bold" style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)' }}>
            <span>Total</span>
            <span className="gradient-text text-lg">₹{cartTotal}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Method</h3>
        <div className="space-y-2">
          {payMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                paymentMethod === m.id
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'hover:bg-white/5'
              }`}
              style={paymentMethod !== m.id ? { borderColor: 'var(--border-color)' } : {}}
            >
              <span className="text-2xl">{m.icon}</span>
              <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                paymentMethod === m.id ? 'border-indigo-500 bg-indigo-500' : ''
              }`}
              style={paymentMethod !== m.id ? { borderColor: 'var(--border-color)' } : {}}>
                {paymentMethod === m.id && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      <div className="card">
        <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Special Instructions</h3>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Any allergies, preferences, or notes..."
          rows={3}
          className="input resize-none"
        />
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary w-full py-4 text-base"
      >
        {loading ? 'Placing Order...' : `Place Order · ₹${cartTotal}`}
      </button>
    </div>
  );
};

export default CheckoutPage;
