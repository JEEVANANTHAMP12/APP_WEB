import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'campus_cravings_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [canteenId, setCanteenId] = useState(() => {
    try {
      const stored = localStorage.getItem(`${CART_STORAGE_KEY}_canteen`);
      if (stored) return JSON.parse(stored);
      // Recover canteenId from existing cart items if missing
      const cartStored = localStorage.getItem(CART_STORAGE_KEY);
      if (cartStored) {
        const cartItems = JSON.parse(cartStored);
        if (cartItems.length > 0 && cartItems[0].canteen_id) {
          return typeof cartItems[0].canteen_id === 'object' ? cartItems[0].canteen_id._id : cartItems[0].canteen_id;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Persist canteen ID to localStorage
  useEffect(() => {
    if (canteenId) {
      localStorage.setItem(`${CART_STORAGE_KEY}_canteen`, JSON.stringify(canteenId));
    } else {
      localStorage.removeItem(`${CART_STORAGE_KEY}_canteen`);
    }
  }, [canteenId]);

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
      toast.success(`${item.name} added to cart!`, {
        icon: '🛒',
        duration: 2000,
      });
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
    toast.success('Item removed from cart');
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
    toast.success('Cart cleared');
  }, []);

  const cartTotal = cart.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  const cartCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

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
