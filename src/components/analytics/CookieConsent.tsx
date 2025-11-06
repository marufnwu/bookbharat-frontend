'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { X, Shield, Info } from 'lucide-react'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

interface CookieContextType {
  preferences: CookiePreferences
  updatePreferences: (newPreferences: Partial<CookiePreferences>) => void
  acceptAll: () => void
  rejectAll: () => void
  hasConsented: boolean
  showPreferences: () => void
  hidePreferences: () => void
}

const CookieContext = createContext<CookieContextType | undefined>(undefined)

interface CookieProviderProps {
  children: ReactNode
}

export function CookieProvider({ children }: CookieProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Cannot be disabled
    analytics: false,
    marketing: false,
    functional: false
  })

  const [hasConsented, setHasConsented] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cookie_preferences')
    const consented = localStorage.getItem('cookie_consented')

    if (stored && consented) {
      setPreferences(JSON.parse(stored))
      setHasConsented(true)
    } else {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem('cookie_preferences', JSON.stringify(newPreferences))
    localStorage.setItem('cookie_consented', 'true')
    setPreferences(newPreferences)
    setHasConsented(true)
    setShowBanner(false)
    setShowSettings(false)

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: newPreferences
    }))
  }

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updated = { ...preferences, ...newPreferences }
    savePreferences(updated)
  }

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    })
  }

  const rejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    })
  }

  const showPreferences = () => {
    setShowSettings(true)
  }

  const hidePreferences = () => {
    setShowSettings(false)
  }

  const value: CookieContextType = {
    preferences,
    updatePreferences,
    acceptAll,
    rejectAll,
    hasConsented,
    showPreferences,
    hidePreferences
  }

  return (
    <CookieContext.Provider value={value}>
      {children}

      {/* Main Cookie Banner */}
      {showBanner && !hasConsented && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">We use cookies</p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content.
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={showPreferences}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 border border-gray-600 rounded hover:bg-gray-800 transition-colors"
              >
                Preferences
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 border border-gray-600 rounded hover:bg-gray-800 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cookie Preferences</h2>
              <button
                onClick={hidePreferences}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                We use cookies to help you navigate efficiently and perform certain functions.
                You will find detailed information about all cookies under each consent category below.
              </p>

              {/* Necessary Cookies */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="necessary"
                      checked={preferences.necessary}
                      disabled
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                    <label htmlFor="necessary" className="font-medium">
                      Essential Cookies
                    </label>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  These cookies are necessary for the website to function and cannot be switched off in our systems.
                  They are usually only set in response to actions made by you which amount to a request for services.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="analytics"
                      checked={preferences.analytics}
                      onChange={(e) => updatePreferences({ analytics: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="analytics" className="font-medium">
                      Analytics Cookies
                    </label>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  These cookies allow us to count visits and traffic sources so we can measure and improve
                  the performance of our site. They help us to know which pages are the most and least popular
                  and see how visitors move around the site.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={preferences.marketing}
                      onChange={(e) => updatePreferences({ marketing: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="marketing" className="font-medium">
                      Marketing Cookies
                    </label>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  These cookies may be set through our site by our advertising partners to build a profile
                  of your interests and show you relevant adverts on other sites.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="functional"
                      checked={preferences.functional}
                      onChange={(e) => updatePreferences({ functional: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="functional" className="font-medium">
                      Functional Cookies
                    </label>
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  These cookies enable the website to provide enhanced functionality and personalization.
                  They may be set by us or by third party providers whose services we have added to our pages.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={rejectAll}
                  className="flex-1 px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={hidePreferences}
                  className="flex-1 px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-4 py-2 font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Accept All
                </button>
              </div>

              {/* Additional Links */}
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  Learn more about our{' '}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms-of-service" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </CookieContext.Provider>
  )
}

// Hook to use cookie context
export function useCookieConsent() {
  const context = useContext(CookieContext)
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieProvider')
  }
  return context
}

// Cookie Settings Button Component
export function CookieSettingsButton() {
  const { showPreferences } = useCookieConsent()

  return (
    <button
      onClick={showPreferences}
      className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-gray-700 transition-colors z-40 shadow-lg"
    >
      Cookie Settings
    </button>
  )
}

// Cookie Banner Component (for custom placement)
export function CookieBanner() {
  const { hasConsented, acceptAll, rejectAll, showPreferences } = useCookieConsent()

  if (hasConsented) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700">
            This website uses cookies to ensure you get the best experience on our website.
          </p>
          <div className="flex gap-2">
            <button
              onClick={showPreferences}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Learn More
            </button>
            <button
              onClick={rejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}