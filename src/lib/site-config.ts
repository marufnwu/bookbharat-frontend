/**
 * Comprehensive Site Configuration Service
 *
 * This service manages all site-wide configurations from the backend,
 * providing a unified interface for dynamic site management.
 */

import { marketingConfigService } from './marketing-config';

// Site configuration interfaces
interface SiteTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  font_sizes: {
    base: string;
    heading: string;
    subheading: string;
  };
  border_radius: string;
  shadows: boolean;
}

interface SiteFeatures {
  wishlist_enabled: boolean;
  guest_checkout_enabled: boolean;
  reviews_enabled: boolean;
  product_comparison_enabled: boolean;
  recently_viewed_enabled: boolean;
  abandoned_cart_enabled: boolean;
  one_click_checkout: boolean;
  social_login_enabled: boolean;
}

interface SitePayment {
  methods_enabled: {
    cod: boolean;
    razorpay: boolean;
    phonepe: boolean;
    payu: boolean;
    card_payment: boolean;
    net_banking: boolean;
    wallet_payment: boolean;
    upi_payment: boolean;
  };
  currency: string;
  transaction_fee: number;
  installment_enabled: boolean;
  international_payment_enabled: boolean;
}

interface SiteShipping {
  zones_enabled: boolean;
  weight_based_shipping: boolean;
  price_based_shipping: boolean;
  free_shipping_enabled: boolean;
  free_shipping_min_amount: number;
  delivery_time_guaranteed: boolean;
  international_shipping_enabled: boolean;
  cash_on_delivery_fee: number;
}

interface SiteSocial {
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  pinterest_url: string;
  whatsapp_enabled: boolean;
}

interface SiteSEO {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  google_analytics_enabled: boolean;
  facebook_pixel_enabled: boolean;
  google_tag_manager_enabled: boolean;
  schema_markup_enabled: boolean;
  sitemap_enabled: boolean;
  robots_txt_enabled: boolean;
}

interface SiteConfig {
  site: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
  theme: SiteTheme;
  features: SiteFeatures;
  payment: SitePayment;
  shipping: SiteShipping;
  social: SiteSocial;
  seo: SiteSEO;
}

// Homepage configuration interfaces
interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  button_text: string;
  button_url: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  background_color?: string;
  text_color?: string;
  position: number;
  active: boolean;
}

interface FeaturedSection {
  id: string;
  type: 'books' | 'categories' | 'authors' | 'publishers';
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel' | 'list';
  limit: number;
  auto_refresh: boolean;
  refresh_interval: number;
  background_color?: string;
  position: number;
  active: boolean;
}

interface PromotionalBanner {
  id: string;
  title: string;
  content: string;
  image?: string;
  button_text?: string;
  button_url?: string;
  background_color: string;
  text_color: string;
  position: 'top' | 'middle' | 'bottom';
  start_date: string;
  end_date: string;
  active: boolean;
}

interface Testimonial {
  id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  content: string;
  customer_image?: string;
  verified_purchase: boolean;
  date: string;
  featured: boolean;
  active: boolean;
}

interface HomepageConfig {
  hero_sections: HeroSection[];
  featured_sections: FeaturedSection[];
  promotional_banners: PromotionalBanner[];
  testimonials: Testimonial[];
  newsletter: {
    enabled: boolean;
    title: string;
    description: string;
    placeholder: string;
    button_text: string;
    success_message: string;
    background_color: string;
    text_color: string;
  };
}

// Navigation configuration interfaces
interface NavigationItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  target: '_self' | '_blank';
  position: number;
  children?: NavigationItem[];
  active: boolean;
}

interface FooterSection {
  title: string;
  links: NavigationItem[];
}

interface NavigationConfig {
  header: {
    primary: NavigationItem[];
    secondary: NavigationItem[];
    mobile: NavigationItem[];
  };
  footer: {
    sections: FooterSection[];
    social: NavigationItem[];
  };
}

