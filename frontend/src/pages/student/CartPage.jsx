import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart, canteenId } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add items from a canteen to get started</p>
        <button onClick={() => navigate('/canteens')} className="btn-primary">
          Browse Canteens
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Your Cart ({cartCount} items)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
          Clear All
        </button>
      </div>

      {/* Items */}
      <div className="card space-y-4">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍱</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
              <p className="text-sm text-primary-600 font-bold">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center"
              >
                −
              </button>
              <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-primary-100 hover:bg-primary-200 font-bold text-primary-600 flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item._id)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 ml-1 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({cartCount} items)</span>
            <span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform fee</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="btn-primary w-full text-base py-4"
      >
        Proceed to Checkout → ₹{cartTotal}
      </button>
    </div>
  );
};

export default CartPage;
