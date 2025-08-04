"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Trash2, Calendar, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Notification {
  id: string
  type: "slot_found" | "booking_success" | "booking_failed" | "error" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/list")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Load notifications error:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))

      // In a real app, this would make an API call
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
    } catch (error) {
      console.error("Mark as read error:", error)
    }
  }

  const clearAllNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/clear", {
        method: "POST",
      })

      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Clear notifications error:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "slot_found":
        return <Calendar className="w-5 h-5 text-green-600" />
      case "booking_success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "booking_failed":
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "slot_found":
      case "booking_success":
        return "border-green-200 bg-green-50"
      case "booking_failed":
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-xl font-bold">Notification Center</CardTitle>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
          </div>
          {notifications.length > 0 && (
            <Button
              onClick={clearAllNotifications}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
        <CardDescription>Real-time updates about your BLS appointment booking activities</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No notifications yet. Start monitoring to receive real-time updates about available appointment slots.
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-96 w-full">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                    notification.read ? "bg-white" : getNotificationColor(notification.type)
                  } ${!notification.read ? "ring-1 ring-blue-200" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">{notification.title}</h4>
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                          {notification.data?.confirmationNumber && (
                            <Badge variant="outline" className="text-xs">
                              {notification.data.confirmationNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 flex-shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
