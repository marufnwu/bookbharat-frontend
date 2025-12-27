'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, X, Check, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const queryClient = useQueryClient()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const webSocketRef = useRef<WebSocket | null>(null)

  // Fetch unread notifications count
  const { data: stats } = useQuery({
    queryKey: ['notification-stats-bell'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/notifications/stats')
        if (!response.ok) return { unread: 0 }
        const data = await response.json()
        return data.stats
      } catch {
        return { unread: 0 }
      }
    },
    refetchInterval: 60000, // Refresh every minute
  })

  // Fetch recent notifications for dropdown
  const { data: recentNotifications, isLoading } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/notifications?filter=unread&per_page=5')
        if (!response.ok) return []
        const data = await response.json()
        return data.notifications || []
      } catch {
        return []
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isOpen,
  })

  // Update unread count when stats change
  useEffect(() => {
    if (stats?.unread !== undefined) {
      setUnreadCount(stats.unread)
    }
  }, [stats])

  // WebSocket connection for real-time notifications
  useEffect(() => {
    // Only establish WebSocket if user is logged in
    const token = localStorage.getItem('auth_token')
    if (!token) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:6001'}/app/notifications`

    try {
      webSocketRef.current = new WebSocket(wsUrl)

      webSocketRef.current.onopen = () => {
        setReconnectAttempts(0)
      }

      webSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'new_notification') {
            // Show toast notification
            toast.success(data.notification.title, {
              description: data.notification.message,
              action: data.notification.action_url && (
                <Link
                  href={data.notification.action_url}
                  className="underline"
                >
                  View
                </Link>
              ),
            })

            // Increment unread count
            setUnreadCount(prev => prev + 1)

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
            queryClient.invalidateQueries({ queryKey: ['notification-stats-bell'] })
            queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      webSocketRef.current.onclose = () => {
        setReconnectAttempts(prev => prev + 1)
      }

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close()
        webSocketRef.current = null
      }
    }
  }, [queryClient])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle marking as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: [notificationId], read: true })
      })

      if (response.ok) {
        setUnreadCount(prev => Math.max(0, prev - 1))
        queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notification-stats-bell'] })
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_ids: recentNotifications?.map((n: Notification) => n.id) || [],
          read: true
        })
      })

      if (response.ok) {
        setUnreadCount(0)
        queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
        queryClient.invalidateQueries({ queryKey: ['notification-stats-bell'] })
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'order_shipped':
      case 'order_delivered':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'payment_failed':
      case 'order_cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentNotifications && recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentNotifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>

                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  {unreadCount > 0 ? 'Loading notifications...' : 'No new notifications'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}