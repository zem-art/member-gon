import { create } from "zustand";
import type {
  Order,
  CartItem,
  CustomerInfo,
  TrackingInfo,
  PaymentDetail,
} from "../types";
import {
  createOrderAPI,
  getOrderHistory,
  getOrderById,
  trackOrderAPI,
  getPaymentDetail,
  confirmPayment as confirmPaymentAPI,
} from "../services/api";

interface OrderState {
  // Data
  orderHistory: Order[];
  activePayment: PaymentDetail | null;
  trackingResult: TrackingInfo | null;

  // Loading / Error
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHistory: (memberCode?: string) => Promise<void>;
  createOrder: (
    customer: CustomerInfo,
    items: CartItem[],
    total: number,
  ) => Promise<Order>;
  trackOrder: (id: string) => Promise<TrackingInfo | null>;
  showOrderPayment: (orderId: string) => Promise<void>;
  confirmPayment: (orderId: string, proof?: File) => Promise<boolean>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orderHistory: [],
  activePayment: null,
  trackingResult: null,
  isLoading: false,
  error: null,

  loadHistory: async (memberCode?: string) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await getOrderHistory(memberCode);
      set({ orderHistory: orders, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load history",
        isLoading: false,
      });
    }
  },

  createOrder: async (
    customer: CustomerInfo,
    items: CartItem[],
    total: number,
  ): Promise<Order> => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await createOrderAPI(customer, items, total);

      // Also build the payment detail for immediate display
      const payment: PaymentDetail = {
        orderId: newOrder.id,
        bank: newOrder.bank,
        va: newOrder.va,
        total: newOrder.total,
        status: newOrder.status,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      set((state) => ({
        orderHistory: [newOrder, ...state.orderHistory],
        activePayment: payment,
        isLoading: false,
      }));

      return newOrder;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create order",
        isLoading: false,
      });
      throw err;
    }
  },

  trackOrder: async (id: string): Promise<TrackingInfo | null> => {
    set({ isLoading: true, error: null });
    try {
      const result = await trackOrderAPI(id);
      set({ trackingResult: result, isLoading: false });
      return result;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to track order",
        isLoading: false,
      });
      return null;
    }
  },

  showOrderPayment: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await getPaymentDetail(orderId);
      set({ activePayment: payment, isLoading: false });
    } catch (err) {
      // Fallback: try building from order data
      try {
        const order = await getOrderById(orderId);
        if (order) {
          set({
            activePayment: {
              orderId: order.id,
              bank: order.bank,
              va: order.va,
              total: order.total,
              status: order.status,
              expiredAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
            isLoading: false,
          });
        }
      } catch {
        set({
          error: err instanceof Error ? err.message : "Failed to load payment",
          isLoading: false,
        });
      }
    }
  },

  confirmPayment: async (orderId: string, proof?: File): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const result = await confirmPaymentAPI(orderId, proof);
      if (result.success) {
        // Refresh the order in history
        const orders = await getOrderHistory();
        set({ orderHistory: orders, isLoading: false });
      }
      return result.success;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to confirm payment",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
