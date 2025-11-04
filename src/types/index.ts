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

// Product Bundle Variant Types
export interface ProductBundleVariant {
  id: number;
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  pricing_type: 'percentage_discount' | 'fixed_price' | 'fixed_discount';
  discount_percentage?: number;
  fixed_price?: number;
  fixed_discount?: number;
  compare_price?: number;
  stock_management_type: 'use_main_product' | 'separate_stock';
  stock_quantity?: number;
  is_active: boolean;
  sort_order: number;
  calculated_price?: number;
  savings_amount?: number;
  savings_percentage?: number;
  effective_stock?: number;
  formatted_name?: string;
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
  author?: string;
  publisher?: string;
  isbn?: string;
  pages?: number;
  format?: 'Hardcover' | 'Paperback' | 'Ebook' | 'Audiobook';
  language?: string;
  publication_date?: string;
  rating?: number;
  total_reviews?: number;
  reviews?: Review[];
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
  bundle_variants?: ProductBundleVariant[];
  active_bundle_variants?: ProductBundleVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  image_path?: string;
  url?: string; // Deprecated, use image_url
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
  bundle_variant_id?: number;
  quantity: number;
  price: number;
  unit_price?: number;
  total: number;
  total_price?: number;
  is_bundle?: boolean;
  attributes?: {
    bundle_name?: string;
    bundle_quantity?: number;
    [key: string]: any;
  };
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
    bundle_discount?: number;
    total_discount?: number;
    discounted_subtotal: number;
    tax_amount: number;
    taxes_breakdown?: Array<{
      code: string;
      name: string;
      display_label: string;
      rate: string;
      amount: number;
      taxable_amount: number;
      is_inclusive: boolean;
      type: string;
    }>;
    shipping_cost: number;
    charges?: Array<{
      code: string;
      name: string;
      display_label: string;
      amount: number;
      is_taxable: boolean;
      type: string;
      source: string;
    }>;
    total_charges?: number;
    cod_charge?: number;
    cod_charge_label?: string;
    additional_charges?: number;
    additional_charges_label?: string;
    payment_method?: string;
    total: number;
    currency: string;
    is_empty: boolean;
    requires_pincode?: boolean;
    pincode_message?: string;
    shipping_details?: any;
    bundle_details?: any;
    discount_message?: string;
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
  bundle_variant_id?: number;
  bundle_quantity?: number;
  bundle_variant_name?: string;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price?: number;
  price: number;
  total: number;
  total_price?: number;
  is_bundle?: boolean;
  display_name?: string;
  product_attributes?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

export interface WishlistStats {
  total_items: number;
  total_value: number;
  in_stock_items: number;
  out_of_stock_items: number;
  on_sale_items: number;
}

// Review Types
export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_votes: number;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewForm {
  product_id: number;
  rating: number;
  title?: string;
  comment: string;
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
  size?: 'xs' | 'sm' | 'md' | 'lg';
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