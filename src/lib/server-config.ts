/**
 * Server-side Configuration Utilities for Next.js
 *
 * These utilities help fetch configurations server-side for better performance
 * and SEO optimization in Next.js App Router.
 */

import { siteConfigService, SiteConfigService, type SiteConfig, type HomepageConfig, type NavigationConfig, type HeroConfig } from './site-config';

// Server-side configuration fetching with caching
export async function getServerSideSiteConfig(): Promise<SiteConfig> {
  try {
    const config = await SiteConfigService.getServerSideConfig<SiteConfig>('/config/site');
    return config || siteConfigService['getSiteConfigDefaults']();
  } catch (error) {
    console.error('Error fetching server-side site config:', error);
    return siteConfigService['getSiteConfigDefaults']();
  }
}

export async function getServerSideHomepageConfig(): Promise<HomepageConfig> {
  try {
    const config = await SiteConfigService.getServerSideConfig<HomepageConfig>('/config/homepage');
    return config || siteConfigService['getHomepageConfigDefaults']();
  } catch (error) {
    console.error('Error fetching server-side homepage config:', error);
    return siteConfigService['getHomepageConfigDefaults']();
  }
}

export async function getServerSideNavigationConfig(): Promise<NavigationConfig> {
  try {
    const config = await SiteConfigService.getServerSideConfig<NavigationConfig>('/config/navigation');
    return config || siteConfigService['getNavigationConfigDefaults']();
  } catch (error) {
    console.error('Error fetching server-side navigation config:', error);
    return siteConfigService['getNavigationConfigDefaults']();
  }
}

export async function getServerSideHeroConfig(): Promise<HeroConfig | null> {
  try {
    const config = await SiteConfigService.getServerSideConfig<HeroConfig>('/hero/active');
    return config;
  } catch (error) {
    console.error('Error fetching server-side hero config:', error);
    return null;
  }
}

// Combined configuration fetcher
export async function getServerSideAllConfigs() {
  const [siteConfig, homepageConfig, navigationConfig, heroConfig] = await Promise.all([
    getServerSideSiteConfig(),
    getServerSideHomepageConfig(),
    getServerSideNavigationConfig(),
    getServerSideHeroConfig(),
  ]);

  return {
    siteConfig,
    homepageConfig,
    navigationConfig,
    heroConfig,
  };
}

// Theme generation utilities for server-side
export function generateServerSideThemeCSS(theme: SiteConfig['theme']): string {
  const variables = siteConfigService.generateCSSVariables(theme);

  return Object.entries(variables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
}

export function generateServerSideThemeInlineStyles(theme: SiteConfig['theme']) {
  return siteConfigService.generateCSSVariables(theme);
}

// SEO utilities using backend configuration
export function generateServerSideMetadata(siteConfig: SiteConfig) {
  const { site, seo } = siteConfig;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      template: `%s${siteConfig.meta_tags?.title_separator || ' | '}${siteConfig.meta_tags?.default_title || site.name}`,
      default: seo.meta_title || site.name,
    },
    description: seo.meta_description || site.description,
    keywords: seo.meta_keywords ? seo.meta_keywords.split(',').map(k => k.trim()) : [],
    authors: [{ name: 'BookBharat Team' }],
    creator: 'BookBharat',
    publisher: 'BookBharat',
    robots: {
      index: seo.robots_txt_enabled,
      follow: seo.robots_txt_enabled,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      title: site.name,
      description: site.description,
      siteName: site.name,
      images: [
        {
          url: site.logo,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: site.description,
      creator: '@bookbharat',
      images: [site.logo],
    },
    alternates: {
      canonical: '/',
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      bing: process.env.BING_VERIFICATION,
    },
  };
}

// Configuration validation utilities
export function validateSiteConfig(config: any): config is SiteConfig {
  return (
    config &&
    typeof config === 'object' &&
    config.site &&
    config.theme &&
    config.features &&
    config.payment &&
    config.shipping &&
    config.social &&
    config.seo
  );
}

export function validateHomepageConfig(config: any): config is HomepageConfig {
  return (
    config &&
    typeof config === 'object' &&
    Array.isArray(config.hero_sections) &&
    Array.isArray(config.featured_sections) &&
    Array.isArray(config.promotional_banners) &&
    Array.isArray(config.testimonials) &&
    config.newsletter
  );
}

export function validateNavigationConfig(config: any): config is NavigationConfig {
  return (
    config &&
    typeof config === 'object' &&
    config.header &&
    config.footer &&
    Array.isArray(config.header.primary) &&
    Array.isArray(config.header.secondary) &&
    Array.isArray(config.footer.primary) &&
    Array.isArray(config.footer.secondary)
  );
}

// Configuration transformation utilities
export function transformNavigationForRendering(navigation: NavigationConfig) {
  return {
    header: {
      primary: navigation.header.primary.filter(item => item.active),
      secondary: navigation.header.secondary.filter(item => item.active),
      mobile: navigation.header.mobile.filter(item => item.active),
    },
    footer: {
      primary: navigation.footer.primary.filter(item => item.active),
      secondary: navigation.footer.secondary.filter(item => item.active),
      legal: navigation.footer.legal.filter(item => item.active),
      social: navigation.footer.social.filter(item => item.active),
    },
  };
}

export function transformHomepageForRendering(homepage: HomepageConfig) {
  const now = new Date();

  return {
    heroSections: homepage.hero_sections
      .filter(section => section.active)
      .sort((a, b) => a.position - b.position),
    featuredSections: homepage.featured_sections
      .filter(section => section.active)
      .sort((a, b) => a.position - b.position),
    promotionalBanners: homepage.promotional_banners
      .filter(banner =>
        banner.active &&
        new Date(banner.start_date) <= now &&
        new Date(banner.end_date) > now
      )
      .sort((a, b) => a.position.localeCompare(b.position)),
    testimonials: homepage.testimonials
      .filter(testimonial => testimonial.active && testimonial.featured)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    newsletter: homepage.newsletter,
  };
}

// Error handling utilities
export function handleConfigError(error: any, context: string): never {
  console.error(`Configuration error in ${context}:`, error);

  // In production, you might want to throw a more user-friendly error
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Configuration loading failed: ${context}`);
  }

  // In development, throw the original error for debugging
  throw error;
}

// Configuration caching utilities
export class ServerConfigCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static clear(): void {
    this.cache.clear();
  }

  static has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Configuration revalidation utilities
export async function revalidateConfig(endpoint: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    // This would trigger revalidation of the specific endpoint
    // Implementation depends on your caching strategy
    await fetch(`${apiUrl}${endpoint}/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Failed to revalidate ${endpoint}:`, error);
  }
}

// Export all utilities
export {
  siteConfigService,
  type SiteConfig,
  type HomepageConfig,
  type NavigationConfig,
  type HeroConfig,
};