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
  weight?: number;      // weight in grams (optional to allow existing mock data)
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
  weight?: number;   // weight in grams
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
  weight: number;      // weight in grams
}

// ─── Customer & Order ───────────────────────────────────────────
export interface Province {
  province_id: string;
  province_name: string;
}

export interface City {
  city_id: string;
  city_name: string;
}

export interface District {
  district_name: string;
}

export interface SubDistrict {
  subdistrict_id: string;
  subdistrict_name: string;
  postal_code?: string;
  kode_origin_jnt?: string;
  kode_sicepat?: string;
  kode_destination_jne?: string;
  kode_ninja_lt1?: string;
  kode_ninja_lt2?: string;
  destination_lion_parcel_code?: string;
  destination_sapx_code?: string;
  wahana_destination_code?: string;
  destination_raja_ongkir?: string;
}

export interface AreaGroup {
  group_id: string;
  group_name: string;
}

export interface CustomerInfo {
  code_member: string;
  name: string;
  email: string;
  phone: string;
  province_id: string;
  province_name: string;
  city_id: string;
  city_name: string;
  district_name: string;
  subdistrict_id: string;
  subdistrict_name: string;
  address: string; // Detailed address (street, house info)
  courier: string;
  bank: string;
}

export interface PaymentMethodData {
  bank_code: string;
  bank_name: string;
  name: string;
  status: boolean;
  type: string;
}

export interface PaymentMethodsResponse {
  VA: PaymentMethodData[];
  WA: PaymentMethodData[];
  SB: PaymentMethodData[];
}

// ─── Shipping Rates ─────────────────────────────────────────────
export interface ShippingRateItem {
  provider: string;
  rate_id: string;
  finalRate: number;
  etd: string;
}

export interface ShippingRatesResponse {
  items: {
    ninja: ShippingRateItem[];
    jne: ShippingRateItem[];
    wahana: ShippingRateItem[];
    rajaongkir: ShippingRateItem[];
    lion_parcel: ShippingRateItem[];
    sapx: ShippingRateItem[];
    jnt: ShippingRateItem[];
    everpro: ShippingRateItem[];
  };
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
