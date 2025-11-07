import { useCallback, useEffect, useRef } from 'react';
import { marketingConfigService } from '@/lib/marketing-config';

interface TrackingEvent {
  event: string;
  parameters?: Record<string, any>;
  value?: number;
  currency?: string;
}

interface TrackingHook {
  track: (event: string, parameters?: Record<string, any>) => void;
  trackPageView: (path?: string) => void;
  trackProductView: (product: any) => void;
  trackAddToCart: (product: any, quantity?: number) => void;
  trackBeginCheckout: (items: any[], value?: number) => void;
  trackPurchase: (orderId: string, items: any[], value: number, currency?: string) => void;
  trackSearch: (query: string, results?: number) => void;
  trackShare: (platform: string, content?: string) => void;
  trackNewsletterSignup: (email?: string) => void;
  trackContactForm: (type?: string) => void;
}

/**
 * useTracking Hook
 *
 * This hook provides event tracking functionality based on backend configuration.
 * It checks if events are enabled in the marketing config before sending them.
 */
export function useTracking(): TrackingHook {
  const trackingConfigRef = useRef<any>(null);
  const isConfigLoadedRef = useRef(false);

  // Load tracking config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const tracking = await marketingConfigService.getTrackingConfig();
        trackingConfigRef.current = tracking;
        isConfigLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load tracking config:', error);
        isConfigLoadedRef.current = true;
      }
    };

    loadConfig();
  }, []);

  // Check if tracking is enabled for a specific event
  const isEventEnabled = useCallback((event: string): boolean => {
    if (!isConfigLoadedRef.current || !trackingConfigRef.current) {
      return false;
    }

    const eventMap: Record<string, keyof typeof trackingConfigRef.current['events']> = {
      'page_view': 'page_view',
      'product_view': 'product_view',
      'add_to_cart': 'add_to_cart',
      'begin_checkout': 'begin_checkout',
      'purchase': 'purchase',
      'search': 'search',
      'share': 'share',
      'newsletter_signup': 'newsletter_signup',
      'contact_form': 'contact_form',
    };

    const configKey = eventMap[event];
    if (!configKey) return false;

    return trackingConfigRef.current.events[configKey] || false;
  }, []);

  // Generic tracking function
  const track = useCallback((event: string, parameters?: Record<string, any>) => {
    if (!isEventEnabled(event)) return;

    const config = trackingConfigRef.current;
    if (!config) return;

    // Add default parameters from backend config
    const defaultParams = {
      currency: config.event_parameters.currency,
      content_type: config.event_parameters.content_type,
      event_category: config.event_parameters.event_category,
      ...parameters,
    };

    // Log debug information if enabled
    if (config.debug.console_logging) {
      console.log('📊 Tracking Event:', event, defaultParams);
    }

    // Google Analytics (gtag)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, defaultParams);
    }

    // Meta Pixel (fbq)
    if (typeof window !== 'undefined' && window.fbq) {
      const fbEventMap: Record<string, string> = {
        'product_view': 'ViewContent',
        'add_to_cart': 'AddToCart',
        'begin_checkout': 'InitiateCheckout',
        'purchase': 'Purchase',
        'search': 'Search',
        'newsletter_signup': 'Lead',
      };

      const fbEvent = fbEventMap[event] || event;
      window.fbq('trackCustom', fbEvent, defaultParams);
    }

    // TikTok Pixel (ttq)
    if (typeof window !== 'undefined' && window.ttq) {
      const ttEventMap: Record<string, string> = {
        'product_view': 'ViewContent',
        'add_to_cart': 'AddToCart',
        'begin_checkout': 'InitiateCheckout',
        'purchase': 'CompletePayment',
        'search': 'Search',
      };

      const ttEvent = ttEventMap[event] || event;
      window.ttq.track(ttEvent, defaultParams);
    }

    // Pinterest Tag
    if (typeof window !== 'undefined' && window.pintrk) {
      const pinEventMap: Record<string, string> = {
        'product_view': 'PageVisit',
        'add_to_cart': 'AddToCart',
        'begin_checkout': 'Checkout',
        'purchase': 'Purchase',
        'search': 'Search',
        'newsletter_signup': 'Signup',
      };

      const pinEvent = pinEventMap[event] || 'PageVisit';
      window.pintrk('track', pinEvent, defaultParams);
    }
  }, [isEventEnabled]);

  // Specific tracking functions
  const trackPageView = useCallback((path?: string) => {
    track('page_view', {
      page_path: path || (typeof window !== 'undefined' ? window.location.pathname : ''),
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
    });
  }, [track]);

  const trackProductView = useCallback((product: any) => {
    track('product_view', {
      content_ids: [product.id || product.sku],
      content_name: product.name,
      content_category: product.category?.name,
      value: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      currency: 'INR',
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name,
        category: product.category?.name,
        quantity: 1,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      }],
    });
  }, [track]);

  const trackAddToCart = useCallback((product: any, quantity = 1) => {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    track('add_to_cart', {
      content_ids: [product.id || product.sku],
      content_name: product.name,
      content_category: product.category?.name,
      value: price * quantity,
      currency: 'INR',
      items: [{
        item_id: product.id || product.sku,
        item_name: product.name,
        category: product.category?.name,
        quantity,
        price,
      }],
    });
  }, [track]);

  const trackBeginCheckout = useCallback((items: any[], value?: number) => {
    track('begin_checkout', {
      content_ids: items.map(item => item.id || item.sku),
      value,
      currency: 'INR',
      items: items.map(item => ({
        item_id: item.id || item.sku,
        item_name: item.name,
        category: item.category?.name,
        quantity: item.quantity || 1,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      })),
    });
  }, [track]);

  const trackPurchase = useCallback((orderId: string, items: any[], value: number, currency = 'INR') => {
    track('purchase', {
      content_ids: items.map(item => item.id || item.sku),
      transaction_id: orderId,
      value,
      currency,
      items: items.map(item => ({
        item_id: item.id || item.sku,
        item_name: item.name,
        category: item.category?.name,
        quantity: item.quantity || 1,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      })),
    });
  }, [track]);

  const trackSearch = useCallback((query: string, results?: number) => {
    track('search', {
      search_term: query,
      results_count: results,
    });
  }, [track]);

  const trackShare = useCallback((platform: string, content?: string) => {
    track('share', {
      method: platform,
      content_type: content || 'product',
    });
  }, [track]);

  const trackNewsletterSignup = useCallback((email?: string) => {
    track('newsletter_signup', {
      email: email ? email.replace(/(.{2}).*(.@)/, '$1***$2') : undefined, // Partial masking for privacy
    });
  }, [track]);

  const trackContactForm = useCallback((type?: string) => {
    track('contact_form', {
      form_type: type || 'general',
    });
  }, [track]);

  return {
    track,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackShare,
    trackNewsletterSignup,
    trackContactForm,
  };
}

export default useTracking;