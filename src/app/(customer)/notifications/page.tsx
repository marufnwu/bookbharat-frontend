'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Client-side only check
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}
import { Bell, Check, X, Trash2, Settings, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

interface NotificationStats {
  total: number
  unread: number
  read: number
}

export default function NotificationsPage() {
  const isClient = useIsClient()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all')
  const queryClient = useQueryClient()

  // Don't render anything on server-side to prevent QueryClient errors
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', selectedFilter],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?filter=${selectedFilter}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      return data.notifications || []
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch notification stats
  const {
    data: stats
  } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    refetchInterval: 60000, // Refresh stats every minute
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async ({ notificationIds, read = true }: { notificationIds: string[], read?: boolean }) => {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds, read })
      })
      if (!response.ok) throw new Error('Failed to update notifications')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success('Notifications updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update notifications')
    }
  })

  // Delete notifications mutation
  const deleteNotificationsMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds })
      })
      if (!response.ok) throw new Error('Failed to delete notifications')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
      toast.success('Notifications deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete notifications')
    }
  })

  // Handle marking as read/unread
  const handleMarkAsRead = (notificationIds: string[], read: boolean = true) => {
    markAsReadMutation.mutate({ notificationIds, read })
  }

  // Handle deleting notifications
  const handleDelete = (notificationIds: string[]) => {
    if (window.confirm('Are you sure you want to delete these notifications?')) {
      deleteNotificationsMutation.mutate(notificationIds)
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'order_shipped':
      case 'order_delivered':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'payment_failed':
      case 'order_cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  // Get notification background color
  const getNotificationBg = (isRead: boolean) => {
    return isRead ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load notifications</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {stats?.unread > 0 && (
              <span className="text-blue-600 font-medium">
                You have {stats.unread} unread notification{stats.unread !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a
            href="/notifications/settings"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.unread || 0}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">{stats?.read || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setSelectedFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFilter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Unread {stats?.unread > 0 && `(${stats.unread})`}
        </button>
        <button
          onClick={() => setSelectedFilter('read')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedFilter === 'read'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Read
        </button>
      </div>

      {/* Bulk Actions */}
      {notifications && notifications.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
              if (unreadIds.length > 0) {
                handleMarkAsRead(unreadIds, true)
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
          <button
            onClick={() => {
              const readIds = notifications.filter(n => n.is_read).map(n => n.id)
              if (readIds.length > 0) {
                handleMarkAsRead(readIds, false)
              }
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Mark All as Unread
          </button>
          <button
            onClick={() => {
              const allIds = notifications.map(n => n.id)
              handleDelete(allIds)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 rounded-lg shadow-sm border border-gray-200 transition-all ${getNotificationBg(notification.is_read)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleMarkAsRead([notification.id], !notification.is_read)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notification.is_read ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete([notification.id])}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {notification.action_url && (
                    <div className="mt-4">
                      <a
                        href={notification.action_url}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No notifications found
            </h2>
            <p className="text-gray-600">
              {selectedFilter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "No notifications yet."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}