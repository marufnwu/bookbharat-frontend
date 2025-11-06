'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { marketingConfigService } from '@/services/marketing-config'

interface MetaPixelProps {
  children: React.ReactNode
}

interface MetaPixelEvent {
  event: string
  eventID?: string
  parameters?: Record<string, any>
}

declare global {
  interface Window {
    fbq: (command: string, eventName?: string, parameters?: Record<string, any>) => void
    _fbq: Window['fbq']
  }
}

export default function MetaPixel({ children }: MetaPixelProps) {
  const pixelInitialized = useRef(false)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // Load pixels config from backend
    marketingConfigService.getPixelsConfig().then(pixelsConfig => {
      setConfig(pixelsConfig.meta)
    })
  }, [])

  useEffect(() => {
    if (!config?.enabled || !config?.pixel_id || pixelInitialized.current) return

    // Initialize Facebook Pixel
    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments)
    }

    if (!window._fbq) window._fbq = window.fbq
    window.fbq.push = window.fbq
    window.fbq.loaded = true
    window.fbq.version = '2.0'
    window.fbq.queue = []

    // Initialize Pixel with advanced matching if enabled
    const initParams: any = {}
    if (config.advanced_matching) {
      // These will be populated when user is logged in
      initParams.em = undefined
      initParams.fn = undefined
      initParams.ln = undefined
      initParams.ph = undefined
      initParams.external_id = undefined
    }

    window.fbq('init', config.pixel_id, initParams)

    // Track PageView
    window.fbq('track', 'PageView', {}, { eventID: `pageview_${Date.now()}` })

    pixelInitialized.current = true

    // Enable additional features based on config
    if (config.auto_config) {
      window.fbq('set', 'autoConfig', true, config.pixel_id)
    }

    if (config.wait_for_attach) {
      window.fbq('set', 'waitForAttach', true, config.pixel_id)
    }
  }, [config])

  // Track PageView on route changes
  useEffect(() => {
    if (!config?.enabled || !config?.pixel_id || !window.fbq || !pixelInitialized.current) return

    const handleRouteChange = () => {
      window.fbq('track', 'PageView', {}, { eventID: `pageview_${Date.now()}` })
    }

    // Track on mount
    handleRouteChange()
  }, [config])

  if (!config?.enabled || !config?.pixel_id) {
    return <>{children}</>
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${config.pixel_id}');
            fbq('track', 'PageView');
          `
        }}
      />
      {children}
    </>
  )
}

// Hook for Meta Pixel events
export function useMetaPixel() {
  const [config, setConfig] = useState<any>(null)
  const [trackingConfig, setTrackingConfig] = useState<any>(null)

  useEffect(() => {
    marketingConfigService.getPixelsConfig().then(pixelsConfig => {
      setConfig(pixelsConfig.meta)
    })
    marketingConfigService.getTrackingConfig().then(tracking => {
      setTrackingConfig(tracking)
    })
  }, [])

  const trackEvent = (eventName: string, parameters?: Record<string, any>, eventId?: string) => {
    if (!window.fbq || !config?.enabled) return

    if (config.test_mode || trackingConfig?.debug?.console_logging) {
      console.log('Meta Pixel Event:', eventName, parameters)
    }

    window.fbq('track', eventName, parameters, { eventID: eventId || `${eventName}_${Date.now()}` })
  }

  const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (!window.fbq || !config?.enabled) return

    if (config.test_mode || trackingConfig?.debug?.console_logging) {
      console.log('Meta Pixel Custom Event:', eventName, parameters)
    }

    window.fbq('trackCustom', eventName, parameters)
  }

  const trackViewContent = async (data: {
    content_ids: string[]
    content_type: string
    content_name?: string
    content_category?: string
    value?: number
    currency?: string
  }) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.product_view) return

    trackEvent('ViewContent', {
      content_ids: data.content_ids,
      content_type: data.content_type || cfg.event_parameters.content_type || 'product',
      content_name: data.content_name,
      content_category: data.content_category,
      value: data.value,
      currency: data.currency || cfg.event_parameters.currency || 'INR'
    }, `viewcontent_${data.content_ids[0]}_${Date.now()}`)
  }

  const trackSearch = async (search_string: string, content_ids?: string[]) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.search) return

    trackEvent('Search', {
      search_string,
      content_ids: content_ids || []
    }, `search_${Date.now()}`)
  }

  const trackAddToCart = async (data: {
    content_ids: string[]
    content_type: string
    content_name?: string
    content_category?: string
    value: number
    currency?: string
  }) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.add_to_cart) return

    trackEvent('AddToCart', {
      content_ids: data.content_ids,
      content_type: data.content_type || cfg.event_parameters.content_type || 'product',
      content_name: data.content_name,
      content_category: data.content_category,
      value: data.value,
      currency: data.currency || cfg.event_parameters.currency || 'INR'
    }, `addtocart_${data.content_ids[0]}_${Date.now()}`)
  }

  const trackAddToWishlist = async (data: {
    content_ids: string[]
    content_type: string
    content_name?: string
    content_category?: string
    value?: number
    currency?: string
  }) => {
    trackEvent('AddToWishlist', {
      content_ids: data.content_ids,
      content_type: data.content_type || 'product',
      content_name: data.content_name,
      content_category: data.content_category,
      value: data.value,
      currency: data.currency || 'INR'
    }, `addtowishlist_${data.content_ids[0]}_${Date.now()}`)
  }

  const trackInitiateCheckout = async (data: {
    content_ids: string[]
    content_type: string
    value: number
    currency?: string
    num_items?: number
  }) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.begin_checkout) return

    trackEvent('InitiateCheckout', {
      content_ids: data.content_ids,
      content_type: data.content_type || cfg.event_parameters.content_type || 'product',
      value: data.value,
      currency: data.currency || cfg.event_parameters.currency || 'INR',
      num_items: data.num_items || data.content_ids.length
    }, `initiatecheckout_${Date.now()}`)
  }

  const trackAddPaymentInfo = async (data: {
    value?: number
    currency?: string
    content_ids?: string[]
    content_type?: string
  }) => {
    trackEvent('AddPaymentInfo', {
      value: data.value,
      currency: data.currency || 'INR',
      content_ids: data.content_ids || [],
      content_type: data.content_type || 'product'
    }, `addpaymentinfo_${Date.now()}`)
  }

  const trackPurchase = async (data: {
    transaction_id: string
    value: number
    currency?: string
    content_ids: string[]
    content_type?: string
    num_items?: number
  }) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.purchase) return

    trackEvent('Purchase', {
      transaction_id: data.transaction_id,
      value: data.value,
      currency: data.currency || cfg.event_parameters.currency || 'INR',
      content_ids: data.content_ids,
      content_type: data.content_type || cfg.event_parameters.content_type || 'product',
      num_items: data.num_items || data.content_ids.length
    }, `purchase_${data.transaction_id}`)
  }

  const trackLead = async (data: {
    content_name?: string
    content_category?: string
    value?: number
    currency?: string
  }) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.newsletter_signup && !cfg.events.contact_form) return

    trackEvent('Lead', {
      content_name: data.content_name,
      content_category: data.content_category,
      value: data.value,
      currency: data.currency || cfg.event_parameters.currency || 'INR'
    }, `lead_${Date.now()}`)
  }

  const trackCompleteRegistration = async (data: {
    content_name?: string
    status?: string
    value?: number
    currency?: string
  }) => {
    const cfg = trackingConfig || await marketingConfigService.getTrackingConfig()
    if (!cfg.events.newsletter_signup) return

    trackEvent('CompleteRegistration', {
      content_name: data.content_name || 'Newsletter',
      status: data.status || 'completed',
      value: data.value,
      currency: data.currency || cfg.event_parameters.currency || 'INR'
    }, `completeregistration_${Date.now()}`)
  }

  const trackSubscribe = (data: {
    value?: number
    currency?: string
    predicted_ltv?: number
  }) => {
    trackCustomEvent('Subscribe', {
      value: data.value,
      currency: data.currency || 'INR',
      predicted_ltv: data.predicted_ltv
    })
  }

  const trackViewCategory = (data: {
    content_name?: string
    content_category?: string
    content_ids: string[]
  }) => {
    trackCustomEvent('ViewCategory', {
      content_name: data.content_name,
      content_category: data.content_category,
      content_ids: data.content_ids
    })
  }

  const trackCustomizeProduct = (data: {
    content_name?: string
    content_category?: string
    content_ids: string[]
  }) => {
    trackCustomEvent('CustomizeProduct', {
      content_name: data.content_name,
      content_category: data.content_category,
      content_ids: data.content_ids
    })
  }

  // Advanced Matching - Update user data
  const updateUser = (userData: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
    external_id?: string
  }) => {
    if (!window.fbq || !config?.enabled || !config.advanced_matching) return

    window.fbq('init', config.pixel_id, {
      em: userData.email,
      fn: userData.firstName,
      ln: userData.lastName,
      ph: userData.phone,
      external_id: userData.external_id
    })
  }

  return {
    trackEvent,
    trackCustomEvent,
    trackViewContent,
    trackSearch,
    trackAddToCart,
    trackAddToWishlist,
    trackInitiateCheckout,
    trackAddPaymentInfo,
    trackPurchase,
    trackLead,
    trackCompleteRegistration,
    trackSubscribe,
    trackViewCategory,
    trackCustomizeProduct,
    updateUser
  }
}