'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface AnalyticsUser {
  id?: string;
  email?: string;
  isAuthenticated: boolean;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private user: AnalyticsUser | null = null;
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadEvents(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('analytics_events');
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load analytics events:', error);
    }
  }

  private saveEvents(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  setUser(user: AnalyticsUser): void {
    this.user = user;
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.user?.id,
        userEmail: this.user?.email,
        isAuthenticated: this.user?.isAuthenticated || false,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      },
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // Send to backend
    this.sendToBackend(analyticsEvent);
  }

  private async sendToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      // Use existing backend endpoint for analytics tracking
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const baseUrl = apiUrl.replace('/api/v1', '');

      await fetch(`${baseUrl}/api/v1/tracking/track/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send analytics event to backend:', error);
    }
  }

  // E-commerce specific events
  trackProductView(product: any): void {
    this.track('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category?.name,
      product_author: product.author,
      product_publisher: product.publisher,
    });
  }

  trackAddToCart(product: any, quantity: number = 1, bundleVariantId?: number): void {
    this.track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity,
      bundle_variant_id: bundleVariantId,
      cart_value: this.calculateCartValue(),
    });
  }

  trackRemoveFromCart(product: any, quantity: number = 1): void {
    this.track('remove_from_cart', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity,
      cart_value: this.calculateCartValue(),
    });
  }

  trackCartView(cart: any): void {
    this.track('cart_viewed', {
      cart_items_count: cart.items?.length || 0,
      cart_total_items: cart.total_items || 0,
      cart_value: cart.subtotal || 0,
      cart_has_bundles: cart.items?.some((item: any) => item.bundle_variant_id) || false,
    });
  }

  trackCheckoutStarted(cart: any): void {
    this.track('checkout_started', {
      cart_items_count: cart.items?.length || 0,
      cart_total_items: cart.total_items || 0,
      cart_value: cart.subtotal || 0,
      cart_has_bundles: cart.items?.some((item: any) => item.bundle_variant_id) || false,
    });
  }

  trackOrderCompleted(order: any): void {
    this.track('order_completed', {
      order_id: order.id,
      order_number: order.order_number,
      order_value: order.total_amount,
      order_items_count: order.order_items?.length || 0,
      payment_method: order.payment_method,
      order_has_bundles: order.order_items?.some((item: any) => item.bundle_variant_id) || false,
    });
  }

  trackWishlistAdd(product: any): void {
    this.track('wishlist_added', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
    });
  }

  trackWishlistRemove(product: any): void {
    this.track('wishlist_removed', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
    });
  }

  trackSearch(searchTerm: string, resultsCount: number): void {
    this.track('search_performed', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  trackCouponApplied(couponCode: string, discount: number): void {
    this.track('coupon_applied', {
      coupon_code: couponCode,
      discount_amount: discount,
    });
  }

  trackAbandonedCart(cart: any): void {
    this.track('cart_abandoned', {
      cart_items_count: cart.items?.length || 0,
      cart_total_items: cart.total_items || 0,
      cart_value: cart.subtotal || 0,
      cart_has_bundles: cart.items?.some((item: any) => item.bundle_variant_id) || false,
    });
  }

  trackMobileGesture(gesture: string, context: string): void {
    this.track('mobile_gesture_used', {
      gesture_type: gesture,
      context,
      device_type: this.getDeviceType(),
    });
  }

  private calculateCartValue(): number {
    // This would need to be passed from the cart store
    return 0;
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Page tracking
  trackPageView(page: string): void {
    this.track('page_viewed', {
      page_name: page,
      page_url: window.location.href,
    });
  }

  // Performance tracking
  trackPerformance(metric: string, value: number): void {
    this.track('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: 'ms',
    });
  }

  // Error tracking
  trackError(error: Error, context?: string): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  // Get analytics data
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Clear events (for testing)
  clearEvents(): void {
    this.events = [];
    this.saveEvents();
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  const analyticsRef = useRef(analytics);

  useEffect(() => {
    // Track page view on mount
    analyticsRef.current.trackPageView(window.location.pathname);
  }, []);

  return analyticsRef.current;
}

// Higher-order component for page tracking
export function withAnalytics<T extends object>(Component: React.ComponentType<T>) {
  return function AnalyticsWrapper(props: T) {
    const analytics = useAnalytics();

    useEffect(() => {
      const pageName = Component.displayName || Component.name || 'Unknown';
      analytics.trackPageView(pageName);
    }, [analytics]);

    return React.createElement(Component, props);
  };
}

// Analytics event constants
export const ANALYTICS_EVENTS = {
  PRODUCT_VIEWED: 'product_viewed',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CART_VIEWED: 'cart_viewed',
  CHECKOUT_STARTED: 'checkout_started',
  ORDER_COMPLETED: 'order_completed',
  WISHLIST_ADDED: 'wishlist_added',
  WISHLIST_REMOVED: 'wishlist_removed',
  SEARCH_PERFORMED: 'search_performed',
  COUPON_APPLIED: 'coupon_applied',
  CART_ABANDONED: 'cart_abandoned',
  MOBILE_GESTURE_USED: 'mobile_gesture_used',
  PAGE_VIEWED: 'page_viewed',
  PERFORMANCE_METRIC: 'performance_metric',
  ERROR_OCCURRED: 'error_occurred',
} as const;
