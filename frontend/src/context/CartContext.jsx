import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [canteenId, setCanteenId] = useState(null);

  const addToCart = useCallback(
    (item, itemCanteenId) => {
      // Enforce single-canteen cart
      if (canteenId && canteenId !== itemCanteenId) {
        toast.error('Your cart has items from another canteen. Clear cart first.');
        return false;
      }

      setCart((prev) => {
        const existing = prev.find((i) => i._id === item._id);
        if (existing) {
          return prev.map((i) =>
            i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });

      if (!canteenId) setCanteenId(itemCanteenId);
      toast.success(`${item.name} added to cart`);
      return true;
    },
    [canteenId]
  );

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i._id !== itemId);
      if (updated.length === 0) setCanteenId(null);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity: qty } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCanteenId(null);
  }, []);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        canteenId,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
