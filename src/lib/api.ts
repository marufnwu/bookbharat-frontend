import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
      timeout: 10000, // Reduced timeout for faster failures
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Generate or retrieve session ID for guest cart functionality
    if (typeof window !== 'undefined') {
      this.sessionId = this.getOrCreateSessionId();
    }

    // Request interceptor to add auth token and session ID
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('🔐 Using auth token for request:', config.url);
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // ALWAYS add session ID if available (for cart continuity during login)
        const currentSessionId = localStorage.getItem('guest_session_id');
        if (currentSessionId) {
          console.log('👤 Using session ID for request:', config.url, 'Session:', currentSessionId);
          config.headers['X-Session-ID'] = currentSessionId;
        }
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Session ID management for guest cart functionality
  private getOrCreateSessionId(): string {
    const sessionKey = 'guest_session_id';
    let sessionId = localStorage.getItem(sessionKey);
    
    if (!sessionId) {
      // Generate a new session ID (UUID-like)
      sessionId = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
      localStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  }

  // Clear session ID (only use after cart migration is complete)
  public clearSessionId(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_session_id');
      this.sessionId = null;
    }
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Multiple file upload method
  async uploadMultipleFiles<T>(url: string, files: File[], fieldName: string = 'files'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`${fieldName}[]`, file);
    });

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Auth API methods
  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  async register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.post('/auth/register', data);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }) {
    return this.post('/auth/reset-password', data);
  }

  async getUser() {
    return this.get('/auth/user');
  }

  async updateProfile(data: any) {
    return this.put('/auth/profile', data);
  }

  async changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }) {
    return this.put('/auth/change-password', data);
  }

  async revokeAllTokens() {
    return this.post('/auth/revoke-tokens');
  }

  // Product API methods
  async getProducts(params?: any) {
    return this.get('/products', { params });
  }

  async getProduct(id: number | string) {
    return this.get(`/products/${id}`);
  }

  async searchProducts(query: string, filters?: any) {
    return this.get('/products/search', { params: { q: query, ...filters } });
  }

  async getFeaturedProducts() {
    return this.get('/products/featured');
  }

  async getProductSuggestions(query: string) {
    return this.get('/products/suggestions', { params: { q: query } });
  }

  async getProductFilters() {
    return this.get('/products/filters');
  }

  async getProductsByCategory(categoryId: number, params?: any) {
    return this.get(`/products/category/${categoryId}`, { params });
  }

  async getProductsByCategories(params?: any) {
    return this.get('/products/by-categories', { params });
  }

  // Category API methods
  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(id: number) {
    return this.get(`/categories/${id}`);
  }

  // Cart API methods
  async getCart() {
    return this.get('/cart');
  }

  async addToCart(productId: number, quantity: number) {
    return this.post('/cart/add', { product_id: productId, quantity });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.put(`/cart/update/${itemId}`, { quantity });
  }

  async removeCartItem(itemId: number) {
    return this.delete(`/cart/remove/${itemId}`);
  }

  async clearCart() {
    return this.delete('/cart/clear');
  }

  async applyCoupon(couponCode: string) {
    return this.post('/cart/apply-coupon', { coupon_code: couponCode });
  }

  async removeCoupon() {
    return this.delete('/cart/remove-coupon');
  }

  async getAvailableCoupons() {
    return this.get('/coupons/available');
  }

  // Order API methods
  async getOrders() {
    return this.get('/orders');
  }

  async getOrder(idOrNumber: string | number) {
    return this.get(`/orders/${idOrNumber}`);
  }

  async createOrder(data: any) {
    return this.post('/orders', data);
  }

  async cancelOrder(idOrNumber: string | number, data?: any) {
    return this.put(`/orders/${idOrNumber}/cancel`, data);
  }

  async downloadInvoice(idOrNumber: string | number) {
    return this.get(`/orders/${idOrNumber}/invoice`);
  }

  async downloadReceipt(idOrNumber: string | number) {
    return this.get(`/orders/${idOrNumber}/receipt`);
  }

  // Shipping API methods
  async getShippingZones() {
    return this.get('/shipping/zones');
  }

  async checkPincode(pincode: string) {
    // Create a separate axios instance without auth interceptors for public endpoints
    const publicClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    try {
      const response = await publicClient.post('/shipping/check-pincode', { pincode });
      return response.data;
    } catch (error: any) {
      // Handle errors without redirecting to login
      if (error.response && error.response.data) {
        // If backend returns structured error response, return it directly
        // This handles cases where backend returns error status but with valid response data
        return error.response.data;
      }
      throw new Error(error.response?.data?.message || error.message || 'Network error occurred');
    }
  }

  async getShippingRates() {
    return this.get('/shipping/rates');
  }

  async calculateShipping(data: { weight: number; from_pincode: string; to_pincode: string; delivery_option_id: number }) {
    return this.post('/shipping/calculate', data);
  }

  async calculateCartShipping(data: { 
    delivery_pincode: string; 
    pickup_pincode?: string;
    include_insurance?: boolean;
    delivery_option_id?: number;
    is_remote?: boolean;
    has_fragile_items?: boolean;
    has_electronics?: boolean;
  }) {
    return this.post('/shipping/calculate-cart', data);
  }

  async getDeliveryOptions(params?: { pincode?: string; weight?: number }) {
    return this.get('/shipping/delivery-options', { params });
  }

  async getInsurancePlans(params?: { order_value?: number }) {
    return this.get('/shipping/insurance-plans', { params });
  }

  // Admin API methods
  async getDashboardOverview() {
    return this.get('/admin/dashboard/overview');
  }

  async getSalesAnalytics(period?: string) {
    return this.get('/admin/dashboard/sales-analytics', { params: period ? { period } : undefined });
  }

  async getCustomerAnalytics() {
    return this.get('/admin/dashboard/customer-analytics');
  }

  async getInventoryOverview() {
    return this.get('/admin/dashboard/inventory-overview');
  }

  async getOrderInsights() {
    return this.get('/admin/dashboard/order-insights');
  }

  async getMarketingPerformance() {
    return this.get('/admin/dashboard/marketing-performance');
  }

  // Admin Product Management
  async getAdminProducts(params?: any) {
    return this.get('/admin/products', { params });
  }

  async getAdminProduct(id: number) {
    return this.get(`/admin/products/${id}`);
  }

  async createProduct(data: any) {
    return this.post('/admin/products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.put(`/admin/products/${id}`, data);
  }

  async deleteProduct(id: number) {
    return this.delete(`/admin/products/${id}`);
  }

  async uploadProductImages(id: number, files: File[]) {
    return this.uploadMultipleFiles(`/admin/products/${id}/images`, files, 'images');
  }

  async toggleProductStatus(id: number) {
    return this.put(`/admin/products/${id}/toggle-status`);
  }

  async getProductAnalytics(id: number) {
    return this.get(`/admin/products/${id}/analytics`);
  }

  // Admin Category Management
  async createCategory(data: any) {
    return this.post('/admin/categories', data);
  }

  async updateCategory(id: number, data: any) {
    return this.put(`/admin/categories/${id}`, data);
  }

  async deleteCategory(id: number) {
    return this.delete(`/admin/categories/${id}`);
  }

  // Admin Order Management
  async getAdminOrders(params?: any) {
    return this.get('/admin/orders', { params });
  }

  async getAdminOrder(id: number) {
    return this.get(`/admin/orders/${id}`);
  }

  async updateOrderStatus(id: number, data: { status: string; notes?: string }) {
    return this.put(`/admin/orders/${id}/status`, data);
  }

  async updatePaymentStatus(id: number, data: { payment_status: string; transaction_id?: string }) {
    return this.put(`/admin/orders/${id}/payment-status`, data);
  }

  async cancelAdminOrder(id: number, reason: string) {
    return this.post(`/admin/orders/${id}/cancel`, { reason });
  }

  async processRefund(id: number, data: { amount: number; reason: string; refund_method: string }) {
    return this.post(`/admin/orders/${id}/refund`, data);
  }

  async getOrderTimeline(id: number) {
    return this.get(`/admin/orders/${id}/timeline`);
  }

  // Admin User Management
  async getAdminUsers(params?: any) {
    return this.get('/admin/users', { params });
  }

  async getAdminUser(id: number) {
    return this.get(`/admin/users/${id}`);
  }

  async updateUser(id: number, data: any) {
    return this.put(`/admin/users/${id}`, data);
  }

  async resetUserPassword(id: number, newPassword: string) {
    return this.post(`/admin/users/${id}/reset-password`, { new_password: newPassword });
  }

  async toggleUserStatus(id: number) {
    return this.post(`/admin/users/${id}/toggle-status`);
  }

  // System Health
  async getSystemHealth() {
    return this.get('/admin/system/health');
  }

  async clearCache() {
    return this.post('/admin/system/cache/clear');
  }

  async optimizeSystem() {
    return this.post('/admin/system/optimize');
  }

  async getApiHealth() {
    return this.get('/health');
  }

  // Configuration API methods
  async getSiteConfig() {
    return this.get('/config/site');
  }

  async getHomepageConfig() {
    return this.get('/config/homepage');
  }

  async getNavigationConfig() {
    return this.get('/config/navigation');
  }

  async getContentPage(slug: string) {
    return this.get(`/config/content/${slug}`);
  }

  // Admin Content Management
  async updateSiteConfig(data: any) {
    return this.put('/admin/content/site-config', data);
  }

  async updateHomepageConfig(data: any) {
    return this.put('/admin/content/homepage-config', data);
  }

  async updateNavigationConfig(data: any) {
    return this.put('/admin/content/navigation-config', data);
  }

  async updateContentPage(slug: string, data: any) {
    return this.put(`/admin/content/pages/${slug}`, data);
  }

  async uploadMedia(file: File, type: string) {
    return this.uploadFile('/admin/content/media/upload', file, { type });
  }

  async getMediaLibrary(params?: { type?: string; page?: number; per_page?: number }) {
    return this.get('/admin/content/media/library', { params });
  }

  async deleteMedia(id: number) {
    return this.delete(`/admin/content/media/${id}`);
  }

  async getThemePresets() {
    return this.get('/admin/content/theme-presets');
  }

  // Address API methods
  async getAddresses(type?: 'shipping' | 'billing') {
    return this.get('/addresses', { params: type ? { type } : undefined });
  }

  async getAddress(id: number) {
    return this.get(`/addresses/${id}`);
  }

  async createAddress(data: any) {
    return this.post('/addresses', data);
  }

  async updateAddress(id: number, data: any) {
    return this.put(`/addresses/${id}`, data);
  }

  async deleteAddress(id: number) {
    return this.delete(`/addresses/${id}`);
  }

  async setDefaultAddress(id: number) {
    return this.put(`/addresses/${id}/set-default`);
  }

  async getDefaultAddresses() {
    return this.get('/addresses/defaults/all');
  }

  async validateAddress(data: any) {
    return this.post('/addresses/validate', data);
  }

  // Payment API methods
  async getPaymentMethods(amount?: number) {
    return this.get('/payment/methods', { params: amount ? { amount } : undefined });
  }

  async initiatePayment(data: { order_id: number; payment_method: string; return_url?: string; cancel_url?: string }) {
    return this.post('/payment/initiate', data);
  }

  async razorpayCallback(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    return this.post('/payment/razorpay/callback', data);
  }

  async cashfreeCallback(orderId: string) {
    return this.post(`/payment/cashfree/callback/${orderId}`);
  }

  async getPaymentStatus(orderId: number) {
    return this.get(`/payment/status/${orderId}`);
  }

  async refundPayment(paymentId: number, data: { amount?: number; reason?: string }) {
    return this.post(`/payment/refund/${paymentId}`, data);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export individual API modules for better organization
export const authApi = {
  login: apiClient.login.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  forgotPassword: apiClient.forgotPassword.bind(apiClient),
  resetPassword: apiClient.resetPassword.bind(apiClient),
  getUser: apiClient.getUser.bind(apiClient),
  updateProfile: apiClient.updateProfile.bind(apiClient),
  changePassword: apiClient.changePassword.bind(apiClient),
  revokeAllTokens: apiClient.revokeAllTokens.bind(apiClient),
};

export const productApi = {
  getProducts: apiClient.getProducts.bind(apiClient),
  getProduct: apiClient.getProduct.bind(apiClient),
  searchProducts: apiClient.searchProducts.bind(apiClient),
  getFeaturedProducts: apiClient.getFeaturedProducts.bind(apiClient),
  getProductSuggestions: apiClient.getProductSuggestions.bind(apiClient),
  getProductFilters: apiClient.getProductFilters.bind(apiClient),
  getProductsByCategory: apiClient.getProductsByCategory.bind(apiClient),
  getProductsByCategories: apiClient.getProductsByCategories.bind(apiClient),
};

export const categoryApi = {
  getCategories: apiClient.getCategories.bind(apiClient),
  getCategory: apiClient.getCategory.bind(apiClient),
};

export const cartApi = {
  getCart: apiClient.getCart.bind(apiClient),
  addToCart: apiClient.addToCart.bind(apiClient),
  updateCartItem: apiClient.updateCartItem.bind(apiClient),
  removeCartItem: apiClient.removeCartItem.bind(apiClient),
  clearCart: apiClient.clearCart.bind(apiClient),
  applyCoupon: apiClient.applyCoupon.bind(apiClient),
  removeCoupon: apiClient.removeCoupon.bind(apiClient),
  getAvailableCoupons: apiClient.getAvailableCoupons.bind(apiClient),
};

export const orderApi = {
  getOrders: apiClient.getOrders.bind(apiClient),
  getOrder: apiClient.getOrder.bind(apiClient),
  createOrder: apiClient.createOrder.bind(apiClient),
  cancelOrder: apiClient.cancelOrder.bind(apiClient),
  downloadInvoice: apiClient.downloadInvoice.bind(apiClient),
  downloadReceipt: apiClient.downloadReceipt.bind(apiClient),
};

export const shippingApi = {
  getShippingZones: apiClient.getShippingZones.bind(apiClient),
  checkPincode: apiClient.checkPincode.bind(apiClient),
  getShippingRates: apiClient.getShippingRates.bind(apiClient),
  calculateShipping: apiClient.calculateShipping.bind(apiClient),
  calculateCartShipping: apiClient.calculateCartShipping.bind(apiClient),
  getDeliveryOptions: apiClient.getDeliveryOptions.bind(apiClient),
  getInsurancePlans: apiClient.getInsurancePlans.bind(apiClient),
};

export const adminApi = {
  // Dashboard
  getDashboardOverview: apiClient.getDashboardOverview.bind(apiClient),
  getSalesAnalytics: apiClient.getSalesAnalytics.bind(apiClient),
  getCustomerAnalytics: apiClient.getCustomerAnalytics.bind(apiClient),
  getInventoryOverview: apiClient.getInventoryOverview.bind(apiClient),
  getOrderInsights: apiClient.getOrderInsights.bind(apiClient),
  getMarketingPerformance: apiClient.getMarketingPerformance.bind(apiClient),
  
  // Product Management
  getProducts: apiClient.getAdminProducts.bind(apiClient),
  getProduct: apiClient.getAdminProduct.bind(apiClient),
  createProduct: apiClient.createProduct.bind(apiClient),
  updateProduct: apiClient.updateProduct.bind(apiClient),
  deleteProduct: apiClient.deleteProduct.bind(apiClient),
  uploadProductImages: apiClient.uploadProductImages.bind(apiClient),
  toggleProductStatus: apiClient.toggleProductStatus.bind(apiClient),
  getProductAnalytics: apiClient.getProductAnalytics.bind(apiClient),
  
  // Category Management
  createCategory: apiClient.createCategory.bind(apiClient),
  updateCategory: apiClient.updateCategory.bind(apiClient),
  deleteCategory: apiClient.deleteCategory.bind(apiClient),
  
  // Order Management
  getOrders: apiClient.getAdminOrders.bind(apiClient),
  getOrder: apiClient.getAdminOrder.bind(apiClient),
  updateOrderStatus: apiClient.updateOrderStatus.bind(apiClient),
  updatePaymentStatus: apiClient.updatePaymentStatus.bind(apiClient),
  cancelOrder: apiClient.cancelAdminOrder.bind(apiClient),
  processRefund: apiClient.processRefund.bind(apiClient),
  getOrderTimeline: apiClient.getOrderTimeline.bind(apiClient),
  
  // User Management
  getUsers: apiClient.getAdminUsers.bind(apiClient),
  getUser: apiClient.getAdminUser.bind(apiClient),
  updateUser: apiClient.updateUser.bind(apiClient),
  resetUserPassword: apiClient.resetUserPassword.bind(apiClient),
  toggleUserStatus: apiClient.toggleUserStatus.bind(apiClient),
  
  // System
  getSystemHealth: apiClient.getSystemHealth.bind(apiClient),
  clearCache: apiClient.clearCache.bind(apiClient),
  optimizeSystem: apiClient.optimizeSystem.bind(apiClient),
};

export const systemApi = {
  getHealth: apiClient.getApiHealth.bind(apiClient),
};

export const configApi = {
  getSiteConfig: apiClient.getSiteConfig.bind(apiClient),
  getHomepageConfig: apiClient.getHomepageConfig.bind(apiClient),
  getNavigationConfig: apiClient.getNavigationConfig.bind(apiClient),
  getContentPage: apiClient.getContentPage.bind(apiClient),
};

export const contentApi = {
  // Configuration Updates
  updateSiteConfig: apiClient.updateSiteConfig.bind(apiClient),
  updateHomepageConfig: apiClient.updateHomepageConfig.bind(apiClient),
  updateNavigationConfig: apiClient.updateNavigationConfig.bind(apiClient),
  updateContentPage: apiClient.updateContentPage.bind(apiClient),
  
  // Media Management
  uploadMedia: apiClient.uploadMedia.bind(apiClient),
  getMediaLibrary: apiClient.getMediaLibrary.bind(apiClient),
  deleteMedia: apiClient.deleteMedia.bind(apiClient),
  
  // Theme Management
  getThemePresets: apiClient.getThemePresets.bind(apiClient),
};

export const addressApi = {
  getAddresses: apiClient.getAddresses.bind(apiClient),
  getAddress: apiClient.getAddress.bind(apiClient),
  createAddress: apiClient.createAddress.bind(apiClient),
  updateAddress: apiClient.updateAddress.bind(apiClient),
  deleteAddress: apiClient.deleteAddress.bind(apiClient),
  setDefault: apiClient.setDefaultAddress.bind(apiClient),
  setDefaultAddress: apiClient.setDefaultAddress.bind(apiClient),
  getDefaultAddresses: apiClient.getDefaultAddresses.bind(apiClient),
  validateAddress: apiClient.validateAddress.bind(apiClient),
};

export const paymentApi = {
  getPaymentMethods: apiClient.getPaymentMethods.bind(apiClient),
  initiatePayment: apiClient.initiatePayment.bind(apiClient),
  razorpayCallback: apiClient.razorpayCallback.bind(apiClient),
  cashfreeCallback: apiClient.cashfreeCallback.bind(apiClient),
  getPaymentStatus: apiClient.getPaymentStatus.bind(apiClient),
  refundPayment: apiClient.refundPayment.bind(apiClient),
};