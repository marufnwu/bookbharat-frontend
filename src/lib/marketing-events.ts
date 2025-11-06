'use client'

import { useAnalytics } from '@/components/analytics/AnalyticsProvider'

// Marketing Event Types
export interface MarketingEvent {
  event: string
  data?: Record<string, any>
  timestamp?: number
  user_id?: string
  session_id?: string
}

// Standard E-commerce Events
export interface EcommerceEvent {
  event:
    | 'product_view'
    | 'product_click'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'view_cart'
    | 'begin_checkout'
    | 'add_shipping_info'
    | 'add_payment_info'
    | 'purchase'
    | 'refund'
    | 'view_item_list'
    | 'select_item'
    | 'view_promotion'
    | 'select_promotion'
  ecommerce: {
    currency?: string
    value?: number
    items?: ProductItem[]
    transaction_id?: string
    affiliation?: string
    coupon?: string
    shipping?: number
    tax?: number
    payment_method?: string
    creative_name?: string
    creative_slot?: string
    promotion_id?: string
    promotion_name?: string
    location_id?: string
    item_list_id?: string
    item_list_name?: string
    index?: number
  }
}

export interface ProductItem {
  item_id: string
  item_name: string
  affiliation?: string
  coupon?: string
  discount?: number
  index?: number
  item_brand?: string
  item_category?: string
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  item_list_id?: string
  item_list_name?: string
  item_variant?: string
  location_id?: string
  price?: number
  quantity?: number
}

