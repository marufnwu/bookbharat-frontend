'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { siteConfigService, type SiteConfig, type HomepageConfig, type NavigationConfig, type HeroConfig } from '@/lib/site-config';

interface SiteConfigContextType {
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

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

interface SiteConfigProviderProps {
  children: ReactNode;
  initialConfig?: {
    site?: SiteConfig;
    homepage?: HomepageConfig;
    navigation?: NavigationConfig;
    hero?: HeroConfig;
  };
}

export function SiteConfigProvider({ children, initialConfig }: SiteConfigProviderProps) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(initialConfig?.site || null);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(initialConfig?.homepage || null);
  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(initialConfig?.navigation || null);
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(initialConfig?.hero || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
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
  };

  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    }
  }, [initialConfig]);

  const isFeatureEnabled = (feature: keyof SiteConfig['features']): boolean => {
    return siteConfig ? siteConfig.features[feature] : false;
  };

  const isPaymentMethodEnabled = (method: keyof SiteConfig['payment']['methods_enabled']): boolean => {
    return siteConfig ? siteConfig.payment.methods_enabled[method] : false;
  };

  const getThemeVariables = (): Record<string, string> | null => {
    return siteConfig ? siteConfigService.generateCSSVariables(siteConfig.theme) : null;
  };

  const contextValue: SiteConfigContextType = {
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

  return (
    <SiteConfigContext.Provider value={contextValue}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfigContext(): SiteConfigContextType {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfigContext must be used within a SiteConfigProvider');
  }
  return context;
}

// Utility hooks for specific configurations
export function useSiteInfo() {
  const { siteConfig } = useSiteConfigContext();
  return siteConfig?.site || null;
}

export function useThemeConfig() {
  const { siteConfig, getThemeVariables } = useSiteConfigContext();

  const theme = React.useMemo(() => {
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

export function useFeatureFlags() {
  const { isFeatureEnabled } = useSiteConfigContext();

  return React.useMemo(() => ({
    wishlist: isFeatureEnabled('wishlist_enabled'),
    guestCheckout: isFeatureEnabled('guest_checkout_enabled'),
    reviews: isFeatureEnabled('reviews_enabled'),
    productComparison: isFeatureEnabled('product_comparison_enabled'),
    recentlyViewed: isFeatureEnabled('recently_viewed_enabled'),
    abandonedCart: isFeatureEnabled('abandoned_cart_enabled'),
    oneClickCheckout: isFeatureEnabled('one_click_checkout'),
    socialLogin: isFeatureEnabled('social_login_enabled'),
  }), [isFeatureEnabled]);
}

export function usePaymentMethods() {
  const { isPaymentMethodEnabled } = useSiteConfigContext();

  return React.useMemo(() => ({
    cod: isPaymentMethodEnabled('cod'),
    razorpay: isPaymentMethodEnabled('razorpay'),
    phonepe: isPaymentMethodEnabled('phonepe'),
    payu: isPaymentMethodEnabled('payu'),
    cardPayment: isPaymentMethodEnabled('card_payment'),
    netBanking: isPaymentMethodEnabled('net_banking'),
    walletPayment: isPaymentMethodEnabled('wallet_payment'),
    upiPayment: isPaymentMethodEnabled('upi_payment'),
  }), [isPaymentMethodEnabled]);
}

export function useShippingConfig() {
  const { siteConfig } = useSiteConfigContext();
  return siteConfig?.shipping || null;
}

export function useSocialLinks() {
  const { siteConfig } = useSiteConfigContext();
  return siteConfig?.social || null;
}

export function useHomepageLayout() {
  const { homepageConfig } = useSiteConfigContext();

  return React.useMemo(() => {
    if (!homepageConfig) {
      return {
        heroSections: [],
        featuredSections: [],
        promotionalBanners: [],
        testimonials: [],
        newsletter: {
          enabled: false,
          title: '',
          description: '',
          placeholder: '',
          button_text: '',
          success_message: '',
          background_color: '',
          text_color: '',
        },
      };
    }

    return {
      heroSections: (homepageConfig.hero_sections || []).filter(section => section.enabled),
      featuredSections: (homepageConfig.featured_sections || []).filter(section => section.enabled),
      promotionalBanners: (homepageConfig.promotional_banners || []).filter(banner =>
        banner.enabled
      ),
      testimonials: (homepageConfig.testimonials || []).filter(testimonial =>
        testimonial.enabled && testimonial.featured
      ),
      newsletter: homepageConfig.newsletter || {
        enabled: false,
        title: '',
        description: '',
        placeholder: '',
        button_text: '',
        success_message: '',
        background_color: '',
        text_color: '',
      },
    };
  }, [homepageConfig]);
}

export function useNavigationMenus() {
  const { navigationConfig } = useSiteConfigContext();

  return React.useMemo(() => {
    // Debug logging
    console.log('🔍 Debug navigationConfig:', navigationConfig);

    if (!navigationConfig) {
      console.log('⚠️ Navigation config is null, returning empty structure');
      return {
        header: {
          primary: [],
          secondary: [],
          mobile: [],
        },
        footer: {
          sections: [],
          social: [],
        },
      };
    }

    // Ensure navigationConfig has the expected structure
    const header = navigationConfig.header || { primary: [], secondary: [], mobile: [] };
    const footer = navigationConfig.footer || { sections: [], social: [] };

    console.log('🔍 Debug header:', header);
    console.log('🔍 Debug footer:', footer);

    const result = {
      header: {
        primary: (header.primary || []).filter(item => item.active),
        secondary: (header.secondary || []).filter(item => item.active),
        mobile: (header.mobile || []).filter(item => item.active),
      },
      footer: {
        sections: (footer.sections || []).map(section => ({
          title: section.title,
          links: (section.links || []).filter(link => link.active)
        })),
        social: (footer.social || []).filter(item => item.active),
      },
    };

    console.log('🔍 Debug final navigation result:', result);
    return result;
  }, [navigationConfig]);
}

export function useHeroContent() {
  const { heroConfig } = useSiteConfigContext();
  return heroConfig;
}

export default SiteConfigContext;