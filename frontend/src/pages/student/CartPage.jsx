import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart, canteenId } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-400 mb-6">Add items from a canteen to get started</p>
        <button onClick={() => navigate('/student/canteens')} className="btn-primary">
          Browse Canteens
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Your Cart</h1>
          <p className="page-subtitle">{cartCount} items</p>
        </div>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
          Clear All
        </button>
      </div>

      {/* Items */}
      <div className="card space-y-3">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center gap-4 pb-3 border-b border-white/10 last:border-0 last:pb-0">
            <div className="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center overflow-hidden shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate">{item.name}</h4>
              <p className="text-sm text-orange-400 font-bold">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-white flex items-center justify-center transition-all"
              >−</button>
              <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-bold text-white flex items-center justify-center shadow-lg transition-all"
              >+</button>
              <button
                onClick={() => removeFromCart(item._id)}
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 ml-1 flex items-center justify-center transition-all"
              >✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="card">
        <h3 className="font-bold text-white mb-4">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal ({cartCount} items)</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Platform fee</span>
            <span className="text-emerald-400">Free</span>
          </div>
        </div>
        <div className="flex justify-between font-bold text-white text-lg pt-3 mt-3 border-t border-white/10">
          <span>Total</span>
          <span className="gradient-text">₹{cartTotal}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/student/checkout')}
        className="btn-primary w-full py-4 text-base"
      >
        Proceed to Checkout → ₹{cartTotal}
      </button>
    </div>
  );
};

export default CartPage;
