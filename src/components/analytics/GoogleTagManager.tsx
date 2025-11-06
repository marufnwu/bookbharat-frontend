'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

interface GoogleTagManagerProps {
  children: React.ReactNode
  containerId?: string
  debug?: boolean
}

declare global {
  interface Window {
    dataLayer: Record<string, any>[]
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}

export default function GoogleTagManager({
  children,
  containerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
  debug = process.env.NODE_ENV === 'development'
}: GoogleTagManagerProps) {
  const gtmInitialized = useRef(false)

  useEffect(() => {
    if (!containerId || gtmInitialized.current) return

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []

    // Initialize Google Tag Manager
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })

    gtmInitialized.current = true
  }, [containerId])

  // Push initial data to dataLayer
  useEffect(() => {
    if (!containerId || !window.dataLayer) return

    // Page data
    window.dataLayer.push({
      event: 'page_info',
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })

    // Custom dimensions
    window.dataLayer.push({
      event: 'custom_dimensions',
      site_version: '2.0.0',
      environment: process.env.NODE_ENV,
      debug_mode: debug
    })
  }, [containerId, debug])

  if (!containerId) {
    return <>{children}</>
  }

  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${containerId}');
          `
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      {children}
    </>
  )
}

// Hook for GTM data layer events
export function useGTM() {
  const pushToDataLayer = (data: Record<string, any>) => {
    if (!window.dataLayer) return

    window.dataLayer.push({
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    pushToDataLayer({
      event: eventName,
      ...parameters
    })
  }

  const trackPageView = (path?: string, title?: string) => {
    trackEvent('page_view', {
      page_path: path || window.location.pathname,
      page_title: title || document.title,
      page_location: window.location.href
    })
  }

  const trackUserInteraction = (data: {
    element_type: string
    element_text?: string
    element_url?: string
    section?: string
  }) => {
    trackEvent('user_interaction', {
      interaction_type: 'click',
      ...data
    })
  }

  const trackFormSubmission = (data: {
    form_name: string
    form_type: string
    success: boolean
    errors?: string[]
  }) => {
    trackEvent('form_submit', {
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  const trackVideoEvent = (data: {
    video_title: string
    video_provider: 'youtube' | 'vimeo' | 'native'
    video_action: 'play' | 'pause' | 'complete' | 'progress'
    video_percent?: number
    video_duration?: number
  }) => {
    trackEvent('video_interaction', {
      ...data
    })
  }

  const trackScroll = (data: {
    scroll_threshold: number
    scroll_direction: 'vertical' | 'horizontal'
    scroll_location: number
  }) => {
    trackEvent('scroll', {
      ...data
    })
  }

  const trackEcommerce = (data: {
    event_name: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'refund'
    ecommerce: {
      currency?: string
      value?: number
      items?: Array<{
        item_id: string
        item_name: string
        item_category?: string
        item_variant?: string
        price?: number
        quantity?: number
      }>
      transaction_id?: string
      coupon?: string
      payment_method?: string
      shipping?: number
      tax?: number
    }
  }) => {
    pushToDataLayer({
      event: data.event_name,
      ecommerce: {
        currency: data.ecommerce.currency || 'INR',
        ...data.ecommerce
      }
    })
  }

  const trackUserLogin = (data: {
    user_id?: string
    login_method: 'email' | 'google' | 'facebook' | 'social'
    new_user: boolean
  }) => {
    trackEvent('login', {
      method: data.login_method,
      user_type: data.new_user ? 'new' : 'returning',
      user_id: data.user_id
    })
  }

  const trackUserSignup = (data: {
    user_id?: string
    signup_method: 'email' | 'google' | 'facebook' | 'social'
    user_properties?: {
      customer_type?: 'b2b' | 'b2c'
      preferred_language?: string
      age_group?: string
      gender?: string
    }
  }) => {
    trackEvent('sign_up', {
      method: data.signup_method,
      user_properties: data.user_properties || {},
      user_id: data.user_id
    })
  }

  const trackSearch = (data: {
    search_term: string
    search_category?: string
    search_results: number
    search_filters?: Record<string, any>
  }) => {
    trackEvent('search', {
      search_term: data.search_term,
      search_category: data.search_category,
      search_results_count: data.search_results,
      search_filters: data.search_filters
    })
  }

  const trackPromotion = (data: {
    promotion_id: string
    promotion_name: string
    creative_name?: string
    creative_slot?: string
    location_id?: string
  }) => {
    trackEvent('view_promotion', {
      promotion_id: data.promotion_id,
      promotion_name: data.promotion_name,
      creative_name: data.creative_name,
      creative_slot: data.creative_slot,
      location_id: data.location_id
    })
  }

  const trackPromotionClick = (data: {
    promotion_id: string
    promotion_name: string
    creative_name?: string
    creative_slot?: string
    location_id?: string
  }) => {
    trackEvent('select_promotion', {
      promotion_id: data.promotion_id,
      promotion_name: data.promotion_name,
      creative_name: data.creative_name,
      creative_slot: data.creative_slot,
      location_id: data.location_id
    })
  }

  // Enhanced E-commerce
  const trackProductClick = (data: {
    product_id: string
    product_name: string
    category?: string
    brand?: string
    variant?: string
    price?: number
    list_name?: string
    list_position?: number
  }) => {
    trackEvent('select_item', {
      ecommerce: {
        items: [{
          item_id: data.product_id,
          item_name: data.product_name,
          item_category: data.category,
          item_brand: data.brand || 'BookBharat',
          item_variant: data.variant,
          price: data.price,
          index: data.list_position,
          item_list_name: data.list_name
        }]
      }
    })
  }

  const trackCheckoutStep = (data: {
    step: number
    checkout_option?: string
    checkout_value?: number
    products?: Array<{
      item_id: string
      item_name: string
      price: number
      quantity: number
    }>
  }) => {
    trackEvent('checkout_step', {
      checkout_step: data.step,
      checkout_option: data.checkout_option,
      checkout_value: data.checkout_value,
      products: data.products
    })
  }

  // Custom Events
  const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    trackEvent(eventName, parameters)
  }

  // User Properties (sent once per session)
  const setUserProperties = (properties: {
    user_id?: string
    user_type?: 'new' | 'returning' | 'vip'
    customer_segment?: string
    total_orders?: number
    total_value?: number
    last_order_date?: string
    preferred_language?: string
    location?: string
    device_type?: string
  }) => {
    trackEvent('user_properties_set', {
      user_id: properties.user_id,
      user_properties: properties
    })
  }

  // Clear dataLayer (useful for single-page apps)
  const clearDataLayer = () => {
    if (!window.dataLayer) return

    window.dataLayer.push({
      event: 'dataLayer-clear',
      'gtm.start': new Date().getTime()
    })
  }

  return {
    pushToDataLayer,
    trackEvent,
    trackPageView,
    trackUserInteraction,
    trackFormSubmission,
    trackVideoEvent,
    trackScroll,
    trackEcommerce,
    trackUserLogin,
    trackUserSignup,
    trackSearch,
    trackPromotion,
    trackPromotionClick,
    trackProductClick,
    trackCheckoutStep,
    trackCustomEvent,
    setUserProperties,
    clearDataLayer
  }
}