"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { User, Settings, Activity, Bell } from "lucide-react"
import ApplicantForm from "@/components/applicant-form"
import BookingMonitor from "@/components/booking-monitor"
import SettingsPanel from "@/components/settings-panel"
import NotificationCenter from "@/components/notification-center"
import PWAInstaller from "@/components/pwa-installer"

export default function Home() {
  const [applicantData, setApplicantData] = useState(null)
  const [monitoringStatus, setMonitoringStatus] = useState("idle")

  const handleApplicantDataChange = useCallback((data: any) => {
    setApplicantData(data)
  }, [])

  const handleMonitoringStatusChange = (status: string) => {
    setMonitoringStatus(status)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BLS Spain Algeria Visa Booking</h1>
          <p className="text-lg text-gray-600 mb-4">Automated appointment booking with smart BLS navigation</p>
          <PWAInstaller />
        </div>

        {/* Status Card */}
        <Card className="mb-8 shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    monitoringStatus === "monitoring" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    System Status: {monitoringStatus === "monitoring" ? "Active Monitoring" : "Standby"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {applicantData?.isGroupBooking
                      ? `Group booking configured for ${applicantData?.numberOfApplicants || 1} applicants`
                      : "Individual booking configured"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ready for BLS automation</p>
                <p className="text-xs text-gray-400">Login credentials configured</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="applicant" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-sm">
            <TabsTrigger value="applicant" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Applicant Form
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Booking Monitor
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicant" className="space-y-6">
            <ApplicantForm onDataChange={handleApplicantDataChange} />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <BookingMonitor applicantData={applicantData} onStatusChange={handleMonitoringStatusChange} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>BLS Spain Algeria Visa Booking PWA v2.0</p>
          <p>Automated booking with smart navigation and family/group support</p>
        </div>
      </div>
    </div>
  )
}
