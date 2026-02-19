import type {
  Product,
  Order,
  CustomerInfo,
  CartItem,
  PaymentMethod,
  PaymentDetail,
  TrackingInfo,
} from "../types";
import { PRODUCTS } from "../data/products";

// ─── Configuration ──────────────────────────────────────────────
// Set VITE_API_BASE_URL in .env to enable real API calls.
// Example: VITE_API_BASE_URL=https://your-api.com/api
// When not set, all functions fall back to static data / localStorage.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ─── Helper ─────────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  return res.json();
}

// ─── Products ───────────────────────────────────────────────────

/** GET /products — Fetch all products */
export async function fetchProducts(): Promise<Product[]> {
  if (API_BASE_URL) {
    return apiFetch<Product[]>("/products");
  }
  return Promise.resolve(PRODUCTS);
}

/** GET /products/:id — Fetch single product */
export async function fetchProductById(id: number): Promise<Product | null> {
  if (API_BASE_URL) {
    return apiFetch<Product>(`/products/${id}`);
  }
  return Promise.resolve(PRODUCTS.find((p) => p.id === id) || null);
}

// ─── Orders ─────────────────────────────────────────────────────

/** POST /orders — Create a new order */
export async function createOrderAPI(
  customer: CustomerInfo,
  items: CartItem[],
  total: number,
): Promise<Order> {
  if (API_BASE_URL) {
    return apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify({ customer, items, total }),
    });
  }

  // Fallback: generate order locally and save to localStorage
  const orderId = "INV-" + Math.floor(10000 + Math.random() * 90000);
  const vaNumber =
    (customer.bank === "BCA" ? "123" : "880") +
    Math.floor(1000000000 + Math.random() * 9000000000);

  const newOrder: Order = {
    id: orderId,
    date: new Date().toLocaleString("en-US"),
    customer,
    items: [...items],
    total,
    bank: customer.bank,
    va: vaNumber,
    status: "Awaiting Payment",
  };

  const saved = localStorage.getItem("orderHistory");
  const history: Order[] = saved ? JSON.parse(saved) : [];
  const updated = [newOrder, ...history];
  localStorage.setItem("orderHistory", JSON.stringify(updated));

  return newOrder;
}

/** GET /orders?member=:code — Fetch order history */
export async function getOrderHistory(memberCode?: string): Promise<Order[]> {
  if (API_BASE_URL) {
    const query = memberCode ? `?member=${encodeURIComponent(memberCode)}` : "";
    return apiFetch<Order[]>(`/orders${query}`);
  }
  const saved = localStorage.getItem("orderHistory");
  return saved ? JSON.parse(saved) : [];
}

/** GET /orders/:id — Fetch single order */
export async function getOrderById(id: string): Promise<Order | null> {
  if (API_BASE_URL) {
    try {
      return await apiFetch<Order>(`/orders/${id}`);
    } catch {
      return null;
    }
  }
  const orders = await getOrderHistory();
  return orders.find((o) => o.id === id.toUpperCase()) || null;
}

// ─── Tracking ───────────────────────────────────────────────────

/** GET /orders/:id/tracking — Track order status */
export async function trackOrderAPI(id: string): Promise<TrackingInfo | null> {
  if (API_BASE_URL) {
    try {
      return await apiFetch<TrackingInfo>(`/orders/${id}/tracking`);
    } catch {
      return null;
    }
  }

  // Fallback: build tracking info from localStorage order
  const order = await getOrderById(id);
  if (!order) return null;

  return {
    orderId: order.id,
    status: order.status,
    steps: [
      { label: "Order Created", date: order.date, completed: true },
      {
        label: "Payment Confirmed",
        completed: order.status !== "Awaiting Payment",
      },
      {
        label: "Shipping",
        completed: order.status === "Shipped" || order.status === "Completed",
      },
      { label: "Completed", completed: order.status === "Completed" },
    ],
  };
}

// ─── Payments ───────────────────────────────────────────────────

/** GET /payments/:orderId — Get payment details */
export async function getPaymentDetail(
  orderId: string,
): Promise<PaymentDetail | null> {
  if (API_BASE_URL) {
    try {
      return await apiFetch<PaymentDetail>(`/payments/${orderId}`);
    } catch {
      return null;
    }
  }

  // Fallback: build from localStorage order
  const order = await getOrderById(orderId);
  if (!order) return null;

  return {
    orderId: order.id,
    bank: order.bank,
    va: order.va,
    total: order.total,
    status: order.status,
    expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/** POST /payments/:orderId/confirm — Confirm payment */
export async function confirmPayment(
  orderId: string,
  proof?: File,
): Promise<{ success: boolean; message: string }> {
  if (API_BASE_URL) {
    const formData = new FormData();
    formData.append("orderId", orderId);
    if (proof) formData.append("proof", proof);

    const res = await fetch(`${API_BASE_URL}/payments/${orderId}/confirm`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to confirm payment");
    return res.json();
  }

  // Fallback: update order status in localStorage
  const saved = localStorage.getItem("orderHistory");
  if (saved) {
    const orders: Order[] = JSON.parse(saved);
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: "Payment Confirmed" } : o,
    );
    localStorage.setItem("orderHistory", JSON.stringify(updated));
  }

  return { success: true, message: "Payment confirmed (local)" };
}

// ─── Payment Methods ────────────────────────────────────────────

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "mandiri",
    name: "Mandiri Virtual Account",
    code: "mandiri",
    type: "va",
  },
  { id: "bca", name: "BCA Virtual Account", code: "bca", type: "va" },
  { id: "bni", name: "BNI Virtual Account", code: "bni", type: "va" },
  { id: "bri", name: "BRI Virtual Account", code: "bri", type: "va" },
];

/** GET /payment-methods — Fetch available payment methods */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (API_BASE_URL) {
    return apiFetch<PaymentMethod[]>("/payment-methods");
  }
  return Promise.resolve(DEFAULT_PAYMENT_METHODS);
}
