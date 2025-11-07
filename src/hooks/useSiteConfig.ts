import { useEffect, useState, useCallback, useMemo } from 'react';
import { siteConfigService, type SiteConfig, type HomepageConfig, type NavigationConfig, type HeroConfig } from '@/lib/site-config';

interface UseSiteConfigReturn {
  siteConfig: SiteConfig | null;
  homepageConfig: HomepageConfig | null;
  navigationConfig: NavigationConfig | null;
  heroConfig: HeroConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isFeatureEnabled: (feature: keyof SiteConfig['features']) => boolean;
  isPaymentMethodEnabled: (method: keyof SiteConfig['payment']['methods_enabled']) => boolean;
  getThemeVariables: () => Record<string, string> | null;
}

/**
 * Hook for accessing site-wide configuration
 */
export function useSiteConfig(): UseSiteConfigReturn {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(null);
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [site, homepage, navigation, hero] = await Promise.all([
        siteConfigService.getSiteConfig(),
        siteConfigService.getHomepageConfig(),
        siteConfigService.getNavigationConfig(),
        siteConfigService.getHeroConfig(),
      ]);

      setSiteConfig(site);
      setHomepageConfig(homepage);
      setNavigationConfig(navigation);
      setHeroConfig(hero);
    } catch (err) {
      console.error('Failed to fetch site configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const isFeatureEnabled = useCallback((feature: keyof SiteConfig['features']): boolean => {
    return siteConfig ? siteConfig.features[feature] : false;
  }, [siteConfig]);

  const isPaymentMethodEnabled = useCallback((method: keyof SiteConfig['payment']['methods_enabled']): boolean => {
    return siteConfig ? siteConfig.payment.methods_enabled[method] : false;
  }, [siteConfig]);

  const getThemeVariables = useCallback((): Record<string, string> | null => {
    return siteConfig ? siteConfigService.generateCSSVariables(siteConfig.theme) : null;
  }, [siteConfig]);

  return {
    siteConfig,
    homepageConfig,
    navigationConfig,
    heroConfig,
    loading,
    error,
    refetch: fetchConfig,
    isFeatureEnabled,
    isPaymentMethodEnabled,
    getThemeVariables,
  };
}

/**
 * Hook for theme configuration
 */
export function useTheme() {
  const { siteConfig, getThemeVariables } = useSiteConfig();

  const theme = useMemo(() => {
    if (!siteConfig) return null;

    const variables = getThemeVariables();
    if (!variables) return null;

    return {
      ...siteConfig.theme,
      cssVariables: variables,
    };
  }, [siteConfig, getThemeVariables]);

  return theme;
}

/**
 * Hook for feature flags
 */
export function useFeatureFlags() {
  const { siteConfig, isFeatureEnabled } = useSiteConfig();

  const features = useMemo(() => {
    return {
      wishlist: isFeatureEnabled('wishlist_enabled'),
      guestCheckout: isFeatureEnabled('guest_checkout_enabled'),
      reviews: isFeatureEnabled('reviews_enabled'),
      productComparison: isFeatureEnabled('product_comparison_enabled'),
      recentlyViewed: isFeatureEnabled('recently_viewed_enabled'),
      abandonedCart: isFeatureEnabled('abandoned_cart_enabled'),
      oneClickCheckout: isFeatureEnabled('one_click_checkout'),
      socialLogin: isFeatureEnabled('social_login_enabled'),
    };
  }, [siteConfig, isFeatureEnabled]);

  return features;
}

/**
 * Hook for payment configuration
 */
export function usePaymentConfig() {
  const { siteConfig, isPaymentMethodEnabled } = useSiteConfig();

  const paymentConfig = useMemo(() => {
    if (!siteConfig) return null;

    return {
      ...siteConfig.payment,
      methods: {
        cod: isPaymentMethodEnabled('cod'),
        razorpay: isPaymentMethodEnabled('razorpay'),
        phonepe: isPaymentMethodEnabled('phonepe'),
        payu: isPaymentMethodEnabled('payu'),
        cardPayment: isPaymentMethodEnabled('card_payment'),
        netBanking: isPaymentMethodEnabled('net_banking'),
        walletPayment: isPaymentMethodEnabled('wallet_payment'),
        upiPayment: isPaymentMethodEnabled('upi_payment'),
      },
    };
  }, [siteConfig, isPaymentMethodEnabled]);

  return paymentConfig;
}

/**
 * Hook for shipping configuration
 */
export function useShippingConfig() {
  const { siteConfig } = useSiteConfig();

  const shippingConfig = useMemo(() => {
    return siteConfig?.shipping || null;
  }, [siteConfig]);

  return shippingConfig;
}

/**
 * Hook for social media configuration
 */
export function useSocialConfig() {
  const { siteConfig } = useSiteConfig();

  const socialConfig = useMemo(() => {
    return siteConfig?.social || null;
  }, [siteConfig]);

  return socialConfig;
}

/**
 * Hook for homepage configuration
 */
export function useHomepageConfig() {
  const { homepageConfig, loading, error } = useSiteConfig();

  const homepage = useMemo(() => {
    if (!homepageConfig) return null;

    return {
      heroSections: homepageConfig.hero_sections.filter(section => section.active),
      featuredSections: homepageConfig.featured_sections.filter(section => section.active),
      promotionalBanners: homepageConfig.promotional_banners.filter(banner =>
        banner.active && new Date(banner.end_date) > new Date()
      ),
      testimonials: homepageConfig.testimonials.filter(testimonial =>
        testimonial.active && testimonial.featured
      ),
      newsletter: homepageConfig.newsletter,
    };
  }, [homepageConfig]);

  return {
    homepage,
    loading,
    error,
  };
}

/**
 * Hook for navigation configuration
 */
export function useNavigationConfig() {
  const { navigationConfig } = useSiteConfig();

  const navigation = useMemo(() => {
    if (!navigationConfig) return null;

    return {
      header: {
        primary: navigationConfig.header.primary.filter(item => item.active),
        secondary: navigationConfig.header.secondary.filter(item => item.active),
        mobile: navigationConfig.header.mobile.filter(item => item.active),
      },
      footer: {
        primary: navigationConfig.footer.primary.filter(item => item.active),
        secondary: navigationConfig.footer.secondary.filter(item => item.active),
        legal: navigationConfig.footer.legal.filter(item => item.active),
        social: navigationConfig.footer.social.filter(item => item.active),
      },
    };
  }, [navigationConfig]);

  return navigation;
}

export default useSiteConfig;