// Hero configuration interface (for dynamic hero content)
interface HeroConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  button_text: string;
  button_url: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  video_url?: string;
  background_color?: string;
  overlay_opacity?: number;
  trust_badges: {
    enabled: boolean;
    badges: Array<{
      icon: string;
      text: string;
    }>;
  };
  countdown_timer?: {
    enabled: boolean;
    end_time: string;
    text: string;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Main site configuration service
class SiteConfigService {
  private siteConfigCache: SiteConfig | null = null;
  private homepageConfigCache: HomepageConfig | null = null;
  private navigationConfigCache: NavigationConfig | null = null;
  private heroConfigCache: HeroConfig | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
  }

  private async fetchFromApi<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.getApiUrl()}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        console.warn(`Failed to fetch ${endpoint}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  async getSiteConfig(): Promise<SiteConfig> {
    if (this.siteConfigCache && this.isCacheValid()) {
      return this.siteConfigCache;
    }

    const config = await this.fetchFromApi<SiteConfig>('/config/site');
    if (config) {
      this.siteConfigCache = config;
      this.lastFetchTime = Date.now();
    }

    return config || this.getSiteConfigDefaults();
  }

  async getHomepageConfig(): Promise<HomepageConfig> {
    if (this.homepageConfigCache && this.isCacheValid()) {
      return this.homepageConfigCache;
    }

    const config = await this.fetchFromApi<HomepageConfig>('/config/homepage');
    if (config) {
      this.homepageConfigCache = config;
      this.lastFetchTime = Date.now();
    }

    return config || this.getHomepageConfigDefaults();
  }

  async getNavigationConfig(): Promise<NavigationConfig> {
    console.log('🔧 Fetching navigation config...');
    // Temporarily disable cache for debugging
    // if (this.navigationConfigCache && this.isCacheValid()) {
    //   console.log('🔧 Returning cached navigation config');
    //   return this.navigationConfigCache;
    // }

    const apiResponse = await this.fetchFromApi<any>('/config/navigation');
    console.log('🔧 Raw API response:', apiResponse);

    if (apiResponse) {
      // Transform backend API structure to frontend expected structure
      const transformedConfig: NavigationConfig = {
        header: {
          primary: apiResponse.header_menu?.map((item: any) => ({
            id: item.label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(),
            label: item.label || '',
            url: item.url || '',
            target: item.external ? '_blank' : '_self',
            position: 0,
            active: true,
            children: item.children?.map((child: any) => ({
              id: child.label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(),
              label: child.label || '',
              url: child.url || '',
              target: '_self',
              position: 0,
              active: true
            })) || []
          })) || [],
          secondary: [],
          mobile: apiResponse.header_menu?.map((item: any) => ({
            id: item.label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(),
            label: item.label || '',
            url: item.url || '',
            target: item.external ? '_blank' : '_self',
            position: 0,
            active: true,
            children: []
          })) || []
        },
        footer: {
          sections: apiResponse.footer_menu?.map((section: any) => ({
            title: section.title,
            links: section.links?.map((link: any) => ({
              id: link.label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(),
              label: link.label || '',
              url: link.url || '',
              target: link.external ? '_blank' : '_self',
              position: 0,
              active: true,
              children: []
            })) || []
          })) || [],
          social: []
        }
      };

      console.log('🔧 Transformed navigation config:', transformedConfig);
      this.navigationConfigCache = transformedConfig;
      this.lastFetchTime = Date.now();
    }

    return this.navigationConfigCache || this.getNavigationConfigDefaults();
  }

  async getHeroConfig(): Promise<HeroConfig | null> {
    if (this.heroConfigCache && this.isCacheValid()) {
      return this.heroConfigCache;
    }

    const config = await this.fetchFromApi<HeroConfig>('/hero/active');
    if (config) {
      this.heroConfigCache = config;
      this.lastFetchTime = Date.now();
    }

    return config;
  }

  // Server-side configuration fetching for SSR
  static async getServerSideConfig<T>(endpoint: string): Promise<T | null> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch server-side ${endpoint}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error(`Error fetching server-side ${endpoint}:`, error);
      return null;
    }
  }

  // Theme utilities
  generateCSSVariables(theme: SiteTheme): Record<string, string> {
    return {
      '--color-primary': theme.primary_color,
      '--color-secondary': theme.secondary_color,
      '--color-accent': theme.accent_color,
      '--font-family': theme.font_family,
      '--font-size-base': theme.font_sizes.base,
      '--font-size-heading': theme.font_sizes.heading,
      '--font-size-subheading': theme.font_sizes.subheading,
      '--border-radius': theme.border_radius,
    };
  }

  // Feature flag checks
  isFeatureEnabled(feature: keyof SiteFeatures): boolean {
    if (!this.siteConfigCache) return false;
    return this.siteConfigCache.features[feature];
  }

  // Payment method checks
  isPaymentMethodEnabled(method: keyof SitePayment['methods_enabled']): boolean {
    if (!this.siteConfigCache) return false;
    return this.siteConfigCache.payment.methods_enabled[method];
  }

  // Clear all caches (useful for development or config updates)
  clearCache(): void {
    this.siteConfigCache = null;
    this.homepageConfigCache = null;
    this.navigationConfigCache = null;
    this.heroConfigCache = null;
    this.lastFetchTime = 0;
    marketingConfigService.clearCache();
  }

  // Default configurations
  private getSiteConfigDefaults(): SiteConfig {
    return {
      site: {
        name: 'BookBharat',
        description: 'Your Knowledge Partner',
        logo: '/images/logo.png',
        favicon: '/favicon.ico',
        email: 'support@bookbharat.com',
        phone: '+91-XXXXXXXXXX',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR',
        dateFormat: 'd/m/Y',
        timeFormat: '12h',
      },
      theme: {
        primary_color: '#ae331e',
        secondary_color: '#f59e0b',
        accent_color: '#10b981',
        font_family: 'Inter, sans-serif',
        font_sizes: {
          base: '16px',
          heading: '24px',
          subheading: '18px',
        },
        border_radius: '8px',
        shadows: true,
      },
      features: {
        wishlist_enabled: false,
        guest_checkout_enabled: true,
        reviews_enabled: false,
        product_comparison_enabled: false,
        recently_viewed_enabled: true,
        abandoned_cart_enabled: false,
        one_click_checkout: false,
        social_login_enabled: false,
      },
      payment: {
        methods_enabled: {
          cod: true,
          razorpay: true,
          phonepe: false,
          payu: false,
          card_payment: true,
          net_banking: true,
          wallet_payment: false,
          upi_payment: true,
        },
        currency: 'INR',
        transaction_fee: 0,
        installment_enabled: false,
        international_payment_enabled: false,
      },
      shipping: {
        zones_enabled: true,
        weight_based_shipping: true,
        price_based_shipping: false,
        free_shipping_enabled: true,
        free_shipping_min_amount: 500,
        delivery_time_guaranteed: false,
        international_shipping_enabled: false,
        cash_on_delivery_fee: 0,
      },
      social: {
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        linkedin_url: '',
        youtube_url: '',
        pinterest_url: '',
        whatsapp_enabled: false,
      },
      seo: {
        meta_title: 'BookBharat - Your Knowledge Partner',
        meta_description: 'Discover millions of books online at BookBharat',
        meta_keywords: 'books, online bookstore, india',
        google_analytics_enabled: false,
        facebook_pixel_enabled: false,
        google_tag_manager_enabled: false,
        schema_markup_enabled: true,
        sitemap_enabled: true,
        robots_txt_enabled: true,
      },
    };
  }

  private getHomepageConfigDefaults(): HomepageConfig {
    return {
      hero_sections: [],
      featured_sections: [],
      promotional_banners: [],
      testimonials: [],
      newsletter: {
        enabled: true,
        title: 'Stay Updated',
        description: 'Get the latest updates on new releases and exclusive offers.',
        placeholder: 'Enter your email address',
        button_text: 'Subscribe',
        success_message: 'Thank you for subscribing!',
        background_color: '#f3f4f6',
        text_color: '#111827',
      },
    };
  }

  private getNavigationConfigDefaults(): NavigationConfig {
    return {
      header: {
        primary: [],
        secondary: [],
        mobile: [],
      },
      footer: {
        primary: [],
        secondary: [],
        legal: [],
        social: [],
      },
    };
  }
}

// Export singleton instance and class
export const siteConfigService = new SiteConfigService();
export { SiteConfigService };
export type {
  SiteConfig,
  SiteTheme,
  SiteFeatures,
  SitePayment,
  SiteShipping,
  SiteSocial,
  SiteSEO,
  HomepageConfig,
  HeroSection,
  FeaturedSection,
  PromotionalBanner,
  Testimonial,
  NavigationConfig,
  NavigationItem,
  HeroConfig,
};