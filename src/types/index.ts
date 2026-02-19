export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  img: string;
  description?: string;
}

export interface CartItem extends Product {
  qty: number;
}

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
