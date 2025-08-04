"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Monitor, History, Camera, Bell, Settings, Activity, CheckCircle, Globe, Smartphone } from "lucide-react"

import ApplicantForm from "@/applicant-form"
import BookingMonitor from "@/booking-monitor"
import BookingHistory from "@/booking-history"
import WebcamSettings from "@/webcam-settings"
import NotificationCenter from "@/notification-center"
import SettingsPanel from "@/settings-panel"
import PWAInstaller from "@/pwa-installer"
import VisaSelection from "@/visa-selection"

export default function BLSVisaBookingAssistant() {
  const [activeTab, setActiveTab] = useState("applicant")
  const [applicantData, setApplicantData] = useState(null)
  const [visaSelectionData, setVisaSelectionData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [systemStatus, setSystemStatus] = useState({
    monitoring: false,
    webcamReady: false,
    lastCheck: null,
    totalBookings: 0,
    successfulBookings: 0,
  })

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications()
    // Set up periodic refresh
    const interval = setInterval(loadNotifications, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/list")
      if (response.ok) {
        const responseText = await response.text()
        // Check if response is HTML (error page) or JSON
        if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
          console.warn("Received HTML response instead of JSON from notifications API")
          // Use fallback mock data
          setNotifications([])
          setUnreadCount(0)
          return
        }

        try {
          const data = JSON.parse(responseText)
          if (data.success) {
            setNotifications(data.data || [])
            setUnreadCount(data.unreadCount || 0)
          } else {
            console.warn("Notifications API returned error:", data.error)
            setNotifications([])
            setUnreadCount(0)
          }
        } catch (parseError) {
          console.warn("Failed to parse notifications response:", parseError)
          setNotifications([])
          setUnreadCount(0)
        }
      } else {
        console.warn("Notifications API returned non-OK status:", response.status)
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.warn("Failed to load notifications:", error)
      // Use fallback mock data for development
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const handleApplicantDataChange = (data) => {
    setApplicantData(data)
  }

  const handleVisaSelectionChange = (data) => {
    setVisaSelectionData(data)
  }

  const handleStatusUpdate = (status) => {
    setSystemStatus((prev) => ({ ...prev, ...status }))
  }

  const getTabBadge = (tab) => {
    switch (tab) {
      case "notifications":
        return unreadCount > 0 ? unreadCount : null
      case "history":
        return systemStatus.totalBookings > 0 ? systemStatus.totalBookings : null
      case "monitor":
        return systemStatus.monitoring ? "●" : null
      default:
        return null
    }
  }

  const getTabBadgeVariant = (tab) => {
    switch (tab) {
      case "notifications":
        return unreadCount > 0 ? "destructive" : "secondary"
      case "monitor":
        return systemStatus.monitoring ? "default" : "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                BLS Spain Algeria Visa Assistant
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Automated visa appointment booking with intelligent webcam integration
              </p>
            </div>
            <div className="flex items-center gap-4">
              <PWAInstaller />
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>System Status</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      systemStatus.monitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {systemStatus.monitoring ? "Monitoring Active" : "Standby"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.totalBookings}</p>
                  </div>
                  <History className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{systemStatus.successfulBookings}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Notifications</p>
                    <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                  </div>
                  <Bell className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Webcam Status</p>
                    <p className="text-sm font-medium text-gray-900">
                      {systemStatus.webcamReady ? "Ready" : "Not Ready"}
                    </p>
                  </div>
                  <Camera className={`w-8 h-8 ${systemStatus.webcamReady ? "text-green-600" : "text-gray-400"}`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur border shadow-sm">
            <TabsTrigger value="visa" className="flex items-center gap-2 relative">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Visa Type</span>
            </TabsTrigger>
            <TabsTrigger value="applicant" className="flex items-center gap-2 relative">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Applicant</span>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2 relative">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Monitor</span>
              {getTabBadge("monitor") && (
                <Badge
                  variant={getTabBadgeVariant("monitor")}
                  className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5"
                >
                  {getTabBadge("monitor")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 relative">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {getTabBadge("history") && (
                <Badge
                  variant={getTabBadgeVariant("history")}
                  className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5"
                >
                  {getTabBadge("history")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="webcam" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Webcam</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              {getTabBadge("notifications") && (
                <Badge
                  variant={getTabBadgeVariant("notifications")}
                  className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5"
                >
                  {getTabBadge("notifications")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visa" className="space-y-6">
            <VisaSelection onVisaSelected={handleVisaSelectionChange} initialData={visaSelectionData} />
          </TabsContent>

          <TabsContent value="applicant" className="space-y-6">
            <ApplicantForm onDataChange={handleApplicantDataChange} />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <BookingMonitor
              applicantData={applicantData}
              onStatusUpdate={handleStatusUpdate}
              onNotificationUpdate={loadNotifications}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <BookingHistory onStatusUpdate={handleStatusUpdate} />
          </TabsContent>

          <TabsContent value="webcam" className="space-y-6">
            <WebcamSettings onStatusUpdate={handleStatusUpdate} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter
              notifications={notifications}
              onNotificationUpdate={loadNotifications}
              onUnreadCountChange={setUnreadCount}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>© 2024 BLS Visa Assistant</span>
              <span>•</span>
              <span>Automated Booking System</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>PWA Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
