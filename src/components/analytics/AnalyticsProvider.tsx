'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useCookieConsent } from './CookieConsent'
import GoogleAnalytics, { useGA4Ecommerce, useGA4Events } from './GoogleAnalytics'
import MetaPixel, { useMetaPixel } from './MetaPixel'
import GoogleTagManager, { useGTM } from './GoogleTagManager'

interface AnalyticsContextType {
  // Unified tracking methods
  trackPageView: (path?: string, title?: string) => void
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void
  trackPurchase: (data: PurchaseData) => void
  trackAddToCart: (items: CartItem[]) => void
  trackRemoveFromCart: (items: CartItem[]) => void
  trackCheckout: (items: CartItem[], step?: number) => void
  trackSearch: (query: string, results?: number) => void
  trackSignUp: (method: string) => void
  trackLogin: (method: string) => void
  trackShare: (method: string, content: ShareContent) => void
  trackLead: (data: LeadData) => void
  trackViewItem: (item: ProductItem) => void
  trackVideo: (data: VideoData) => void
  trackDownload: (data: DownloadData) => void

  // Consent state
  hasAnalyticsConsent: boolean
  hasMarketingConsent: boolean

  // Platform specific hooks (if needed)
  ga4: {
    trackEvent: (eventName: string, parameters?: Record<string, any>) => void
    trackSignUp: (method: string) => void
    trackLogin: (method: string) => void
    trackShare: (method: string, contentType: string, itemId?: string) => void
    trackVideoPlay: (title: string, duration?: number) => void
    trackVideoComplete: (title: string, duration?: number) => void
    trackDownload: (fileName: string, fileUrl: string, fileExtension: string) => void
  }

  meta: {
    trackViewContent: (data: MetaViewContentData) => void
    trackSearch: (query: string, contentIds?: string[]) => void
    trackAddToCart: (data: MetaCartData) => void
    trackInitiateCheckout: (data: MetaCheckoutData) => void
    trackPurchase: (data: MetaPurchaseData) => void
    trackLead: (data: MetaLeadData) => void
    trackCompleteRegistration: (data: MetaRegistrationData) => void
  }

  gtm: {
    trackEcommerce: (data: GTMEcommerceData) => void
    trackUserLogin: (data: GTMLoginData) => void
    trackProductClick: (data: GTMProductClickData) => void
    trackPromotion: (data: GTMPromotionData) => void
    setUserProperties: (properties: GTMUserProperties) => void
  }
}

interface ProductItem {
  id: string
  name: string
  category?: string
  brand?: string
  variant?: string
  price: number
  currency?: string
  quantity?: number
  sku?: string
  imageUrl?: string
  url?: string
}

interface CartItem extends ProductItem {
  quantity: number
}

interface ShareContent {
  type: string
  id: string
  name?: string
  url?: string
}

interface LeadData {
  type: string
  value?: number
  currency?: string
  source?: string
}

interface VideoData {
  title: string
  duration?: number
  provider: 'youtube' | 'vimeo' | 'native'
  action: 'play' | 'pause' | 'complete' | 'progress'
  percent?: number
}

interface DownloadData {
  fileName: string
  fileUrl: string
  fileExtension: string
  fileType: string
}

interface PurchaseData {
  transactionId: string
  value: number
  currency?: string
  items: CartItem[]
  coupon?: string
  paymentMethod?: string
  isNewCustomer?: boolean
}

interface MetaViewContentData {
  content_ids: string[]
  content_type: string
  content_name?: string
  content_category?: string
  value?: number
  currency?: string
}

interface MetaCartData {
  content_ids: string[]
  content_type: string
  content_name?: string
  content_category?: string
  value: number
  currency?: string
}

interface MetaCheckoutData {
  content_ids: string[]
  content_type: string
  value: number
  currency?: string
  num_items?: number
}

interface MetaPurchaseData {
  transaction_id: string
  value: number
  currency?: string
  content_ids: string[]
  content_type?: string
  num_items?: number
}

interface MetaLeadData {
  content_name?: string
  content_category?: string
  value?: number
  currency?: string
}

interface MetaRegistrationData {
  content_name?: string
  status?: string
  value?: number
  currency?: string
}

interface GTMEcommerceData {
  event_name: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'refund'
  ecommerce: {
    currency?: string
    value?: number
    items?: ProductItem[]
    transaction_id?: string
    coupon?: string
    payment_method?: string
    shipping?: number
    tax?: number
  }
}

interface GTMLoginData {
  user_id?: string
  login_method: 'email' | 'google' | 'facebook' | 'social'
  new_user: boolean
}

