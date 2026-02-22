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
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setLoading(true);

    try {
      // Create order in backend
      const { data: orderData } = await orderAPI.place({
        canteen_id: canteenId,
        items: cart.map((i) => ({ menu_item_id: i._id, quantity: i.quantity })),
        payment_method: paymentMethod,
        special_instructions: instructions,
      });

      const order = orderData.data.order;

      if (paymentMethod === 'cash_on_pickup') {
        clearCart();
        toast.success('Order placed! Pay at pickup.');
        navigate(`/orders/${order._id}`);
        return;
      }

      // Razorpay online payment
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway failed to load');
        setLoading(false);
        return;
      }

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
        theme: { color: '#f97316' },
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
            navigate(`/orders/${order._id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => toast.error('Payment cancelled'),
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

      {/* Order Summary */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Payment Method</h3>
        <div className="space-y-3">
          {[
            { value: 'online', label: '💳 Pay Online (Razorpay)', desc: 'UPI, Cards, Net Banking' },
            { value: 'cash_on_pickup', label: '💵 Cash on Pickup', desc: 'Pay when you collect' },
            { value: 'wallet', label: `👛 Wallet (₹${user?.wallet_balance || 0})`, desc: 'Use your campus wallet' },
          ].map((method) => (
            <label
              key={method.value}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === method.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="accent-primary-500"
              />
              <div>
                <p className="font-medium text-gray-800 text-sm">{method.label}</p>
                <p className="text-xs text-gray-400">{method.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">Special Instructions</h3>
        <textarea
          rows={3}
          placeholder="Any special requests? (optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="input resize-none"
        />
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          `Place Order · ₹${cartTotal}`
        )}
      </button>
    </div>
  );
};

export default CheckoutPage;
