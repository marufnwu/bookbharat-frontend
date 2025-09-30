import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types';
import { authStore } from '@/stores/auth';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  // Centralized image transformation helper
  private transformProductImages(product: any): any {
    if (!product) return product;

    return {
      ...product,
      images: product.images?.map((img: any) => ({
        ...img,
        url: img.image_url || img.url || img.image_path
      })) || []
    };
  }

  // Transform multiple products
  private transformProductsImages(products: any[]): any[] {
    if (!Array.isArray(products)) return products;
    return products.map(product => this.transformProductImages(product));
  }

  // Transform cart/wishlist/order items with nested products
  private transformItemWithProduct(item: any): any {
    if (!item) return item;

    return {
      ...item,
      product: item.product ? this.transformProductImages(item.product) : item.product
    };
  }

  // Transform multiple items with nested products
  private transformItemsWithProducts(items: any[]): any[] {
    if (!Array.isArray(items)) return items;
    return items.map(item => this.transformItemWithProduct(item));
  }

  // Transform order with items
  private transformOrder(order: any): any {
    if (!order) return order;

    return {
      ...order,
      items: order.items ? this.transformItemsWithProducts(order.items) : order.items
    };
  }

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
          // Handle unauthorized access - clear auth state
          if (typeof window !== 'undefined') {
            // Use auth store to properly clear state
            authStore.handleUnauthorized();
            
            // Only redirect to login if not already there
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/auth/')) {
              // Store current path for redirect after login
              const returnUrl = encodeURIComponent(currentPath + window.location.search);
              window.location.href = `/auth/login?redirect=${returnUrl}`;
            }
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
    const response = await this.get('/products', { params });

    if (response.success && response.data) {
      const products = response.data.data || response.data;
      const transformedProducts = Array.isArray(products) ?
        this.transformProductsImages(products) : products;

      if (response.data.data) {
        response.data.data = transformedProducts;
      } else {
        response.data = transformedProducts;
      }
    }

    return response;
  }

  async getProduct(id: number | string) {
    const response = await this.get(`/products/${id}`);

    if (response.success && response.data) {
      response.data = this.transformProductImages(response.data);
    }

    return response;
  }

  async searchProducts(query: string, filters?: any) {
    const response = await this.get('/products/search', { params: { query: query, ...filters } });

    if (response.success && response.data) {
      const products = response.data.data || response.data;
      const transformedProducts = Array.isArray(products) ?
        this.transformProductsImages(products) : products;

      if (response.data.data) {
        response.data.data = transformedProducts;
      } else {
        response.data = transformedProducts;
      }
    }

    return response;
  }

  async getFeaturedProducts() {
    const response = await this.get('/products/featured');

    if (response.success && response.data) {
      response.data = this.transformProductsImages(response.data);
    }

    return response;
  }

  async getProductSuggestions(query: string) {
    return this.get('/products/suggestions', { params: { query: query } });
  }

  async getProductFilters() {
    return this.get('/products/filters');
  }

  async getProductsByCategory(categoryId: number, params?: any) {
    const response = await this.get(`/products/category/${categoryId}`, { params });

    if (response.success && response.data?.products?.data) {
      response.data.products.data = this.transformProductsImages(response.data.products.data);
    }

    return response;
  }

  async getProductsByCategories(params?: any) {
    const response = await this.get('/products/by-categories', { params });

    if (response.success && response.data && Array.isArray(response.data)) {
      response.data = response.data.map((category: any) => ({
        ...category,
        products: category.products ? this.transformProductsImages(category.products) : []
      }));
    }

    return response;
  }

  async getRelatedProducts(productId: number | string) {
    const response = await this.get(`/products/${productId}/related`);

    if (response.success && response.data && Array.isArray(response.data)) {
      response.data = this.transformProductsImages(response.data);
    }

    return response;
  }

  async getFrequentlyBoughtTogether(productId: number | string) {
    const response = await this.get(`/products/${productId}/frequently-bought-together`);

    if (response.success && response.data?.products) {
      response.data.products = this.transformProductsImages(response.data.products);
    }

    return response;
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
    const response = await this.get('/cart');

    // Handle different response structures from backend
    if (response.success) {
      if (response.cart?.items) {
        // Response structure: { success: true, cart: { items: [...] } }
        response.cart.items = this.transformItemsWithProducts(response.cart.items);
      } else if (response.data?.items) {
        // Response structure: { success: true, data: { items: [...] } }
        response.data.items = this.transformItemsWithProducts(response.data.items);
      }
    }

    return response;
  }

  async addToCart(productId: number, quantity: number) {
    const response = await this.post('/cart/add', { product_id: productId, quantity });

    if (response.success && response.data?.items) {
      response.data.items = this.transformItemsWithProducts(response.data.items);
    }

    return response;
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

  // Wishlist API methods
  async getWishlist() {
    const response = await this.get('/wishlist');

    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = this.transformItemsWithProducts(response.data);
      } else if (response.data.items) {
        response.data.items = this.transformItemsWithProducts(response.data.items);
      }
    }

    return response;
  }

  async addToWishlist(productId: number) {
    return this.post('/wishlist', { product_id: productId });
  }

  async removeFromWishlist(wishlistItemId: number) {
    return this.delete(`/wishlist/${wishlistItemId}`);
  }

  async moveWishlistToCart(wishlistItemId: number) {
    return this.post('/wishlist/move-to-cart', { wishlist_item_id: wishlistItemId });
  }

  async checkWishlistItem(productId: number) {
    return this.post('/wishlist/check', { product_id: productId });
  }

  async clearWishlist() {
    return this.delete('/wishlist/clear/all');
  }

  async getWishlistStats() {
    return this.get('/wishlist/stats');
  }

  // Review API methods
  async getProductReviews(productId: number, params?: any) {
    return this.get(`/reviews/product/${productId}`, { params });
  }

  async createReview(data: { product_id: number; rating: number; title?: string; comment: string }) {
    return this.post('/reviews', data);
  }

  async getUserReviews() {
    return this.get('/reviews/my-reviews');
  }

  async updateReview(reviewId: number, data: { rating: number; title?: string; comment: string }) {
    return this.put(`/reviews/${reviewId}`, data);
  }

  async deleteReview(reviewId: number) {
    return this.delete(`/reviews/${reviewId}`);
  }

  async getEligibleProducts() {
    return this.get('/reviews/eligible-products');
  }

  async getUserReviewStats() {
    return this.get('/reviews/my-stats');
  }

  async reportReview(reviewId: number, reason: string) {
    return this.post(`/reviews/${reviewId}/report`, { reason });
  }

  // Contact API methods
  async submitContactForm(data: { name: string; email: string; subject: string; category: string; message: string }) {
    return this.post('/contact/submit', data);
  }

  async getContactCategories() {
    return this.get('/contact/categories');
  }

  // Newsletter API methods
  async subscribeToNewsletter(data: { email: string; name?: string; preferences?: string[]; source?: string }) {
    return this.post('/newsletter/subscribe', data);
  }

  async unsubscribeFromNewsletter(data: { email: string; token?: string }) {
    return this.post('/newsletter/unsubscribe', data);
  }

  async updateNewsletterPreferences(data: { email: string; preferences: string[]; name?: string }) {
    return this.put('/newsletter/preferences', data);
  }

  async getNewsletterStatus(email: string) {
    return this.get('/newsletter/status', { params: { email } });
  }

  // Order API methods
  async getOrders() {
    const response = await this.get('/orders');

    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(order => this.transformOrder(order));
      } else if (response.data.data) {
        response.data.data = response.data.data.map((order: any) => this.transformOrder(order));
      }
    }

    return response;
  }

  async getOrder(idOrNumber: string | number) {
    const response = await this.get(`/orders/${idOrNumber}`);

    if (response.success && response.data) {
      response.data = this.transformOrder(response.data);
    }

    return response;
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
    const response = await this.get('/admin/orders', { params });

    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(order => this.transformOrder(order));
      } else if (response.data.data) {
        response.data.data = response.data.data.map((order: any) => this.transformOrder(order));
      }
    }

    return response;
  }

  async getAdminOrder(id: number) {
    const response = await this.get(`/admin/orders/${id}`);

    if (response.success && response.data) {
      response.data = this.transformOrder(response.data);
    }

    return response;
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

  // Hero Configuration API methods
  async getHeroConfigs() {
    return this.get('/hero');
  }

  async getActiveHeroConfig() {
    const response = await this.get('/hero/active');

    // Transform featuredProducts images if they exist
    if (response.success && response.data?.featuredProducts) {
      response.data.featuredProducts = this.transformProductsImages(response.data.featuredProducts);
    }

    return response;
  }

  async getHeroConfig(variant: string) {
    return this.get(`/hero/${variant}`);
  }

  async updateHeroConfig(variant: string, data: any) {
    return this.put(`/hero/${variant}`, data);
  }

  async setActiveHeroVariant(variant: string) {
    return this.post('/hero/set-active', { variant });
  }

  // Payment API methods
  async getPaymentMethods(amount?: number, currency?: string) {
    // Use the unified payment gateway endpoint
    return this.get('/payment/gateways', { params: { amount, currency: currency || 'INR' } });
  }

  async initiatePayment(data: { order_id: number; gateway: string; return_url?: string; cancel_url?: string }) {
    return this.post('/payment/initiate', data);
  }

  async razorpayCallback(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    return this.post('/payment/callback/razorpay', data);
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

  // Static Pages API methods
  async getStaticPages() {
    return this.get('/pages');
  }

  async getStaticPage(slug: string) {
    return this.get(`/pages/${slug}`);
  }

  // FAQ API methods
  async getFaqs(params?: { category?: string; search?: string }) {
    return this.get('/faqs', { params });
  }

  async getFaqCategories() {
    return this.get('/faqs/categories');
  }

  async getFaq(id: number) {
    return this.get(`/faqs/${id}`);
  }

  async searchFaqs(query: string) {
    return this.get('/faqs/search', { params: { q: query } });
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
  getProfile: apiClient.getUser.bind(apiClient),
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
  getRelatedProducts: apiClient.getRelatedProducts.bind(apiClient),
  getFrequentlyBoughtTogether: apiClient.getFrequentlyBoughtTogether.bind(apiClient),
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

export const wishlistApi = {
  getWishlist: apiClient.getWishlist.bind(apiClient),
  addToWishlist: apiClient.addToWishlist.bind(apiClient),
  removeFromWishlist: apiClient.removeFromWishlist.bind(apiClient),
  moveWishlistToCart: apiClient.moveWishlistToCart.bind(apiClient),
  checkWishlistItem: apiClient.checkWishlistItem.bind(apiClient),
  clearWishlist: apiClient.clearWishlist.bind(apiClient),
  getWishlistStats: apiClient.getWishlistStats.bind(apiClient),
};

export const reviewApi = {
  getProductReviews: apiClient.getProductReviews.bind(apiClient),
  createReview: apiClient.createReview.bind(apiClient),
  getUserReviews: apiClient.getUserReviews.bind(apiClient),
  updateReview: apiClient.updateReview.bind(apiClient),
  deleteReview: apiClient.deleteReview.bind(apiClient),
  getEligibleProducts: apiClient.getEligibleProducts.bind(apiClient),
  getUserReviewStats: apiClient.getUserReviewStats.bind(apiClient),
  reportReview: apiClient.reportReview.bind(apiClient),
};

export const contactApi = {
  submitContactForm: apiClient.submitContactForm.bind(apiClient),
  getContactCategories: apiClient.getContactCategories.bind(apiClient),
};

export const newsletterApi = {
  subscribe: apiClient.subscribeToNewsletter.bind(apiClient),
  unsubscribe: apiClient.unsubscribeFromNewsletter.bind(apiClient),
  updatePreferences: apiClient.updateNewsletterPreferences.bind(apiClient),
  getStatus: apiClient.getNewsletterStatus.bind(apiClient),
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

export const heroApi = {
  getHeroConfigs: apiClient.getHeroConfigs.bind(apiClient),
  getActiveHeroConfig: apiClient.getActiveHeroConfig.bind(apiClient),
  getHeroConfig: apiClient.getHeroConfig.bind(apiClient),
  updateHeroConfig: apiClient.updateHeroConfig.bind(apiClient),
  setActiveHeroVariant: apiClient.setActiveHeroVariant.bind(apiClient),
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

export const staticPagesApi = {
  getPages: apiClient.getStaticPages.bind(apiClient),
  getPage: apiClient.getStaticPage.bind(apiClient),
};

export const faqApi = {
  getFaqs: apiClient.getFaqs.bind(apiClient),
  getFaqCategories: apiClient.getFaqCategories.bind(apiClient),
  getFaq: apiClient.getFaq.bind(apiClient),
  searchFaqs: apiClient.searchFaqs.bind(apiClient),
};