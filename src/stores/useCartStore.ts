import { create } from "zustand";
import type { CartItem } from "../types";

const CART_STORAGE_KEY = "belikilat_cart";

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: CartItem) => void;
  updateQty: (variantSku: string, delta: number) => void;
  removeItem: (variantSku: string) => void;
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
        const parsed = JSON.parse(saved) as CartItem[];
        // Validate cart items have new variant schema
        const isValid = parsed.every(
          (item) => item.variant_sku && item.name_product && item.thumbnail && item.price,
        );
        if (isValid) {
          set({ cart: parsed });
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  },

  addToCart: (item: CartItem) => {
    set((state) => {
      const existing = state.cart.find((c) => c.variant_sku === item.variant_sku);
      let newCart: CartItem[];
      if (existing) {
        newCart = state.cart.map((c) =>
          c.variant_sku === item.variant_sku
            ? { ...c, qty: c.qty + item.qty }
            : c,
        );
      } else {
        newCart = [...state.cart, item];
      }
      saveCart(newCart);
      return { cart: newCart };
    });
  },

  updateQty: (variantSku: string, delta: number) => {
    set((state) => {
      const newCart = state.cart
        .map((item) =>
          item.variant_sku === variantSku
            ? { ...item, qty: item.qty + delta }
            : item,
        )
        .filter((item) => item.qty > 0);
      saveCart(newCart);
      return { cart: newCart };
    });
  },

  removeItem: (variantSku: string) => {
    set((state) => {
      const newCart = state.cart.filter((item) => item.variant_sku !== variantSku);
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
