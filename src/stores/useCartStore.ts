import { create } from "zustand";
import type { CartItem, Product } from "../types";

const CART_STORAGE_KEY = "belikilat_cart";

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  updateQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
  getCount: () => number;
  loadCart: () => void;
}

/** Persist cart to localStorage */
function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  isCartOpen: false,

  loadCart: () => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        set({ cart: JSON.parse(saved) });
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  },

  addToCart: (product: Product) => {
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);
      let newCart: CartItem[];
      if (existing) {
        newCart = state.cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      } else {
        newCart = [...state.cart, { ...product, qty: 1 }];
      }
      saveCart(newCart);
      return { cart: newCart };
    });
  },

  updateQty: (id: number, delta: number) => {
    set((state) => {
      const newCart = state.cart
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0);
      saveCart(newCart);
      return { cart: newCart };
    });
  },

  removeItem: (id: number) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.id !== id);
      saveCart(newCart);
      return { cart: newCart };
    });
  },

  clearCart: () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    set({ cart: [] });
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  getTotal: () => {
    return get().cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  },

  getCount: () => {
    return get().cart.reduce((acc, item) => acc + item.qty, 0);
  },
}));
