"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/ui/date-picker"
import type { VisaSelectionData } from "@/visa-selection"
import { visaTypesData } from "@/visa-types"
import {
  Monitor,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Loader2,
  StampIcon as Passport,
  MapPin,
} from "lucide-react"
import { useRef } from "react"

interface BookingMonitorProps {
  applicantData: any
  onStatusUpdate: (status: any) => void
  onNotificationUpdate: () => void
  onStatusChange?: (status: string) => void
}

export default function BookingMonitor({
  applicantData,
  onStatusUpdate,
  onNotificationUpdate,
  onStatusChange,
}: BookingMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [monitoringInterval, setMonitoringInterval] = useState(30)
  const [preferredDates, setPreferredDates] = useState<Date[]>([])
  const [preferredTimes, setPreferredTimes] = useState<string[]>([])
  const [autoBook, setAutoBook] = useState(true)
  const [visaSelection, setVisaSelection] = useState<VisaSelectionData | null>(null)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("monitor")
  const [logs, setLogs] = useState<{ timestamp: Date; message: string; type: string }[]>([])
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [settings, setSettings] = useState({
    autoBook: false,
    checkInterval: 30,
    preferredTimes: ["09:00", "10:00", "11:00"],
    locations: ["Algiers", "Oran", "Constantine"],
    webcamEnabled: true,
  })
  const [webcamTrigger, setWebcamTrigger] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    onStatusChange?.(isMonitoring ? "monitoring" : "idle")
  }, [isMonitoring, onStatusChange])

  // Add a new date to preferred dates
  const addPreferredDate = (date: Date | null) => {
    if (date && !preferredDates.some((d) => d.toDateString() === date.toDateString())) {
      setPreferredDates([...preferredDates, date])
      setCurrentDate(null)
    }
  }

  // Remove a date from preferred dates
  const removePreferredDate = (index: number) => {
    setPreferredDates(preferredDates.filter((_, i) => i !== index))
  }

  // Add a new time to preferred times
  const addPreferredTime = (time: string) => {
    if (time && !preferredTimes.includes(time)) {
      setPreferredTimes([...preferredTimes, time])
    }
  }

  // Remove a time from preferred times
  const removePreferredTime = (index: number) => {
    setPreferredTimes(preferredTimes.filter((_, i) => i !== index))
  }

  // Start monitoring for available slots
  const startMonitoring = async () => {
    if (!visaSelection) {
      addLog("Please select visa type, location, and category first", "error")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/booking/start-monitor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visaSelection,
          preferredDates: preferredDates.map((date) => date.toISOString().split("T")[0]),
          preferredTimes,
          monitoringInterval,
          autoBook,
          applicantData,
        }),
      })

      if (response.ok) {
        setIsMonitoring(true)
        addLog("Monitoring started successfully", "success")
        onStatusUpdate({ monitoring: true })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to start monitoring")
      }
    } catch (error) {
      addLog(`Failed to start monitoring: ${error.message}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Stop monitoring
  const stopMonitoring = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/booking/stop-monitor", {
        method: "POST",
      })

      if (response.ok) {
        setIsMonitoring(false)
        addLog("Monitoring stopped", "info")
        onStatusUpdate({ monitoring: false })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to stop monitoring")
      }
    } catch (error) {
      addLog(`Failed to stop monitoring: ${error.message}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Check for available slots manually
  const checkSlots = async () => {
    if (!visaSelection) {
      addLog("Please select visa type, location, and category first", "error")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/booking/check-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visaSelection,
          preferredDates: preferredDates.map((date) => date.toISOString().split("T")[0]),
          preferredTimes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data.slots || [])

        if (data.slots && data.slots.length > 0) {
          addLog(`Found ${data.slots.length} available slots!`, "success")
          onNotificationUpdate()
        } else {
          addLog("No available slots found", "info")
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check slots")
      }
    } catch (error) {
      addLog(`Failed to check slots: ${error.message}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Book a specific slot
  const bookSlot = async (slot: any) => {
    if (!applicantData) {
      addLog("Please complete applicant information first", "error")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/booking/book-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slot,
          visaSelection,
          applicantData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addLog(`Booking successful! Reference: ${data.confirmationNumber}`, "success")
        onNotificationUpdate()
        onStatusUpdate({ totalBookings: 1, successfulBookings: 1 })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to book slot")
      }
    } catch (error) {
      addLog(`Failed to book slot: ${error.message}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Add a log entry
  const addLog = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const newLog = {
      timestamp: new Date(),
      message,
      type,
    }
    setLogs((prevLogs) => [newLog, ...prevLogs])
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get visa type name
  const getVisaTypeName = (id: string) => {
    const visaType = visaTypesData.visaTypes.find((vt) => vt.id === id)
    return visaType?.name || id
  }

  // Get visa subtype name
  const getVisaSubTypeName = (id: string) => {
    const visaSubType = visaTypesData.visaSubTypes.find((vst) => vst.id === id)
    return visaSubType?.name || id
  }

  // Get location name
  const getLocationName = (id: string) => {
    const location = visaTypesData.locations.find((loc) => loc.id === id)
    return location?.name || id
  }

  // Get category name
  const getCategoryName = (id: string) => {
    const category = visaTypesData.applicationCategories.find((cat) => cat.id === id)
    return category?.name || id
  }

  // Check if monitoring can be started
  const canStartMonitoring = () => {
    return visaSelection && (preferredDates.length > 0 || preferredTimes.length > 0) && !isMonitoring && !isLoading
  }

  // Check if a slot matches preferred dates and times
  const isPreferredSlot = (slot: any) => {
    const slotDate = new Date(slot.date).toDateString()
    const isPreferredDate =
      preferredDates.length === 0 || preferredDates.some((date) => date.toDateString() === slotDate)
    const isPreferredTime = preferredTimes.length === 0 || preferredTimes.includes(slot.time)
    return isPreferredDate && isPreferredTime
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Monitor className="w-6 h-6 text-blue-600" />
                BLS Appointment Monitor
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Monitor and book available appointment slots automatically
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isMonitoring ? "default" : "outline"}
                className={isMonitoring ? "bg-green-500 animate-pulse" : ""}
              >
                {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur border shadow-sm">
              <TabsTrigger value="monitor" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="slots" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Available Slots</span>
                {availableSlots.length > 0 && <Badge className="ml-1 bg-green-500">{availableSlots.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Activity Logs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitor" className="space-y-6">
              {!isConfiguring ? (
                <div className="space-y-6">
                  {/* Visa Selection Summary */}
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Visa Selection</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsConfiguring(true)}
                        className="flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Configure
                      </Button>
                    </div>

                    {visaSelection ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Passport className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Visa Type:</span>
                          <Badge variant="outline" className="ml-auto">
                            {getVisaTypeName(visaSelection.visaTypeId)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Passport className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Visa Sub-Type:</span>
                          <Badge variant="outline" className="ml-auto">
                            {getVisaSubTypeName(visaSelection.visaSubTypeId)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Location:</span>
                          <Badge variant="outline" className="ml-auto">
                            {getLocationName(visaSelection.locationId)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Category:</span>
                          <Badge variant="outline" className="ml-auto">
                            {getCategoryName(visaSelection.categoryId)}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          No visa selection configured. Click Configure to set up monitoring.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Preferred Dates & Times */}
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Preferred Dates & Times</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsConfiguring(true)}
                        className="flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Configure
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Dates</h4>
                        {preferredDates.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {preferredDates.map((date, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {date.toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No preferred dates selected (any date)</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Times</h4>
                        {preferredTimes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {preferredTimes.map((time, index) => (
                              <Badge key={index} variant="secondary" className="px-2 py-1">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No preferred times selected (any time)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Monitoring Controls */}
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Monitoring Controls</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Auto-Book Appointments</Label>
                          <p className="text-xs text-gray-500">Automatically book appointments when available</p>
                        </div>
                        <Switch checked={autoBook} onCheckedChange={setAutoBook} disabled={isMonitoring} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Check Interval (seconds)</Label>
                          <p className="text-xs text-gray-500">How often to check for available appointments</p>
                        </div>
                        <Input
                          type="number"
                          value={monitoringInterval}
                          onChange={(e) => setMonitoringInterval(Number(e.target.value))}
                          min={10}
                          max={300}
                          className="w-24 text-right"
                          disabled={isMonitoring}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
                        {isMonitoring ? (
                          <Button
                            onClick={stopMonitoring}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Pause className="w-4 h-4 mr-2" />
                            )}
                            Stop Monitoring
                          </Button>
                        ) : (
                          <Button
                            onClick={startMonitoring}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={!canStartMonitoring() || isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-2" />
                            )}
                            Start Monitoring
                          </Button>
                        )}

                        <Button onClick={checkSlots} variant="outline" disabled={!visaSelection || isLoading}>
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Check Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <Alert className={isMonitoring ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
                    {isMonitoring ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <AlertDescription className={isMonitoring ? "text-green-800" : "text-amber-800"}>
                      {isMonitoring
                        ? `Monitoring active. Checking every ${monitoringInterval} seconds for available slots.`
                        : "Monitoring is currently inactive. Start monitoring to automatically check for available slots."}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Configure your monitoring preferences. Select visa type, location, and preferred dates/times.
                    </AlertDescription>
                  </Alert>

                  {/* Visa Selection Configuration */}
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Visa Selection</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="visaType" className="text-sm font-medium text-gray-700">
                          Visa Type *
                        </Label>
                        <select
                          id="visaType"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={visaSelection?.visaTypeId || ""}
                          onChange={(e) =>
                            setVisaSelection({
                              ...(visaSelection || {
                                visaTypeId: "",
                                visaSubTypeId: "",
                                locationId: "",
                                categoryId: "",
                              }),
                              visaTypeId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select visa type</option>
                          {visaTypesData.visaTypes.map((visaType) => (
                            <option key={visaType.id} value={visaType.id}>
                              {visaType.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="visaSubType" className="text-sm font-medium text-gray-700">
                          Visa Sub-Type *
                        </Label>
                        <select
                          id="visaSubType"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={visaSelection?.visaSubTypeId || ""}
                          onChange={(e) =>
                            setVisaSelection({
                              ...(visaSelection || {
                                visaTypeId: "",
                                visaSubTypeId: "",
                                locationId: "",
                                categoryId: "",
                              }),
                              visaSubTypeId: e.target.value,
                            })
                          }
                          disabled={!visaSelection?.visaTypeId}
                        >
                          <option value="">Select visa sub-type</option>
                          {visaTypesData.visaSubTypes
                            .filter((subType) => subType.typeId === visaSelection?.visaTypeId)
                            .map((subType) => (
                              <option key={subType.id} value={subType.id}>
                                {subType.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                          Location *
                        </Label>
                        <select
                          id="location"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={visaSelection?.locationId || ""}
                          onChange={(e) =>
                            setVisaSelection({
                              ...(visaSelection || {
                                visaTypeId: "",
                                visaSubTypeId: "",
                                locationId: "",
                                categoryId: "",
                              }),
                              locationId: e.target.value,
                            })
                          }
                          disabled={!visaSelection?.visaTypeId}
                        >
                          <option value="">Select location</option>
                          {visaTypesData.locations
                            .filter((location) => location.visaTypeIds.includes(visaSelection?.visaTypeId || ""))
                            .map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                          Category *
                        </Label>
                        <select
                          id="category"
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={visaSelection?.categoryId || ""}
                          onChange={(e) =>
                            setVisaSelection({
                              ...(visaSelection || {
                                visaTypeId: "",
                                visaSubTypeId: "",
                                locationId: "",
                                categoryId: "",
                              }),
                              categoryId: e.target.value,
                            })
                          }
                        >
                          <option value="">Select category</option>
                          {visaTypesData.applicationCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Dates Configuration */}
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Preferred Dates</h3>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-grow">
                          <DatePicker
                            date={currentDate}
                            onSelect={setCurrentDate}
                            placeholder="Select preferred date"
                            disabled={(date) => date < new Date()}
                            className="w-full"
                          />
                        </div>
                        <Button
                          onClick={() => addPreferredDate(currentDate)}
                          disabled={!currentDate}
                          className="whitespace-nowrap"
                        >
                          Add Date
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {preferredDates.map((date, index) => (
                          <Badge key={index} variant="secondary" className="px-2 py-1">
                            {date.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            <XCircle
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => removePreferredDate(index)}
                            />
                          </Badge>
                        ))}
                        {preferredDates.length === 0 && (
                          <p className="text-sm text-gray-500 italic">No preferred dates selected (any date)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Times Configuration */}
                  <div className="p-4 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Preferred Times</h3>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-grow">
                          <Input
                            type="time"
                            id="preferredTime"
                            className="w-full"
                            onChange={(e) => addPreferredTime(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => {
                            const timeInput = document.getElementById("preferredTime") as HTMLInputElement
                            if (timeInput && timeInput.value) {
                              addPreferredTime(timeInput.value)
                              timeInput.value = ""
                            }
                          }}
                          className="whitespace-nowrap"
                        >
                          Add Time
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {preferredTimes.map((time, index) => (
                          <Badge key={index} variant="secondary" className="px-2 py-1">
                            {time}
                            <XCircle
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => removePreferredTime(index)}
                            />
                          </Badge>
                        ))}
                        {preferredTimes.length === 0 && (
                          <p className="text-sm text-gray-500 italic">No preferred times selected (any time)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setIsConfiguring(false)}>Save Configuration</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="slots" className="space-y-6">
              {availableSlots.length > 0 ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {availableSlots.length} available appointment slots found. Click "Book Now" to secure your
                      appointment.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableSlots.map((slot, index) => (
                      <Card
                        key={index}
                        className={`border ${
                          isPreferredSlot(slot) ? "border-green-300 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{formatDate(slot.date)}</span>
                            </div>
                            <Badge variant="outline">{slot.time}</Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {getLocationName(visaSelection?.locationId || "")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Passport className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {getVisaSubTypeName(visaSelection?.visaSubTypeId || "")}
                              </span>
                            </div>
                          </div>

                          {isPreferredSlot(slot) && <Badge className="mb-3 bg-green-500">Preferred Slot</Badge>}

                          <Button
                            onClick={() => bookSlot(slot)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isLoading || !applicantData}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Book Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Available Slots</h3>
                  <p className="text-gray-500 mb-6">
                    No appointment slots are currently available. Start monitoring to be notified when slots become
                    available.
                  </p>
                  <Button onClick={checkSlots} disabled={!visaSelection || isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Check Now
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs" className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Activity Logs</h3>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-sm ${
                          log.type === "success"
                            ? "bg-green-50 text-green-800"
                            : log.type === "error"
                              ? "bg-red-50 text-red-800"
                              : log.type === "warning"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {log.type === "success" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : log.type === "error" ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : log.type === "warning" ? (
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="font-medium">{log.message}</span>
                          <span className="text-xs text-gray-500 ml-auto">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No activity logs yet</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
