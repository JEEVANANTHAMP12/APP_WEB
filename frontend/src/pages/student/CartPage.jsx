import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart, canteenId } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="empty-state py-24 animate-fade-in">
        <div className="empty-icon">🛒</div>
        <p className="empty-title">Your cart is empty</p>
        <p className="empty-desc mb-6">Add items from a canteen to get started</p>
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
          <div key={item._id} className="flex items-center gap-4 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'var(--bg-elevated)' }}>
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
              <p className="text-sm font-bold text-indigo-400">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              >−</button>
              <span className="w-6 text-center font-bold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-brand-gradient font-bold text-white flex items-center justify-center shadow-brand transition-all"
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
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
            <span>Subtotal ({cartCount} items)</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
            <span>Platform fees</span>
            <span className="text-emerald-400">Free</span>
          </div>
        </div>
        <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
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
