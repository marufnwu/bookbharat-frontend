import { apiClient } from './api';

export interface MarketingConfig {
  analytics: {
    google_analytics: {
      enabled: boolean;
      measurement_id?: string;
      debug_mode?: boolean;
      anonymize_ip?: boolean;
      cookie_flags?: string;
      custom_dimensions?: any[];
      custom_metrics?: any[];
    };
    google_tag_manager: {
      enabled: boolean;
      container_id?: string;
      auth?: string;
      preview?: string;
    };
    hotjar: {
      enabled: boolean;
      site_id?: string;
      snippet_version?: number;
    };
    mixpanel: {
      enabled: boolean;
      token?: string;
      debug_mode?: boolean;
    };
    clarity: {
      enabled: boolean;
      project_id?: string;
    };
  };
  pixels: {
    meta: {
      enabled: boolean;
      pixel_id?: string;
      advanced_matching?: boolean;
      auto_config?: boolean;
      wait_for_attach?: boolean;
    };
    tiktok: {
      enabled: boolean;
      pixel_id?: string;
      test_mode?: boolean;
    };
    pinterest: {
      enabled: boolean;
      tag_id?: string;
      enhanced_match?: boolean;
    };
    snapchat: {
      enabled: boolean;
      pixel_id?: string;
      test_mode?: boolean;
    };
    linkedin: {
      enabled: boolean;
      partner_id?: string;
      conversion_id?: string;
    };
  };
  tracking: {
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
      privacy_policy_url?: string;
      cookie_policy_url?: string;
    };
    debug: {
      debug_mode: boolean;
      console_logging: boolean;
      test_mode: boolean;
    };
  };
  seo: {
    meta_tags: {
      default_title: string;
      title_separator: string;
      default_description?: string;
      default_keywords?: string;
      meta_robots: string;
      author: string;
      publisher: string;
    };
    open_graph: {
      type: string;
      site_name: string;
      locale: string;
      image: {
        default?: string;
        width: number;
        height: number;
        type: string;
      };
    };
    twitter: {
      card: string;
      site?: string;
      creator?: string;
      image?: string;
    };
    structured_data: {
      organization: any[];
      website: any[];
      product: any[];
    };
  };
  social: {
    platforms: {
      facebook: {
        enabled: boolean;
        url?: string;
        handle?: string;
      };
      twitter: {
        enabled: boolean;
        url?: string;
        handle?: string;
      };
      instagram: {
        enabled: boolean;
        url?: string;
        handle?: string;
      };
      youtube: {
        enabled: boolean;
        url?: string;
      };
      linkedin: {
        enabled: boolean;
        url?: string;
      };
      pinterest: {
        enabled: boolean;
        url?: string;
      };
    };
    sharing: {
      default_template: string;
      utm_tracking: boolean;
      utm_source_mapping: Record<string, string>;
    };
  };
}

class MarketingConfigService {
  private config: MarketingConfig | null = null;
  private promise: Promise<MarketingConfig> | null = null;

  async getConfig(): Promise<MarketingConfig> {
    // Return cached config if available
    if (this.config) {
      return this.config;
    }

    // Return existing promise if request is in progress
    if (this.promise) {
      return this.promise;
    }

    // Fetch config from API
    this.promise = this.fetchConfig();

    try {
      this.config = await this.promise;
      return this.config;
    } finally {
      this.promise = null;
    }
  }

  private async fetchConfig(): Promise<MarketingConfig> {
    try {
      const response = await apiClient.get('/marketing/config');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch marketing config:', error);
      // Return default config on error
      return this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): MarketingConfig {
    return {
      analytics: {
        google_analytics: {
          enabled: false,
          measurement_id: '',
          debug_mode: false,
          anonymize_ip: true,
          cookie_flags: '',
          custom_dimensions: [],
          custom_metrics: []
        },
        google_tag_manager: {
          enabled: false,
          container_id: '',
          auth: '',
          preview: ''
        },
        hotjar: {
          enabled: false,
          site_id: '',
          snippet_version: 6
        },
        mixpanel: {
          enabled: false,
          token: '',
          debug_mode: false
        },
        clarity: {
          enabled: false,
          project_id: ''
        }
      },
      pixels: {
        meta: {
          enabled: false,
          pixel_id: '',
          advanced_matching: false,
          auto_config: true,
          wait_for_attach: false
        },
        tiktok: {
          enabled: false,
          pixel_id: '',
          test_mode: false
        },
        pinterest: {
          enabled: false,
          tag_id: '',
          enhanced_match: false
        },
        snapchat: {
          enabled: false,
          pixel_id: '',
          test_mode: false
        },
        linkedin: {
          enabled: false,
          partner_id: '',
          conversion_id: ''
        }
      },
      tracking: {
        events: {
          page_view: true,
          product_view: true,
          add_to_cart: true,
          begin_checkout: true,
          purchase: true,
          search: true,
          share: true,
          newsletter_signup: true,
          contact_form: true
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
          privacy_policy_url: '',
          cookie_policy_url: ''
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
          default_description: '',
          default_keywords: '',
          meta_robots: 'index,follow',
          author: 'BookBharat',
          publisher: 'BookBharat'
        },
        open_graph: {
          type: 'website',
          site_name: 'BookBharat',
          locale: 'en_IN',
          image: {
            default: '',
            width: 1200,
            height: 630,
            type: 'image/jpeg'
          }
        },
        twitter: {
          card: 'summary_large_image',
          site: '',
          creator: '',
          image: ''
        },
        structured_data: {
          organization: [],
          website: [],
          product: []
        }
      },
      social: {
        platforms: {
          facebook: {
            enabled: false,
            url: '',
            handle: ''
          },
          twitter: {
            enabled: false,
            url: '',
            handle: ''
          },
          instagram: {
            enabled: false,
            url: '',
            handle: ''
          },
          youtube: {
            enabled: false,
            url: ''
          },
          linkedin: {
            enabled: false,
            url: ''
          },
          pinterest: {
            enabled: false,
            url: ''
          }
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

  // Get specific config sections
  async getAnalyticsConfig() {
    const config = await this.getConfig();
    return config.analytics;
  }

  async getPixelsConfig() {
    const config = await this.getConfig();
    return config.pixels;
  }

  async getTrackingConfig() {
    const config = await this.getConfig();
    return config.tracking;
  }

  async getSeoConfig() {
    const config = await this.getConfig();
    return config.seo;
  }

  async getSocialConfig() {
    const config = await this.getConfig();
    return config.social;
  }

  // Clear cache (useful for testing or when config updates)
  clearCache() {
    this.config = null;
    this.promise = null;
  }
}

// Export singleton instance
export const marketingConfigService = new MarketingConfigService();