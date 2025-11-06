'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { marketingConfigService } from '@/services/marketing-config'

interface DynamicTrackingProps {
  children: React.ReactNode
}

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
    dataLayer: Record<string, any>[]
    fbq: (command: string, eventName?: string, parameters?: Record<string, any>) => void
    _fbq: Window['fbq']
    ttq: (command: string, eventName?: string, parameters?: Record<string, any>) => void
    _ttq: Window['ttq']
    pintrk: (command: string, eventName?: string, parameters?: Record<string, any>) => void
    _pintrk: Window['pintrk']
    hj: (command: string, ...args: any[]) => void
    _hjSettings: any
    mixpanel: {
      init: (token: string, config?: any) => void
      track: (event: string, properties?: any) => void
      identify: (unique_id: string) => void
      people: {
        set: (properties: any) => void
      }
    }
    clarity: (command: string, ...args: any[]) => void
    hotjar: (command: string, ...args: any[]) => void
   linkedin_partner_id: string
  }
}

export default function DynamicTracking({ children }: DynamicTrackingProps) {
  const [config, setConfig] = useState<any>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load all marketing configurations
    marketingConfigService.getConfig().then(marketingConfig => {
      setConfig(marketingConfig)
    })
  }, [])

  // Initialize Google Analytics
  const initGoogleAnalytics = (analyticsConfig: any) => {
    if (!analyticsConfig.google_analytics.enabled || !analyticsConfig.google_analytics.measurement_id) return

    const ga = analyticsConfig.google_analytics

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    window.gtag = window.dataLayer.push.bind(window.dataLayer)

    // Configure GA4
    window.gtag('js', new Date())
    window.gtag('config', ga.measurement_id, {
      debug_mode: ga.debug_mode || false,
      send_page_view: false,
      anonymize_ip: ga.anonymize_ip !== false,
      cookie_flags: ga.cookie_flags || 'SameSite=Lax;Secure'
    })

    return (
      <>
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga.measurement_id}`}
        />
        <Script
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga.measurement_id}', {
                debug_mode: ${ga.debug_mode || false},
                send_page_view: false,
                anonymize_ip: ${ga.anonymize_ip !== false},
                cookie_flags: '${ga.cookie_flags || 'SameSite=Lax;Secure'}'
              });
            `
          }}
        />
      </>
    )
  }

  // Initialize Google Tag Manager
  const initGTM = (analyticsConfig: any) => {
    if (!analyticsConfig.google_tag_manager.enabled || !analyticsConfig.google_tag_manager.container_id) return

    const gtm = analyticsConfig.google_tag_manager

    return (
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl${gtm.auth ? "+'&gtm_auth='+gtm.auth" : ''}${gtm.preview ? "+'&gtm_preview='+gtm.preview" : ''}+'&gtm_cookies_win=x';
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtm.container_id}');
          `
        }}
      />
    )
  }

  // Initialize Meta Pixel
  const initMetaPixel = (pixelsConfig: any) => {
    if (!pixelsConfig.meta.enabled || !pixelsConfig.meta.pixel_id) return

    const meta = pixelsConfig.meta

    return (
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
            fbq('init', '${meta.pixel_id}'${meta.advanced_matching ? ', {em: undefined, fn: undefined, ln: undefined, ph: undefined}' : ''});
            fbq('track', 'PageView');
            ${meta.auto_config ? '' : "fbq('set', 'autoConfig', false, '" + meta.pixel_id + "');"}
            ${meta.wait_for_attach ? "fbq('set', 'waitForAttach', true, '" + meta.pixel_id + "');" : ''}
          `
        }}
      />
    )
  }

  // Initialize TikTok Pixel
  const initTikTokPixel = (pixelsConfig: any) => {
    if (!pixelsConfig.tiktok.enabled || !pixelsConfig.tiktok.pixel_id) return

    const tiktok = pixelsConfig.tiktok

    return (
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktok.pixel_id}');
              ttq.page();
            }(window, document, 'ttq');
          `
        }}
      />
    )
  }

  // Initialize Pinterest Tag
  const initPinterestTag = (pixelsConfig: any) => {
    if (!pixelsConfig.pinterest.enabled || !pixelsConfig.pinterest.tag_id) return

    const pinterest = pixelsConfig.pinterest

    return (
      <Script
        id="pinterest-tag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
            n=window.pintrk;n.queue=[],n.version="3.0";var
            t=document.createElement("script");t.async=!0,t.src=e;var
            r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${pinterest.tag_id}'${pinterest.enhanced_match ? ', {em: undefined}' : ''});
            pintrk('page');
          `
        }}
      />
    )
  }

  // Initialize Hotjar
  const initHotjar = (analyticsConfig: any) => {
    if (!analyticsConfig.hotjar.enabled || !analyticsConfig.hotjar.site_id) return

    const hotjar = analyticsConfig.hotjar

    return (
      <Script
        id="hotjar"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${hotjar.site_id},hjsv:${hotjar.snippet_version || 6}};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `
        }}
      />
    )
  }

  // Initialize Mixpanel
  const initMixpanel = (analyticsConfig: any) => {
    if (!analyticsConfig.mixpanel.enabled || !analyticsConfig.mixpanel.token) return

    const mixpanel = analyticsConfig.mixpanel

    return (
      <Script
        id="mixpanel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=c.hash,g=d=h=arguments.length=="string"?1:/[^&#$=?,]/.test(c.hash)?0:-1;if(g&&b.localStorage){var i=a.__SV||(window.localStorage&&localStorage.getItem('__sv')||"");try{i=JSON.parse(i)}catch(l){}d=i=="sw:reloaded"?1:i=="sw:changed"?2:i=="sw:disabled"?0:-1}else d=-1}window.mixpanel=a;a._i=[];a.init=function(b,d,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var g=a;"undefined"!==typeof f?g=a[f]=[]:f="mixpanel";g.people=g.people||[];g.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};g.people.toString=function(){return g.toString(1)+".people (stub)"};h="disable time_event track track_pageview track_links track_forms track_register_groups register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(j=0;j<h.length;j++)e(g,h[j]);a._i.push([b,d,f])};a.__SV=1.2;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===c.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName("script")[0];d.parentNode.insertBefore(b,d)}})(document,window.mixpanel||[]);
            mixpanel.init("${mixpanel.token}", {debug: ${mixpanel.debug_mode || false}});
          `
        }}
      />
    )
  }

  // Initialize Microsoft Clarity
  const initClarity = (analyticsConfig: any) => {
    if (!analyticsConfig.clarity.enabled || !analyticsConfig.clarity.project_id) return

    const clarity = analyticsConfig.clarity

    return (
      <Script
        id="clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarity.project_id}");
          `
        }}
      />
    )
  }

  // Initialize LinkedIn Insight Tag
  const initLinkedIn = (pixelsConfig: any) => {
    if (!pixelsConfig.linkedin.enabled || !pixelsConfig.linkedin.partner_id) return

    const linkedin = pixelsConfig.linkedin

    return (
      <Script
        id="linkedin-insight"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            _linkedin_partner_id = "${linkedin.partner_id}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `
        }}
      />
    )
  }

  // Render tracking scripts
  const renderTrackingScripts = () => {
    if (!config) return null

    const scripts = []

    // Google Analytics
    if (config.analytics?.google_analytics?.enabled && !scriptsLoaded.has('ga')) {
      scripts.push(initGoogleAnalytics(config.analytics))
      scriptsLoaded.add('ga')
    }

    // Google Tag Manager
    if (config.analytics?.google_tag_manager?.enabled && !scriptsLoaded.has('gtm')) {
      scripts.push(initGTM(config.analytics))
      scriptsLoaded.add('gtm')
    }

    // Meta Pixel
    if (config.pixels?.meta?.enabled && !scriptsLoaded.has('meta')) {
      scripts.push(initMetaPixel(config.pixels))
      scriptsLoaded.add('meta')
    }

    // TikTok Pixel
    if (config.pixels?.tiktok?.enabled && !scriptsLoaded.has('tiktok')) {
      scripts.push(initTikTokPixel(config.pixels))
      scriptsLoaded.add('tiktok')
    }

    // Pinterest Tag
    if (config.pixels?.pinterest?.enabled && !scriptsLoaded.has('pinterest')) {
      scripts.push(initPinterestTag(config.pixels))
      scriptsLoaded.add('pinterest')
    }

    // LinkedIn Insight
    if (config.pixels?.linkedin?.enabled && !scriptsLoaded.has('linkedin')) {
      scripts.push(initLinkedIn(config.pixels))
      scriptsLoaded.add('linkedin')
    }

    // Hotjar
    if (config.analytics?.hotjar?.enabled && !scriptsLoaded.has('hotjar')) {
      scripts.push(initHotjar(config.analytics))
      scriptsLoaded.add('hotjar')
    }

    // Mixpanel
    if (config.analytics?.mixpanel?.enabled && !scriptsLoaded.has('mixpanel')) {
      scripts.push(initMixpanel(config.analytics))
      scriptsLoaded.add('mixpanel')
    }

    // Clarity
    if (config.analytics?.clarity?.enabled && !scriptsLoaded.has('clarity')) {
      scripts.push(initClarity(config.analytics))
      scriptsLoaded.add('clarity')
    }

    return scripts
  }

  return (
    <>
      {renderTrackingScripts()}
      {children}
    </>
  )
}