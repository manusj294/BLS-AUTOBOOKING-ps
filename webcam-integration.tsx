"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Video, Play, Square, CheckCircle, AlertCircle, Clock, Bot, Eye, Monitor, Loader2 } from "lucide-react"

interface WebcamStatus {
  livenessVideo: "idle" | "generating" | "ready" | "error"
  virtualWebcam: "idle" | "starting" | "active" | "error"
  browserBot: "idle" | "launching" | "active" | "completed" | "error"
}

interface ActivityLog {
  id: string
  timestamp: string
  type: "info" | "success" | "warning" | "error"
  message: string
}

interface WebcamIntegrationProps {
  applicantData?: any
  onStatusChange?: (status: string) => void
  autoTrigger?: boolean
}

export default function WebcamIntegration({
  applicantData,
  onStatusChange,
  autoTrigger = false,
}: WebcamIntegrationProps) {
  const [status, setStatus] = useState<WebcamStatus>({
    livenessVideo: "idle",
    virtualWebcam: "idle",
    browserBot: "idle",
  })
  const [progress, setProgress] = useState(0)
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-trigger when needed
  useEffect(() => {
    if (autoTrigger && applicantData?.idPhoto && !isRunning) {
      handleStartWebcamWorkflow()
    }
  }, [autoTrigger, applicantData])

  const addToLog = (type: ActivityLog["type"], message: string) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    }
    setActivityLog((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
  }

  const updateStatus = (component: keyof WebcamStatus, newStatus: WebcamStatus[keyof WebcamStatus]) => {
    setStatus((prev) => ({ ...prev, [component]: newStatus }))
    onStatusChange?.(newStatus as string)
  }

  const handleStartWebcamWorkflow = async () => {
    if (!applicantData?.idPhoto) {
      setError("ID photo is required for webcam verification")
      addToLog("error", "ID photo missing - cannot start webcam workflow")
      return
    }

    setIsRunning(true)
    setError(null)
    setProgress(0)
    addToLog("info", "Starting webcam verification workflow...")

    try {
      // Step 1: Generate liveness video
      addToLog("info", "Generating animated liveness video from ID photo...")
      updateStatus("livenessVideo", "generating")
      setProgress(10)

      const livenessResponse = await fetch("/api/webcam/generate-liveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPhotoPath: applicantData.idPhoto,
          outputPath: "/tmp/liveness_video.mp4",
        }),
      })

      if (!livenessResponse.ok) {
        throw new Error("Failed to generate liveness video")
      }

      const livenessData = await livenessResponse.json()
      updateStatus("livenessVideo", "ready")
      addToLog("success", `Liveness video generated: ${livenessData.outputPath}`)
      setProgress(40)

      // Step 2: Start virtual webcam
      addToLog("info", "Starting virtual webcam with generated video...")
      updateStatus("virtualWebcam", "starting")

      const webcamResponse = await fetch("/api/webcam/start-virtual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoPath: livenessData.outputPath,
        }),
      })

      if (!webcamResponse.ok) {
        throw new Error("Failed to start virtual webcam")
      }

      updateStatus("virtualWebcam", "active")
      addToLog("success", "Virtual webcam is now active and streaming")
      setProgress(70)

      // Step 3: Launch browser automation
      addToLog("info", "Launching browser automation for selfie capture...")
      updateStatus("browserBot", "launching")

      const botResponse = await fetch("/api/webcam/launch-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantData,
          idPhotoPath: applicantData.idPhoto,
        }),
      })

      if (!botResponse.ok) {
        throw new Error("Failed to launch browser bot")
      }

      const botData = await botResponse.json()
      updateStatus("browserBot", "completed")
      addToLog("success", `Browser automation completed: ${botData.message}`)
      setProgress(100)

      addToLog("success", "Webcam verification workflow completed successfully!")
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred"
      setError(errorMessage)
      addToLog("error", `Workflow failed: ${errorMessage}`)

      // Update all statuses to error
      updateStatus("livenessVideo", "error")
      updateStatus("virtualWebcam", "error")
      updateStatus("browserBot", "error")
    } finally {
      setIsRunning(false)
    }
  }

  const handleStopWebcam = async () => {
    try {
      addToLog("info", "Stopping virtual webcam...")

      const response = await fetch("/api/webcam/stop-virtual", {
        method: "POST",
      })

      if (response.ok) {
        updateStatus("virtualWebcam", "idle")
        updateStatus("browserBot", "idle")
        addToLog("success", "Virtual webcam stopped successfully")
      }
    } catch (error: any) {
      addToLog("error", `Failed to stop webcam: ${error.message}`)
    }
  }

  const getStatusIcon = (componentStatus: string) => {
    switch (componentStatus) {
      case "generating":
      case "starting":
      case "launching":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case "ready":
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (componentStatus: string) => {
    switch (componentStatus) {
      case "generating":
      case "starting":
      case "launching":
        return "bg-blue-100 text-blue-800"
      case "ready":
      case "active":
      case "completed":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLogIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            Webcam Integration System
          </CardTitle>
          <CardDescription>Automated liveness verification for BLS Spain Algeria selfie requirements</CardDescription>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Liveness Video</span>
              </div>
              {getStatusIcon(status.livenessVideo)}
            </div>
            <Badge className={`mt-2 ${getStatusColor(status.livenessVideo)}`}>
              {status.livenessVideo.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Virtual Webcam</span>
              </div>
              {getStatusIcon(status.virtualWebcam)}
            </div>
            <Badge className={`mt-2 ${getStatusColor(status.virtualWebcam)}`}>
              {status.virtualWebcam.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-green-600" />
                <span className="font-medium">Browser Bot</span>
              </div>
              {getStatusIcon(status.browserBot)}
            </div>
            <Badge className={`mt-2 ${getStatusColor(status.browserBot)}`}>{status.browserBot.toUpperCase()}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Workflow Progress</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleStartWebcamWorkflow}
          disabled={isRunning || !applicantData?.idPhoto}
          className="flex items-center gap-2"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Running Workflow..." : "Start Webcam Workflow"}
        </Button>

        <Button
          onClick={handleStopWebcam}
          variant="outline"
          disabled={status.virtualWebcam !== "active"}
          className="flex items-center gap-2 bg-transparent"
        >
          <Square className="w-4 h-4" />
          Stop Virtual Webcam
        </Button>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Real-time updates from the webcam verification process</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full">
            {activityLog.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No activity yet. Start the webcam workflow to see logs.
              </div>
            ) : (
              <div className="space-y-2">
                {activityLog.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            log.type === "success"
                              ? "border-green-200 text-green-700"
                              : log.type === "error"
                                ? "border-red-200 text-red-700"
                                : log.type === "warning"
                                  ? "border-yellow-200 text-yellow-700"
                                  : "border-blue-200 text-blue-700"
                          }`}
                        >
                          {log.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Requirements Info */}
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          <strong>Requirements:</strong> ID photo uploaded, Python environment with required packages, and virtual
          camera drivers installed. The system will automatically handle BLS webcam verification when booking
          appointments.
        </AlertDescription>
      </Alert>
    </div>
  )
}