interface GTMProductClickData {
  product_id: string
  product_name: string
  category?: string
  brand?: string
  variant?: string
  price?: number
  list_name?: string
  list_position?: number
}

interface GTMPromotionData {
  promotion_id: string
  promotion_name: string
  creative_name?: string
  creative_slot?: string
  location_id?: string
}

interface GTMUserProperties {
  user_id?: string
  user_type?: 'new' | 'returning' | 'vip'
  customer_segment?: string
  total_orders?: number
  total_value?: number
  last_order_date?: string
  preferred_language?: string
  location?: string
  device_type?: string
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { preferences, hasConsented } = useCookieConsent()
  const hasAnalyticsConsent = preferences.analytics && hasConsented
  const hasMarketingConsent = preferences.marketing && hasConsented

  // Platform hooks
  const ga4Ecommerce = useGA4Ecommerce()
  const ga4Events = useGA4Events()
  const metaPixel = useMetaPixel()
  const gtm = useGTM()

  // Unified tracking methods
  const trackPageView = (path?: string, title?: string) => {
    if (hasAnalyticsConsent) {
      gtm.trackPageView(path, title)
    }
  }

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (hasAnalyticsConsent) {
      ga4Events.trackEvent(eventName, parameters)
      gtm.trackEvent(eventName, parameters)
    }
  }

  const trackPurchase = (data: PurchaseData) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Ecommerce.trackPurchase({
        transaction_id: data.transactionId,
        value: data.value,
        items: data.items
      })

      // GTM
      gtm.trackEcommerce({
        event_name: 'purchase',
        ecommerce: {
          transaction_id: data.transactionId,
          value: data.value,
          currency: data.currency || 'INR',
          items: data.items,
          coupon: data.coupon,
          payment_method: data.paymentMethod
        }
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackPurchase({
        transaction_id: data.transactionId,
        value: data.value,
        currency: data.currency || 'INR',
        content_ids: data.items.map(item => item.id),
        num_items: data.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
      })
    }
  }

  const trackAddToCart = (items: CartItem[]) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Ecommerce.trackAddToCart(items)

      // GTM
      gtm.trackEcommerce({
        event_name: 'add_to_cart',
        ecommerce: {
          value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          currency: items[0]?.currency || 'INR',
          items
        }
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackAddToCart({
        content_ids: items.map(item => item.id),
        content_type: 'product',
        content_name: items[0]?.name,
        value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        currency: items[0]?.currency || 'INR'
      })
    }
  }

  const trackRemoveFromCart = (items: CartItem[]) => {
    if (hasAnalyticsConsent) {
      gtm.trackEvent('remove_from_cart', {
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity
        })),
        value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        currency: items[0]?.currency || 'INR'
      })
    }
  }

  const trackCheckout = (items: CartItem[], step?: number) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Ecommerce.trackBeginCheckout(items)

      // GTM
      gtm.trackEcommerce({
        event_name: 'begin_checkout',
        ecommerce: {
          value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          currency: items[0]?.currency || 'INR',
          items
        }
      })

      if (step) {
        gtm.trackCheckoutStep({
          step,
          products: items,
          checkout_value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      }
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackInitiateCheckout({
        content_ids: items.map(item => item.id),
        content_type: 'product',
        value: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        currency: items[0]?.currency || 'INR',
        num_items: items.length
      })
    }
  }

  const trackSearch = (query: string, results?: number) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Ecommerce.trackSearch(query)

      // GTM
      gtm.trackSearch({
        search_term: query,
        search_results: results || 0
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackSearch(query)
    }
  }

  const trackSignUp = (method: string) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Events.trackSignUp(method)

      // GTM
      gtm.trackUserSignup({
        signup_method: method,
        user_properties: {
          customer_type: 'b2c'
        }
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackCompleteRegistration({
        content_name: 'User Registration',
        status: 'completed'
      })
    }
  }

  const trackLogin = (method: string) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Events.trackLogin(method)

      // GTM
      gtm.trackUserLogin({
        login_method: method,
        new_user: false
      })
    }
  }

  const trackShare = (method: string, content: ShareContent) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Events.trackShare(method, content.type, content.id)

      // GTM
      gtm.trackEvent('share', {
        method,
        content_type: content.type,
        item_id: content.id,
        content_name: content.name,
        content_url: content.url
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackEvent('Share', {
        method,
        content_type: content.type,
        content_id: content.id
      })
    }
  }

  const trackLead = (data: LeadData) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Ecommerce.trackLead({
        lead_type: data.type,
        value: data.value,
        currency: data.currency || 'INR'
      })

      // GTM
      gtm.trackEvent('generate_lead', {
        lead_type: data.type,
        value: data.value,
        currency: data.currency || 'INR',
        source: data.source
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackLead({
        content_name: data.type,
        value: data.value,
        currency: data.currency || 'INR'
      })
    }
  }

  const trackViewItem = (item: ProductItem) => {
    if (hasAnalyticsConsent) {
      // GA4
      ga4Ecommerce.trackViewItem({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        brand: item.brand || 'BookBharat',
        price: item.price,
        currency: item.currency || 'INR'
      })

      // GTM
      gtm.trackEcommerce({
        event_name: 'view_item',
        ecommerce: {
          currency: item.currency || 'INR',
          value: item.price,
          items: [item]
        }
      })
    }

    if (hasMarketingConsent) {
      // Meta Pixel
      metaPixel.trackViewContent({
        content_ids: [item.id],
        content_type: 'product',
        content_name: item.name,
        content_category: item.category,
        value: item.price,
        currency: item.currency || 'INR'
      })
    }
  }

  const trackVideo = (data: VideoData) => {
    if (hasAnalyticsConsent) {
      if (data.action === 'play') {
        ga4Events.trackVideoPlay(data.title, data.duration)
      } else if (data.action === 'complete') {
        ga4Events.trackVideoComplete(data.title, data.duration)
      }

      gtm.trackVideoEvent({
        video_title: data.title,
        video_provider: data.provider,
        video_action: data.action,
        video_percent: data.percent,
        video_duration: data.duration
      })
    }
  }

  const trackDownload = (data: DownloadData) => {
    if (hasAnalyticsConsent) {
      ga4Events.trackDownload(data.fileName, data.fileUrl, data.fileExtension)

      gtm.trackEvent('file_download', {
        file_name: data.fileName,
        file_url: data.fileUrl,
        file_type: data.fileType,
        file_extension: data.fileExtension
      })
    }
  }

  const value: AnalyticsContextType = {
    // Unified methods
    trackPageView,
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckout,
    trackSearch,
    trackSignUp,
    trackLogin,
    trackShare,
    trackLead,
    trackViewItem,
    trackVideo,
    trackDownload,

    // Consent state
    hasAnalyticsConsent,
    hasMarketingConsent,

    // Platform specific
    ga4: {
      trackEvent: ga4Events.trackEvent,
      trackSignUp: ga4Events.trackSignUp,
      trackLogin: ga4Events.trackLogin,
      trackShare: ga4Events.trackShare,
      trackVideoPlay: ga4Events.trackVideoPlay,
      trackVideoComplete: ga4Events.trackVideoComplete,
      trackDownload: ga4Events.trackDownload
    },

    meta: {
      trackViewContent: metaPixel.trackViewContent,
      trackSearch: metaPixel.trackSearch,
      trackAddToCart: metaPixel.trackAddToCart,
      trackInitiateCheckout: metaPixel.trackInitiateCheckout,
      trackPurchase: metaPixel.trackPurchase,
      trackLead: metaPixel.trackLead,
      trackCompleteRegistration: metaPixel.trackCompleteRegistration
    },

    gtm: {
      trackEcommerce: gtm.trackEcommerce,
      trackUserLogin: gtm.trackUserLogin,
      trackProductClick: gtm.trackProductClick,
      trackPromotion: gtm.trackPromotion,
      setUserProperties: gtm.setUserProperties
    }
  }

  // Only initialize tracking scripts if consent is given
  return (
    <AnalyticsContext.Provider value={value}>
      {hasAnalyticsConsent || hasMarketingConsent ? (
        <GoogleTagManager>
          {hasAnalyticsConsent ? (
            <GoogleAnalytics>
              <MetaPixel>
                {children}
              </MetaPixel>
            </GoogleAnalytics>
          ) : (
            <>{children}</>
          )}
        </GoogleTagManager>
      ) : (
        <>{children}</>
      )}
    </AnalyticsContext.Provider>
  )
}

// Hook to use analytics
export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// Higher-order component for tracking page views
export function withPageTracking<P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) {
  return function TrackedComponent(props: P) {
    const analytics = useAnalytics()
    const router = useRouter()

    useEffect(() => {
      analytics.trackPageView(router.asPath, pageName || document.title)
    }, [router.asPath])

    return <Component {...props} />
  }
}

// Export types for external use
export type {
  ProductItem,
  CartItem,
  ShareContent,
  LeadData,
  VideoData,
  DownloadData,
  PurchaseData,
  AnalyticsContextType
}