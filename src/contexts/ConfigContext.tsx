'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { configApi } from '@/lib/api';
import type { ServerThemeConfig } from '@/lib/theme-preloader';

export interface SiteConfig {
  site: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    contact_email: string;
    contact_phone: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  theme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    success_color: string;
    warning_color: string;
    error_color: string;
    font_family: string;
    header_style: string;
    footer_style: string;
    layout: string;
    banner_style: string;
  };
  features: {
    wishlist_enabled: boolean;
    reviews_enabled: boolean;
    chat_support_enabled: boolean;
    notifications_enabled: boolean;
    newsletter_enabled: boolean;
    social_login_enabled: boolean;
    guest_checkout_enabled: boolean;
    multi_currency_enabled: boolean;
    inventory_tracking_enabled: boolean;
    promotional_banners_enabled: boolean;
  };
  payment: {
    methods_enabled: Record<string, boolean>;
    currency: string;
    currency_symbol: string;
    min_order_amount: number;
    free_shipping_threshold: number;
  };
  shipping: {
    zones_enabled: boolean;
    weight_based_shipping: boolean;
    flat_rate_shipping: boolean;
    local_pickup_enabled: boolean;
    express_delivery_enabled: boolean;
    cod_available: boolean;
    insurance_enabled: boolean;
  };
  social: {
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    youtube_url: string;
    linkedin_url: string;
  };
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string[];
    og_image: string;
    twitter_card: string;
  };
}

export interface HomepageConfig {
  hero_section: {
    enabled: boolean;
    title: string;
    subtitle: string;
    background_image: string;
    background_video?: string;
    cta_primary: {
      text: string;
      url: string;
      style: string;
    };
    cta_secondary: {
      text: string;
      url: string;
      style: string;
    };
    stats: Array<{
      label: string;
      value: string;
    }>;
  };
  featured_sections: Array<{
    id: string;
    title: string;
    subtitle: string;
    type: string;
    enabled: boolean;
    settings: Record<string, any>;
  }>;
  promotional_banners: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    enabled: boolean;
  }>;
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
    placeholder: string;
    button_text: string;
    privacy_text: string;
    background_color: string;
  };
}

export interface NavigationConfig {
  header_menu: Array<{
    label: string;
    url: string;
    external: boolean;
    children: Array<{
      label: string;
      url: string;
    }>;
  }>;
  footer_menu: Array<{
    title: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  }>;
}

interface ConfigContextType {
  siteConfig: SiteConfig | null;
  homepageConfig: HomepageConfig | null;
  navigationConfig: NavigationConfig | null;
  loading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  applyTheme: (theme: Partial<SiteConfig['theme']>) => void;
  initialTheme?: ServerThemeConfig | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({
  children,
  initialTheme
}: {
  children: React.ReactNode;
  initialTheme?: ServerThemeConfig | null;
}) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [themeApplied, setThemeApplied] = useState(false);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [siteResponse, homepageResponse, navigationResponse] = await Promise.all([
        configApi.getSiteConfig(),
        configApi.getHomepageConfig(),
        configApi.getNavigationConfig(),
      ]);

      if (siteResponse.success) {
        setSiteConfig(siteResponse.data);

        // Only apply theme if it's different from initial theme or not yet applied
        if (!themeApplied || !initialTheme || JSON.stringify(initialTheme) !== JSON.stringify(siteResponse.data.theme)) {
          applyThemeToCSS(siteResponse.data.theme);
          setThemeApplied(true);
        }
      }

      if (homepageResponse.success) {
        setHomepageConfig(homepageResponse.data);
      }

      if (navigationResponse.success) {
        setNavigationConfig(navigationResponse.data);
      }
    } catch (err) {
      console.error('Failed to load configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const applyThemeToCSS = (theme: SiteConfig['theme']) => {
    // SSR guard - only apply theme on client side
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Convert hex colors to HSL and apply to CSS custom properties
    root.style.setProperty('--primary', hexToHsl(theme.primary_color));
    root.style.setProperty('--secondary', hexToHsl(theme.secondary_color));
    root.style.setProperty('--accent', hexToHsl(theme.accent_color));
    root.style.setProperty('--success', hexToHsl(theme.success_color));
    root.style.setProperty('--warning', hexToHsl(theme.warning_color));
    root.style.setProperty('--destructive', hexToHsl(theme.error_color));

    // Apply font family
    if (theme.font_family) {
      root.style.setProperty('--font-sans', theme.font_family);
    }
  };

  const applyTheme = (theme: Partial<SiteConfig['theme']>) => {
    if (siteConfig) {
      const updatedTheme = { ...siteConfig.theme, ...theme };
      setSiteConfig({ ...siteConfig, theme: updatedTheme });
      applyThemeToCSS(updatedTheme);
    }
  };

  const refreshConfig = async () => {
    await loadConfigurations();
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Apply initial theme if provided and not already applied
  useEffect(() => {
    if (initialTheme && !themeApplied) {
      // Convert ServerThemeConfig to SiteConfig['theme'] format
      const themeForCSS = {
        primary_color: initialTheme.primary_color,
        secondary_color: initialTheme.secondary_color,
        accent_color: initialTheme.accent_color,
        success_color: initialTheme.success_color,
        warning_color: initialTheme.warning_color,
        error_color: initialTheme.error_color,
        font_family: initialTheme.font_family,
        header_style: '',
        footer_style: '',
        layout: '',
        banner_style: ''
      };

      applyThemeToCSS(themeForCSS);
      setThemeApplied(true);
    }
  }, [initialTheme, themeApplied]);

  const value: ConfigContextType = {
    siteConfig,
    homepageConfig,
    navigationConfig,
    loading,
    error,
    refreshConfig,
    applyTheme,
    initialTheme,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  // Convert to percentage and degrees
  const hDeg = Math.round(h * 360);
  const sPerc = Math.round(s * 100);
  const lPerc = Math.round(l * 100);

  return `${hDeg} ${sPerc}% ${lPerc}%`;
}