// Custom Hook for Marketing Events
export function useMarketingEvents() {
  const analytics = useAnalytics()

  // Generate unique event ID
  const generateEventId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate unique transaction ID
  const generateTransactionId = () => {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Track any marketing event with validation
  const trackEvent = (event: string, data?: Record<string, any>) => {
    try {
      // Validate event data
      const validatedData = validateEventData(event, data)

      // Add metadata
      const enrichedData = {
        ...validatedData,
        timestamp: Date.now(),
        event_id: generateEventId(),
        platform: 'bookbharat',
        version: '2.0.0'
      }

      analytics.trackEvent(event, enrichedData)
    } catch (error) {
      console.error('Error tracking marketing event:', error)
    }
  }

  // E-commerce event tracking
  const trackEcommerce = (ecommerceData: EcommerceEvent) => {
    try {
      // Validate ecommerce data
      const validatedData = validateEcommerceData(ecommerceData)

      // Add common ecommerce metadata
      const enrichedData = {
        ...validatedData,
        timestamp: Date.now(),
        event_id: generateEventId(),
        platform: 'bookbharat',
        version: '2.0.0'
      }

      // Track with analytics provider
      switch (ecommerceData.event) {
        case 'product_view':
        case 'view_item':
          if (ecommerceData.ecommerce.items?.[0]) {
            analytics.trackViewItem({
              id: ecommerceData.ecommerce.items[0].item_id,
              name: ecommerceData.ecommerce.items[0].item_name,
              category: ecommerceData.ecommerce.items[0].item_category,
              brand: ecommerceData.ecommerce.items[0].item_brand,
              price: ecommerceData.ecommerce.items[0].price,
              variant: ecommerceData.ecommerce.items[0].item_variant,
              quantity: ecommerceData.ecommerce.items[0].quantity
            })
          }
          break

        case 'add_to_cart':
          if (ecommerceData.ecommerce.items) {
            analytics.trackAddToCart(
              ecommerceData.ecommerce.items.map(item => ({
                id: item.item_id,
                name: item.item_name,
                category: item.item_category,
                brand: item.item_brand,
                price: item.price || 0,
                quantity: item.quantity || 1,
                sku: item.item_id,
                currency: ecommerceData.ecommerce.currency || 'INR'
              }))
            )
          }
          break

        case 'begin_checkout':
          if (ecommerceData.ecommerce.items) {
            analytics.trackCheckout(
              ecommerceData.ecommerce.items.map(item => ({
                id: item.item_id,
                name: item.item_name,
                category: item.item_category,
                brand: item.item_brand,
                price: item.price || 0,
                quantity: item.quantity || 1,
                sku: item.item_id,
                currency: ecommerceData.ecommerce.currency || 'INR'
              }))
            )
          }
          break

        case 'purchase':
          if (ecommerceData.ecommerce.transaction_id) {
            analytics.trackPurchase({
              transactionId: ecommerceData.ecommerce.transaction_id,
              value: ecommerceData.ecommerce.value || 0,
              currency: ecommerceData.ecommerce.currency || 'INR',
              items: (ecommerceData.ecommerce.items || []).map(item => ({
                id: item.item_id,
                name: item.item_name,
                category: item.item_category,
                brand: item.item_brand,
                price: item.price || 0,
                quantity: item.quantity || 1,
                sku: item.item_id,
                currency: ecommerceData.ecommerce.currency || 'INR'
              })),
              coupon: ecommerceData.ecommerce.coupon,
              paymentMethod: ecommerceData.ecommerce.payment_method
            })
          }
          break
      }

      // Also track with GTM
      if (analytics.gtm) {
        analytics.gtm.trackEcommerce({
          event_name: ecommerceData.event,
          ecommerce: ecommerceData.ecommerce
        })
      }
    } catch (error) {
      console.error('Error tracking ecommerce event:', error)
    }
  }

  // Content engagement tracking
  const trackContentEngagement = (data: {
    content_type: 'product' | 'blog' | 'category' | 'page' | 'video'
    content_id?: string
    content_name?: string
    author?: string
    published_date?: string
    tags?: string[]
    engagement_type: 'view' | 'click' | 'share' | 'comment' | 'like' | 'save'
    engagement_value?: number
    time_spent?: number
  }) => {
    trackEvent('content_engagement', {
      content_type: data.content_type,
      content_id: data.content_id,
      content_name: data.content_name,
      author: data.author,
      published_date: data.published_date,
      tags: data.tags,
      engagement_type: data.engagement_type,
      engagement_value: data.engagement_value,
      time_spent: data.time_spent
    })
  }

  // User journey tracking
  const trackUserJourney = (data: {
    journey_name: string
    step_name: string
    step_number: number
    total_steps: number
    success: boolean
    error_message?: string
    step_data?: Record<string, any>
  }) => {
    trackEvent('user_journey', {
      journey_name: data.journey_name,
      step_name: data.step_name,
      step_number: data.step_number,
      total_steps: data.total_steps,
      success: data.success,
      error_message: data.error_message,
      step_data: data.step_data,
      completion_rate: (data.step_number / data.total_steps) * 100
    })
  }

  // Marketing funnel tracking
  const trackFunnel = (data: {
    funnel_name: string
    stage: 'awareness' | 'interest' | 'consideration' | 'intent' | 'evaluation' | 'purchase'
    action: string
    value?: number
    currency?: string
    user_properties?: Record<string, any>
  }) => {
    trackEvent('funnel_stage', {
      funnel_name: data.funnel_name,
      stage: data.stage,
      action: data.action,
      value: data.value,
      currency: data.currency || 'INR',
      user_properties: data.user_properties
    })
  }

  // Campaign tracking
  const trackCampaign = (data: {
    campaign_name: string
    campaign_source: string
    campaign_medium: string
    campaign_term?: string
    campaign_content?: string
    ad_group?: string
    ad_name?: string
    creative_id?: string
    placement?: string
    position?: number
    device?: string
  }) => {
    trackEvent('campaign_interaction', {
      campaign_name: data.campaign_name,
      campaign_source: data.campaign_source,
      campaign_medium: data.campaign_medium,
      campaign_term: data.campaign_term,
      campaign_content: data.campaign_content,
      ad_group: data.ad_group,
      ad_name: data.ad_name,
      creative_id: data.creative_id,
      placement: data.placement,
      position: data.position,
      device: data.device
    })
  }

  // A/B test tracking
  const trackABTest = (data: {
    test_name: string
    variation: string
    test_id: string
    user_segment?: string
    goal?: string
    conversion?: boolean
    conversion_value?: number
  }) => {
    trackEvent('ab_test', {
      test_name: data.test_name,
      variation: data.variation,
      test_id: data.test_id,
      user_segment: data.user_segment,
      goal: data.goal,
      conversion: data.conversion,
      conversion_value: data.conversion_value
    })
  }

  // Lead tracking
  const trackLead = (data: {
    lead_type: 'newsletter' | 'contact_form' | 'quote_request' | 'demo_request' | 'download'
    lead_source: string
    lead_medium?: string
    lead_campaign?: string
    value?: number
    currency?: string
    user_data?: {
      email?: string
      phone?: string
      name?: string
      company?: string
    }
  }) => {
    analytics.trackLead({
      type: data.lead_type,
      value: data.value,
      currency: data.currency || 'INR',
      source: data.lead_source
    })

    // Track additional lead data
    trackEvent('lead_generated', {
      lead_type: data.lead_type,
      lead_source: data.lead_source,
      lead_medium: data.lead_medium,
      lead_campaign: data.lead_campaign,
      value: data.value,
      currency: data.currency || 'INR'
    })
  }

  // Social sharing tracking
  const trackSocialShare = (data: {
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'instagram' | 'linkedin' | 'email' | 'copy_link'
    content_type: string
    content_id?: string
    content_title?: string
    content_url?: string
    share_type: 'organic' | 'paid' | 'influencer'
  }) => {
    analytics.trackShare(data.platform, {
      type: data.content_type,
      id: data.content_id || '',
      name: data.content_title,
      url: data.content_url
    })

    trackEvent('social_share', {
      platform: data.platform,
      content_type: data.content_type,
      content_id: data.content_id,
      content_title: data.content_title,
      content_url: data.content_url,
      share_type: data.share_type
    })
  }

  // Performance tracking
  const trackPerformance = (data: {
    metric_name: string
    metric_value: number
    metric_unit?: string
    page_name?: string
    component_name?: string
    action?: string
    additional_data?: Record<string, any>
  }) => {
    trackEvent('performance_metric', {
      metric_name: data.metric_name,
      metric_value: data.metric_value,
      metric_unit: data.metric_unit,
      page_name: data.page_name,
      component_name: data.component_name,
      action: data.action,
      additional_data: data.additional_data
    })
  }

  // Error tracking
  const trackError = (data: {
    error_type: 'javascript' | 'api' | 'validation' | 'network' | 'payment' | 'other'
    error_message: string
    error_code?: string
    stack_trace?: string
    context?: Record<string, any>
    user_impact?: 'low' | 'medium' | 'high' | 'critical'
  }) => {
    trackEvent('error', {
      error_type: data.error_type,
      error_message: data.error_message,
      error_code: data.error_code,
      stack_trace: data.stack_trace,
      context: data.context,
      user_impact: data.user_impact,
      timestamp: Date.now()
    })
  }

  // Validation functions
  const validateEventData = (event: string, data?: Record<string, any>) => {
    // Basic validation - can be extended
    if (!event || typeof event !== 'string') {
      throw new Error('Event name is required and must be a string')
    }

    // Remove sensitive data
    if (data) {
      const sanitized = { ...data }
      delete sanitized.password
      delete sanitized.credit_card
      delete sanitized.ssn
      delete sanitized.api_key
      return sanitized
    }

    return {}
  }

  const validateEcommerceData = (data: EcommerceEvent) => {
    if (!data.event) {
      throw new Error('Event name is required for ecommerce tracking')
    }

    if (!data.ecommerce) {
      throw new Error('Ecommerce data is required')
    }

    // Validate currency format
    if (data.ecommerce.currency && !/^[A-Z]{3}$/.test(data.ecommerce.currency)) {
      throw new Error('Currency must be a valid 3-letter code')
    }

    // Validate value
    if (data.ecommerce.value !== undefined && (typeof data.ecommerce.value !== 'number' || data.ecommerce.value < 0)) {
      throw new Error('Value must be a non-negative number')
    }

    return data
  }

  // Batch event tracking for performance
  const trackBatchEvents = (events: Array<{ event: string; data?: Record<string, any> }>) => {
    events.forEach(({ event, data }) => {
      trackEvent(event, data)
    })
  }

  // Get marketing data for server-side tracking
  const getMarketingData = () => {
    return {
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      url: window.location.href,
      timestamp: Date.now(),
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  return {
    // Core tracking
    trackEvent,
    trackEcommerce,

    // Specialized tracking
    trackContentEngagement,
    trackUserJourney,
    trackFunnel,
    trackCampaign,
    trackABTest,
    trackLead,
    trackSocialShare,
    trackPerformance,
    trackError,

    // Utilities
    generateEventId,
    generateTransactionId,
    trackBatchEvents,
    getMarketingData
  }
}

// Export types
export type {
  MarketingEvent,
  EcommerceEvent,
  ProductItem
}