// ─── Product (list view) ────────────────────────────────────────
export interface Product {
  _id: string;
  product_id: string;
  name_product: string;
  thumbnail: string;
  stock: number;
  brand: string;
  price_min: number;
  price_max: number;
  // Fields from BE that we receive but don't display in list
  publish?: boolean;
  created_at?: string;
  flag_stock_available?: boolean;
  description?: string;
}

// ─── Variant ────────────────────────────────────────────────────
export interface ProductVariant {
  sku: string;       // e.g. "KAA090-RED-M"
  color: string;     // e.g. "Red"
  size: string;      // e.g. "M"
  stock: number;
  price: number;
}

// ─── Product Detail (detail page) ───────────────────────────────
export interface ProductDetail extends Product {
  description: string;
  images: string[];
  variants: ProductVariant[];
}

// ─── Cart ───────────────────────────────────────────────────────
export interface CartItem {
  product_id: string;
  variant_sku: string;
  name_product: string;
  thumbnail: string;
  color: string;
  size: string;
  price: number;
  qty: number;
}

// ─── Customer & Order ───────────────────────────────────────────
export interface CustomerInfo {
  code_member: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  courier: string;
  bank: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  type: "va" | "ewallet" | "bank_transfer";
}

export interface PaymentDetail {
  orderId: string;
  bank: string;
  va: string;
  total: number;
  status: string;
  expiredAt: string;
}

export interface TrackingStep {
  label: string;
  date?: string;
  completed: boolean;
}

export interface TrackingInfo {
  orderId: string;
  status: string;
  steps: TrackingStep[];
}

export interface Order {
  id: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  bank: string;
  va: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
