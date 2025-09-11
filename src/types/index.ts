// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// User & Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  sku: string;
  stock_quantity: number;
  min_stock_level: number;
  manage_stock: boolean;
  in_stock: boolean;
  weight: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  category_id: number;
  category?: Category;
  brand?: string;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  is_digital: boolean;
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  children?: Category[];
  parent?: Category;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  subtotal: number;
  total_items: number;
  created_at: string;
  updated_at: string;
  // Cart Summary fields
  summary?: {
    total_items: number;
    subtotal: number;
    coupon_code?: string;
    coupon_discount?: number;
    coupon_free_shipping?: boolean;
    discounted_subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    total: number;
    currency: string;
    is_empty: boolean;
  };
}

// Address Types
export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  full_name?: string;
  full_address?: string;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Order {
  id: number;
  user_id: number;
  user?: User;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'dispatched' | 'failed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  payment_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address?: Address;
  billing_address?: Address;
  items?: OrderItem[];
  notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_method?: string;
  shipping_carrier?: string;
  tracking_number?: string;
  estimated_delivery?: string;
  status_history?: Array<{
    status: string;
    created_at: string;
    notes?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

// Address Types
export interface Address {
  id?: number;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

// Shipping Types
export interface ShippingZone {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export interface ShippingRate {
  id: number;
  zone_id: number;
  zone: ShippingZone;
  weight_min: number;
  weight_max: number;
  price: number;
  delivery_time_min: number;
  delivery_time_max: number;
  is_active: boolean;
}

export interface DeliveryOption {
  id: number;
  name: string;
  description?: string;
  type: 'standard' | 'express' | 'overnight' | 'pickup';
  price: number;
  delivery_time_min: number;
  delivery_time_max: number;
  is_active: boolean;
  conditions?: {
    min_order_value?: number;
    max_weight?: number;
    available_days?: string[];
  };
}

// Search & Filter Types
export interface ProductFilters {
  categories?: number[];
  price_min?: number;
  price_max?: number;
  brands?: string[];
  in_stock?: boolean;
  is_featured?: boolean;
  attributes?: Record<string, any>;
}

export interface SearchParams {
  q?: string;
  category_id?: number;
  filters?: ProductFilters;
  sort?: 'name' | 'price' | 'created_at' | 'popularity';
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CheckoutForm {
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  notes?: string;
}

// UI Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

// Toast/Notification Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}