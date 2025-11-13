'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useState, useCallback } from 'react'
import { marketingConfigService } from '@/services/marketing-config'

interface GoogleAnalyticsProps {
  children: React.ReactNode
}

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
    dataLayer: Record<string, any>[]
  }
}

export default function GoogleAnalytics({ children }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // Load analytics config from backend
    marketingConfigService.getAnalyticsConfig().then(analyticsConfig => {
      setConfig(analyticsConfig.google_analytics)
    })
  }, [])

  useEffect(() => {
    if (!config?.enabled || !config?.measurement_id || !window.gtag) return

    // Track page view
    const url = pathname + (searchParams?.toString() || '')
    window.gtag('config', config.measurement_id, {
      page_path: url,
      debug_mode: config.debug_mode || false,
      send_page_view: true,
      cookie_flags: config.cookie_flags || 'SameSite=Lax;Secure',
      anonymize_ip: config.anonymize_ip !== false,
      allow_google_signals: true,
      allow_ad_personalization_signals: true
    })

    // Track custom dimensions if configured
    if (config.custom_dimensions && config.custom_dimensions.length > 0) {
      const customMap: Record<string, string> = {}
      config.custom_dimensions.forEach((dim: any, index: number) => {
        customMap[`custom_parameter_${index + 1}`] = dim.name || `custom_dimension_${index + 1}`
      })

      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title,
        page_path: url,
        custom_map: customMap
      })
    } else {
      // Default page view tracking
      window.gtag('event', 'page_view', {
        page_location: window.location.href,
        page_title: document.title,
        page_path: url
      })
    }
  }, [pathname, searchParams, config])

  // Initialize gtag
  useEffect(() => {
    if (!config?.measurement_id) return

    window.dataLayer = window.dataLayer || []
    window.gtag = window.dataLayer.push.bind(window.dataLayer)
  }, [config?.measurement_id])

  if (!config?.enabled || !config?.measurement_id) {
    return <>{children}</>
  }

  return (
    <>
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${config.measurement_id}`}
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${config.measurement_id}', {
              debug_mode: ${config.debug_mode || false},
              send_page_view: false,
              anonymize_ip: ${config.anonymize_ip !== false},
              cookie_flags: '${config.cookie_flags || 'SameSite=Lax;Secure'}'
            });
          `
        }}
      />
      {children}
    </>
  )
}

// Hook for GA4 E-commerce events
export function useGA4Ecommerce() {
  const [config, setConfig] = useState<any>(null)
  const [trackingConfig, setTrackingConfig] = useState<any>(null)

  useEffect(() => {
    marketingConfigService.getAnalyticsConfig().then(analyticsConfig => {
      setConfig(analyticsConfig.google_analytics)
    })
    marketingConfigService.getTrackingConfig().then(tracking => {
      setTrackingConfig(tracking)
    })
  }, [])

  const trackViewItem = async (item: {
    item_id: string
    item_name: string
    category?: string
    brand?: string
    price?: number
    currency?: string
  }) => {
    if (!config?.enabled || !window.gtag) return

    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.product_view) return

    window.gtag('event', 'view_item', {
      currency: item.currency || cfg.event_parameters.currency || 'INR',
      value: item.price || 0,
      items: [{
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        item_brand: item.brand || 'BookBharat',
        price: item.price
      }]
    })
  }

  const trackAddToCart = async (items: Array<{
    item_id: string
    item_name: string
    category?: string
    quantity: number
    price: number
  }>) => {
    if (!config?.enabled || !window.gtag) return

    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.add_to_cart) return

    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    window.gtag('event', 'add_to_cart', {
      currency: cfg.event_parameters.currency || 'INR',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    })
  }

  const trackBeginCheckout = async (items: Array<{
    item_id: string
    item_name: string
    category?: string
    quantity: number
    price: number
  }>) => {
    if (!config?.enabled || !window.gtag) return

    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.begin_checkout) return

    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    window.gtag('event', 'begin_checkout', {
      currency: cfg.event_parameters.currency || 'INR',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    })
  }

  const trackPurchase = async (transaction: {
    transaction_id: string
    value: number
    items: Array<{
      item_id: string
      item_name: string
      category?: string
      quantity: number
      price: number
    }>
  }) => {
    if (!config?.enabled || !window.gtag) return

    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.purchase) return

    window.gtag('event', 'purchase', {
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      currency: cfg.event_parameters.currency || 'INR',
      items: transaction.items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price
      }))
    })
  }

  const trackSearch = async (search_term: string) => {
    if (!config?.enabled || !window.gtag) return

    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.search) return

    window.gtag('event', 'search', {
      search_term
    })
  }

  const trackLead = async (lead: {
    lead_type: string
    value?: number
    currency?: string
  }) => {
    if (!config?.enabled || !window.gtag) return

    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()

    window.gtag('event', 'generate_lead', {
      lead_type: lead.lead_type,
      value: lead.value || 0,
      currency: lead.currency || cfg.event_parameters.currency || 'INR'
    })
  }

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackLead
  }
}

// Hook for custom events
export function useGA4Events() {
  const [config, setConfig] = useState<any>(null)
  const [trackingConfig, setTrackingConfig] = useState<any>(null)

  useEffect(() => {
    marketingConfigService.getAnalyticsConfig().then(analyticsConfig => {
      setConfig(analyticsConfig.google_analytics)
    })
    marketingConfigService.getTrackingConfig().then(tracking => {
      setTrackingConfig(tracking)
    })
  }, [])

  const trackEvent = useCallback(
    (eventName: string, parameters?: Record<string, any>) => {
      if (typeof window === 'undefined') return;
      if (!config?.measurement_id && !trackingConfig?.measurement_id) return;

      try {
        window.gtag?.('event', eventName, parameters);
      } catch (error) {
        console.error('GA4 track event failed:', error);
      }
    },
    [config?.measurement_id, trackingConfig?.measurement_id]
  )

  const trackSignUp = async (method: string) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (cfg.events.newsletter_signup) {
      trackEvent('sign_up', { method })
    }
  }

  const trackLogin = async (method: string) => {
    trackEvent('login', { method })
  }

  const trackShare = async (method: string, content_type: string, item_id?: string) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (cfg.events.share) {
      trackEvent('share', {
        method,
        content_type,
        item_id
      })
    }
  }

  const trackContactForm = async () => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (cfg.events.contact_form) {
      trackEvent('contact_form_submit', {
        event_category: cfg.event_parameters.event_category || 'engagement'
      })
    }
  }

  const trackVideoPlay = (video_title: string, video_duration?: number) => {
    trackEvent('video_start', {
      video_title,
      video_duration
    })
  }

  const trackVideoComplete = (video_title: string, video_duration?: number) => {
    trackEvent('video_complete', {
      video_title,
      video_duration
    })
  }

  const trackDownload = (file_name: string, file_url: string, file_extension: string) => {
    trackEvent('file_download', {
      file_name,
      file_url,
      file_extension
    })
  }

  return {
    trackEvent,
    trackSignUp,
    trackLogin,
    trackShare,
    trackContactForm,
    trackVideoPlay,
    trackVideoComplete,
    trackDownload
  }
}