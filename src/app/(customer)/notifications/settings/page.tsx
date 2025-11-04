'use client'

import { useState, useEffect } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Bell, Mail, MessageSquare, Send, Smartphone, Moon, Sun, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettings {
  channels: {
    email: { enabled: boolean; verified: boolean }
    sms: { enabled: boolean; verified: boolean }
    whatsapp: { enabled: boolean; verified: boolean }
    push: { enabled: boolean; verified: boolean }
    in_app: { enabled: boolean; verified: boolean }
  }
  quiet_hours: {
    enabled: boolean
    start: string
    end: string
    timezone: string
  }
  marketing_preferences: {
    promotional_emails: boolean
    promotional_sms: boolean
    newsletter: boolean
  }
}

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Send,
  push: Smartphone,
  in_app: Bell,
}

const channelNames = {
  email: 'Email Notifications',
  sms: 'SMS Notifications',
  whatsapp: 'WhatsApp Notifications',
  push: 'Push Notifications',
  in_app: 'In-App Notifications',
}

const channelDescriptions = {
  email: 'Receive notifications via email',
  sms: 'Receive notifications via SMS text messages',
  whatsapp: 'Receive notifications via WhatsApp',
  push: 'Receive push notifications on your devices',
  in_app: 'See notifications when you\'re logged in',
}

const timezones = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
]

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const queryClient = useQueryClient()

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      return data.preferences as NotificationSettings
    },
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })
      if (!response.ok) throw new Error('Failed to update settings')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      toast.success('Settings updated successfully')
      setHasChanges(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update settings')
    }
  })

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings)
    }
  }, [currentSettings])

  const handleChannelToggle = (channel: keyof typeof settings['channels']) => {
    if (!settings) return

    setSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: {
          ...settings.channels[channel],
          enabled: !settings.channels[channel].enabled
        }
      }
    })
    setHasChanges(true)
  }

  const handleQuietHoursToggle = () => {
    if (!settings) return

    setSettings({
      ...settings,
      quiet_hours: {
        ...settings.quiet_hours,
        enabled: !settings.quiet_hours.enabled
      }
    })
    setHasChanges(true)
  }

  const handleQuietHoursChange = (field: 'start' | 'end' | 'timezone', value: string) => {
    if (!settings) return

    setSettings({
      ...settings,
      quiet_hours: {
        ...settings.quiet_hours,
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const handleMarketingToggle = (field: keyof typeof settings['marketing_preferences']) => {
    if (!settings) return

    setSettings({
      ...settings,
      marketing_preferences: {
        ...settings.marketing_preferences,
        [field]: !settings.marketing_preferences[field]
      }
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!settings || !hasChanges) return

    updateSettingsMutation.mutate(settings)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load settings</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateSettingsMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Notification Channels</h2>
          <p className="text-gray-600 mt-1">Choose how you want to receive notifications</p>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(settings.channels).map(([channel, config]) => {
            const Icon = channelIcons[channel as keyof typeof channelIcons]
            const name = channelNames[channel as keyof typeof channelNames]
            const description = channelDescriptions[channel as keyof typeof channelDescriptions]

            return (
              <div key={channel} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${config.enabled ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{name}</h3>
                      {config.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Not Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleChannelToggle(channel as keyof typeof settings['channels'])}
                  disabled={!config.verified && channel !== 'in_app'}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !config.verified && channel !== 'in_app' ? 'opacity-50 cursor-not-allowed' : ''
                  } ${config.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quiet Hours</h2>
          </div>
          <p className="text-gray-600 mt-1">Pause notifications during specific hours</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Enable Quiet Hours</h3>
              <p className="text-sm text-gray-600">Pause notifications during specified hours</p>
            </div>
            <button
              onClick={handleQuietHoursToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.quiet_hours.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.quiet_hours.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.quiet_hours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={settings.quiet_hours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={settings.quiet_hours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.quiet_hours.timezone}
                  onChange={(e) => handleQuietHoursChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Marketing Preferences</h2>
          </div>
          <p className="text-gray-600 mt-1">Control promotional communications</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Promotional Emails</h3>
              <p className="text-sm text-gray-600">Receive special offers and promotions via email</p>
            </div>
            <button
              onClick={() => handleMarketingToggle('promotional_emails')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.marketing_preferences.promotional_emails ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.marketing_preferences.promotional_emails ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Promotional SMS</h3>
              <p className="text-sm text-gray-600">Receive special offers and promotions via SMS</p>
            </div>
            <button
              onClick={() => handleMarketingToggle('promotional_sms')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.marketing_preferences.promotional_sms ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.marketing_preferences.promotional_sms ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Newsletter</h3>
              <p className="text-sm text-gray-600">Receive our monthly newsletter with updates and news</p>
            </div>
            <button
              onClick={() => handleMarketingToggle('newsletter')}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                settings.marketing_preferences.newsletter ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.marketing_preferences.newsletter ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  )
}