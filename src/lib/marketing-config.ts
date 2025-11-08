/**
 * Marketing Configuration Service
 *
 * This service fetches and manages marketing/SEO configuration from the backend
 * to provide dynamic, centralized control over site-wide marketing settings.
 */

export interface AnalyticsConfig {
  google_analytics: {
    enabled: boolean;
    measurement_id?: string;
    debug_mode?: boolean;
    anonymize_ip?: boolean;
    cookie_flags?: string | null;
    custom_dimensions: any[];
    custom_metrics: any[];
  };
  google_tag_manager: {
    enabled: boolean;
    container_id?: string | null;
    auth?: string | null;
    preview?: string | null;
  };
  hotjar: {
    enabled: boolean;
    site_id?: string;
    snippet_version?: number;
  };
  mixpanel: {
    enabled: boolean;
    token?: string | null;
    debug_mode?: boolean;
  };
  clarity: {
    enabled: boolean;
    project_id?: string | null;
  };
}

export interface PixelsConfig {
  meta: {
    enabled: boolean;
    pixel_id?: string;
    advanced_matching?: boolean;
    auto_config?: boolean;
    wait_for_attach?: boolean;
  };
  tiktok: {
    enabled: boolean;
    pixel_id?: string | null;
    test_mode?: boolean;
  };
  pinterest: {
    enabled: boolean;
    tag_id?: string | null;
    enhanced_match?: boolean;
  };
  snapchat: {
    enabled: boolean;
    pixel_id?: string | null;
    test_mode?: boolean;
  };
  linkedin: {
    enabled: boolean;
    partner_id?: string | null;
    conversion_id?: string | null;
  };
}

export interface TrackingConfig {
  events: {
    page_view: boolean;
    product_view: boolean;
    add_to_cart: boolean;
    begin_checkout: boolean;
    purchase: boolean;
    search: boolean;
    share: boolean;
    newsletter_signup: boolean;
    contact_form: boolean;
  };
  event_parameters: {
    currency: string;
    content_type: string;
    event_category: string;
  };
  consent: {
    required: boolean;
    cookie_consent: boolean;
    cookie_duration: number;
    privacy_policy_url?: string | null;
    cookie_policy_url?: string | null;
  };
  debug: {
    debug_mode: boolean;
    console_logging: boolean;
    test_mode: boolean;
  };
}

export interface SEOConfig {
  meta_tags: {
    default_title: string;
    title_separator: string;
    default_description?: string | null;
    default_keywords?: string | null;
    meta_robots: string;
    author: string;
    publisher: string;
  };
  open_graph: {
    type: string;
    site_name: string;
    locale: string;
    image: {
      default?: string | null;
      width: number;
      height: number;
      type: string;
    };
  };
  twitter: {
    card: string;
    site?: string | null;
    creator?: string | null;
    image?: string | null;
  };
  structured_data: {
    organization: any[];
    website: any[];
    product: any[];
  };
}

export interface SocialConfig {
  platforms: {
    facebook: { enabled: boolean; url?: string | null; handle?: string | null };
    twitter: { enabled: boolean; url?: string | null; handle?: string | null };
    instagram: { enabled: boolean; url?: string | null; handle?: string | null };
    youtube: { enabled: boolean; url?: string | null };
    linkedin: { enabled: boolean; url?: string | null; handle?: string | null };
    pinterest: { enabled: boolean; url?: string | null; handle?: string | null };
  };
  sharing: {
    default_template: string;
    utm_tracking: boolean;
    utm_source_mapping: Record<string, string>;
  };
}

export interface MarketingConfig {
  analytics: AnalyticsConfig;
  pixels: PixelsConfig;
  tracking: TrackingConfig;
  seo: SEOConfig;
  social: SocialConfig;
}

class MarketingConfigService {
  private config: MarketingConfig | null = null;
  private lastFetch: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  private fetchPromise: Promise<MarketingConfig> | null = null;

  /**
   * Fetch marketing configuration from backend API
   */
  async fetchConfig(): Promise<MarketingConfig> {
    // Return cached config if still valid
    if (this.config && Date.now() - this.lastFetch < this.cacheDuration) {
      return this.config;
    }

    // Return existing promise if fetch is in progress
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.doFetchConfig();
    return this.fetchPromise;
  }

