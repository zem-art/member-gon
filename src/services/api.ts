import type {
  Product,
  ProductDetail,
  Order,
  CustomerInfo,
  CartItem,
  PaymentMethod,
  PaymentDetail,
  TrackingInfo,
  PaginatedResponse,
  Province,
  City,
  District,
  SubDistrict,
  AreaGroup,
} from "../types";
import { PRODUCTS, generateMockDetail } from "../data/products";
import { getGuestId } from "../utils/guestId";

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
    headers: {
      "Content-Type": "application/json",
      "X-Guest-Id": getGuestId(),
      ...options?.headers,
    },
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
    return apiFetch<Product[]>("/public/products");
  }
  return Promise.resolve(PRODUCTS);
}

/** GET /products?page=X&limit=Y&name=Z — Fetch products with pagination + search */
export async function fetchProductsPaginated(
  page: number = 1,
  limit: number = 8,
  search: string = "",
): Promise<PaginatedResponse<Product>> {
  if (API_BASE_URL) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("name", search);

    // Real API returns envelope: { status, status_code, message, data: Product[] }
    // with NO pagination metadata — so we normalize it here.
    const envelope = await apiFetch<{ data: Product[] }>(
      `/public/products?${params.toString()}`,
    );
    const data = envelope.data ?? [];
    return {
      data,
      page,
      limit,
      total: 0, // API doesn't provide total; not critical for infinite scroll
      hasMore: data.length >= limit, // if full page received → likely more
    };
  }

  // Fallback: simulate paginated + search response from static data
  await new Promise((r) => setTimeout(r, 500));

  const filtered = search
    ? PRODUCTS.filter((p) =>
      p.name_product.toLowerCase().includes(search.toLowerCase()),
    )
    : PRODUCTS;

  const start = (page - 1) * limit;
  const end = start + limit;
  const data = filtered.slice(start, end);
  const total = filtered.length;

  return {
    data,
    page,
    limit,
    total,
    hasMore: end < total,
  };
}

/** GET /products/:id/details — Fetch single product with variants */
export async function fetchProductById(id: string): Promise<ProductDetail | null> {
  if (API_BASE_URL) {
    try {
      // Real API returns envelope: { status, data: { product_id, brand: { name_brand }, ... } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const envelope = await apiFetch<{ data: any }>(`/public/product/${id}/details`);
      const raw = envelope.data ?? envelope;

      // Map variants from API format to our ProductVariant
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variants = (raw.variants ?? []).map((v: any) => ({
        sku: v.sku,
        color: v.variant2_color ?? "",
        size: v.variant1_size ?? "",
        stock: v.stock ?? 0,
        price: v.price_tags ?? 0,
      }));

      // Compute price range from actual variants
      const prices = variants.map((v: { price: number }) => v.price).filter((p: number) => p > 0);
      const priceMin = prices.length > 0 ? Math.min(...prices) : 0;
      const priceMax = prices.length > 0 ? Math.max(...prices) : 0;

      // Strip HTML tags from description
      const rawDesc: string = raw.description ?? "";
      const description = rawDesc.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

      return {
        _id: raw.product_id ?? id,
        product_id: raw.product_id ?? id,
        name_product: raw.name_product ?? "",
        thumbnail: raw.thumbnails_main ?? (raw.thumbnails?.[0] ?? ""),
        stock: variants.reduce((acc: number, v: { stock: number }) => acc + v.stock, 0),
        brand: typeof raw.brand === "object" ? raw.brand?.name_brand ?? "" : raw.brand ?? "",
        price_min: priceMin,
        price_max: priceMax,
        description,
        images: raw.thumbnails ?? [raw.thumbnails_main ?? ""],
        variants,
      };
    } catch (err) {
      console.warn(`[fetchProductById] Failed for id="${id}":`, err);
      return null;
    }
  }
  // Fallback: generate detail from static data
  await new Promise((r) => setTimeout(r, 300));
  const product = PRODUCTS.find((p) => p._id === id);
  if (!product) return null;
  return generateMockDetail(product);
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

// ─── Geographic / Shipping ──────────────────────────────────────

/** GET /area/province — Fetch all provinces */
export async function fetchProvinces(): Promise<Province[]> {
  if (API_BASE_URL) {
    const envelope = await apiFetch<{ data: Province[] }>("/area/group");
    return envelope.data ?? [];
  }
  return [];
}

/** GET /area/city?province=:id — Fetch cities in a province */
export async function fetchCities(provinceId: string): Promise<City[]> {
  if (API_BASE_URL) {
    const envelope = await apiFetch<{ data: City[] }>(`/area/group?province=${provinceId}`);
    return envelope.data ?? [];
  }
  return [];
}

/** GET /area/group?province=:p&city=:c — Fetch districts in a city */
export async function fetchDistricts(provinceId: string, cityId: string): Promise<District[]> {
  if (API_BASE_URL) {
    const envelope = await apiFetch<{ data: District[] }>(`/area/group?province=${provinceId}&city=${cityId}`);
    return envelope.data ?? [];
  }
  return [];
}

/** GET /area/group?province=:p&city=:c&district=:d — Fetch sub-districts */
export async function fetchSubDistricts(provinceId: string, cityId: string, districtName: string): Promise<SubDistrict[]> {
  if (API_BASE_URL) {
    const envelope = await apiFetch<{ data: SubDistrict[] }>(`/area/group?province=${provinceId}&city=${cityId}&district=${districtName}`);
    return envelope.data ?? [];
  }
  return [];
}

/** GET /area/group?province=:p&city=:c&district=:d — Fetch area group */
export async function fetchAreaGroup(
  provinceId: string,
  cityName: string,
  districtName: string,
): Promise<AreaGroup | null> {
  if (API_BASE_URL) {
    try {
      const params = new URLSearchParams({
        province: provinceId,
        city: cityName,
        district: districtName,
      });
      const envelope = await apiFetch<{ data: AreaGroup[] | AreaGroup }>(
        `/area/group?${params.toString()}`,
      );
      // The API might return an array or a single object
      if (Array.isArray(envelope.data)) {
        return envelope.data[0] || null;
      }
      return envelope.data || null;
    } catch (err) {
      console.warn("[fetchAreaGroup] Failed:", err);
      return null;
    }
  }
  return null;
}
