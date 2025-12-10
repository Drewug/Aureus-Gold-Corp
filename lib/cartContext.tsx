import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../types';
import { getCookie, setCookie } from './utils';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children?: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from Cookie (priority) or LocalStorage on mount
  useEffect(() => {
    let initialCart: CartItem[] = [];
    let found = false;

    // 1. Try Cookie
    const cookieCart = getCookie('cart_session');
    if (cookieCart) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieCart));
        if (Array.isArray(parsed)) {
          initialCart = parsed;
          found = true;
        }
      } catch (e) {
        console.warn("Failed to parse cart cookie", e);
      }
    }

    // 2. Fallback to LocalStorage
    if (!found) {
      const saved = localStorage.getItem('aureus_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            initialCart = parsed;
          }
        } catch (e) {
          console.error("Failed to load cart from storage", e);
        }
      }
    }

    setCart(initialCart);
    setIsLoaded(true);
  }, []);

  // Save cart whenever it changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;

    const serialized = JSON.stringify(cart);
    
    // Update LocalStorage (Backup)
    localStorage.setItem('aureus_cart', serialized);
    
    // Update Cookie (Primary Persistence) - 7 Days
    // We encode the JSON string to ensure valid cookie characters
    setCookie('cart_session', encodeURIComponent(serialized), 7);
  }, [cart, isLoaded]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i => i.variantId === item.variantId 
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(i => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};