  private async doFetchConfig(): Promise<MarketingConfig> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/marketing/config`);

      if (!response.ok) {
        throw new Error(`Failed to fetch marketing config: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response format from marketing config API');
      }

      this.config = result.data;
      this.lastFetch = Date.now();
      this.fetchPromise = null;

      return this.config;
    } catch (error) {
      this.fetchPromise = null;
      console.error('Failed to fetch marketing config:', error);

      // Return default config on error
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default marketing configuration for fallback
   */
  private getDefaultConfig(): MarketingConfig {
    return {
      analytics: {
        google_analytics: { enabled: false, measurement_id: '', debug_mode: false, anonymize_ip: true, cookie_flags: null, custom_dimensions: [], custom_metrics: [] },
        google_tag_manager: { enabled: false, container_id: null, auth: null, preview: null },
        hotjar: { enabled: false, site_id: '', snippet_version: 6 },
        mixpanel: { enabled: false, token: null, debug_mode: false },
        clarity: { enabled: false, project_id: null }
      },
      pixels: {
        meta: { enabled: false, pixel_id: '', advanced_matching: false, auto_config: false, wait_for_attach: false },
        tiktok: { enabled: false, pixel_id: null, test_mode: false },
        pinterest: { enabled: false, tag_id: null, enhanced_match: false },
        snapchat: { enabled: false, pixel_id: null, test_mode: false },
        linkedin: { enabled: false, partner_id: null, conversion_id: null }
      },
      tracking: {
        events: {
          page_view: false,
          product_view: false,
          add_to_cart: false,
          begin_checkout: false,
          purchase: false,
          search: false,
          share: false,
          newsletter_signup: false,
          contact_form: false
        },
        event_parameters: {
          currency: 'INR',
          content_type: 'product',
          event_category: 'ecommerce'
        },
        consent: {
          required: false,
          cookie_consent: false,
          cookie_duration: 365,
          privacy_policy_url: null,
          cookie_policy_url: null
        },
        debug: {
          debug_mode: false,
          console_logging: false,
          test_mode: false
        }
      },
      seo: {
        meta_tags: {
          default_title: 'BookBharat - Online Bookstore',
          title_separator: ' | ',
          default_description: null,
          default_keywords: null,
          meta_robots: 'index,follow',
          author: 'BookBharat',
          publisher: 'BookBharat'
        },
        open_graph: {
          type: 'website',
          site_name: 'BookBharat',
          locale: 'en_IN',
          image: {
            default: null,
            width: 1200,
            height: 630,
            type: 'image/jpeg'
          }
        },
        twitter: {
          card: 'summary_large_image',
          site: null,
          creator: null,
          image: null
        },
        structured_data: {
          organization: [],
          website: [],
          product: []
        }
      },
      social: {
        platforms: {
          facebook: { enabled: false, url: null, handle: null },
          twitter: { enabled: false, url: null, handle: null },
          instagram: { enabled: false, url: null, handle: null },
          youtube: { enabled: false, url: null },
          linkedin: { enabled: false, url: null, handle: null },
          pinterest: { enabled: false, url: null, handle: null }
        },
        sharing: {
          default_template: 'Check out {title} at BookBharat - {price}',
          utm_tracking: true,
          utm_source_mapping: {
            facebook: 'facebook_share',
            twitter: 'twitter_share',
            whatsapp: 'whatsapp_share',
            email: 'email_share'
          }
        }
      }
    };
  }

  /**
   * Get specific configuration section
   */
  async getAnalyticsConfig(): Promise<AnalyticsConfig> {
    const config = await this.fetchConfig();
    return config.analytics;
  }

  async getPixelsConfig(): Promise<PixelsConfig> {
    const config = await this.fetchConfig();
    return config.pixels;
  }

  async getTrackingConfig(): Promise<TrackingConfig> {
    const config = await this.fetchConfig();
    return config.tracking;
  }

  async getSEOConfig(): Promise<SEOConfig> {
    const config = await this.fetchConfig();
    return config.seo;
  }

  async getSocialConfig(): Promise<SocialConfig> {
    const config = await this.fetchConfig();
    return config.social;
  }

  /**
   * Get full configuration object
   */
  async getConfig(): Promise<MarketingConfig> {
    return this.fetchConfig();
  }

  /**
   * Check if tracking event is enabled
   */
  async isEventEnabled(event: keyof TrackingConfig['events']): Promise<boolean> {
    const tracking = await this.getTrackingConfig();
    return tracking.events[event];
  }

  /**
   * Generate social sharing URL with UTM parameters
   */
  async generateSharingUrl(url: string, platform: string, title?: string, price?: string): Promise<string> {
    const social = await this.getSocialConfig();

    if (!social.sharing.utm_tracking) {
      return url;
    }

    const utmSource = social.sharing.utm_source_mapping[platform] || `${platform}_share`;
    const utmMedium = 'social';
    const utmCampaign = 'share';

    const separator = url.includes('?') ? '&' : '?';
    const utmParams = `utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;

    return `${url}${separator}${utmParams}`;
  }

  /**
   * Generate sharing text template
   */
  async generateSharingText(title: string, price?: string): Promise<string> {
    const social = await this.getSocialConfig();
    let template = social.sharing.default_template;

    template = template.replace('{title}', title);
    if (price) {
      template = template.replace('{price}', price);
    }

    return template;
  }

  /**
   * Clear cached configuration
   */
  clearCache(): void {
    this.config = null;
    this.lastFetch = 0;
    this.fetchPromise = null;
  }
}

// Export singleton instance
export const marketingConfigService = new MarketingConfigService();

// Export types for use in components
export type { MarketingConfigService };