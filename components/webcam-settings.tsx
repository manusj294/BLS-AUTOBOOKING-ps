"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Camera,
  Settings,
  Play,
  Square,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Monitor,
  Zap,
  Eye,
  RefreshCw,
  Download,
} from "lucide-react"

interface WebcamSettingsProps {
  onStatusUpdate?: (status: any) => void
}

export default function WebcamSettings({ onStatusUpdate }: WebcamSettingsProps) {
  const [settings, setSettings] = useState({
    virtualWebcamEnabled: false,
    livenessDetectionEnabled: true,
    faceRecognitionEnabled: true,
    autoLivenessGeneration: false,
    webcamDevice: "default",
    resolution: "1280x720",
    frameRate: 30,
    brightness: 50,
    contrast: 50,
    saturation: 50,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testResults, setTestResults] = useState({
    python: null,
    dependencies: null,
    device: null,
  })
  const [isVirtualWebcamRunning, setIsVirtualWebcamRunning] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    ready: false,
    issues: [],
  })

  useEffect(() => {
    loadSettings()
    runSystemTests()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/webcam/settings")
      if (response.ok) {
        const responseText = await response.text()
        try {
          const data = JSON.parse(responseText)
          if (data.success && data.data) {
            setSettings(data.data)
          }
        } catch (parseError) {
          console.warn("Failed to parse webcam settings response:", parseError)
        }
      } else {
        console.warn("Webcam settings API returned non-OK status:", response.status)
      }
    } catch (error) {
      console.error("Failed to load webcam settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/webcam/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update parent component
          if (onStatusUpdate) {
            onStatusUpdate({
              webcamReady: systemStatus.ready,
              virtualWebcamRunning: isVirtualWebcamRunning,
            })
          }
        }
      }
    } catch (error) {
      console.error("Failed to save webcam settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const runSystemTests = async () => {
    setIsLoading(true)
    const results = { python: null, dependencies: null, device: null }

    // Test Python
    try {
      const pythonResponse = await fetch("/api/webcam/test/python")
      results.python = await pythonResponse.json()
    } catch (error) {
      results.python = { success: false, error: "Failed to test Python" }
    }

    // Test Dependencies
    try {
      const depsResponse = await fetch("/api/webcam/test/dependencies")
      results.dependencies = await depsResponse.json()
    } catch (error) {
      results.dependencies = { success: false, error: "Failed to test dependencies" }
    }

    // Test Device
    try {
      const deviceResponse = await fetch("/api/webcam/test/device")
      results.device = await deviceResponse.json()
    } catch (error) {
      results.device = { success: false, error: "Failed to test webcam device" }
    }

    setTestResults(results)

    // Update system status
    const issues = []
    if (!results.python?.success) issues.push("Python environment")
    if (!results.dependencies?.success) issues.push("Required packages")
    if (!results.device?.success) issues.push("Webcam device")

    const newStatus = {
      ready: issues.length === 0,
      issues: issues,
    }

    setSystemStatus(newStatus)
    setIsLoading(false)

    // Update parent component
    if (onStatusUpdate) {
      onStatusUpdate({
        webcamReady: newStatus.ready,
        virtualWebcamRunning: isVirtualWebcamRunning,
      })
    }
  }

  const startVirtualWebcam = async () => {
    try {
      const response = await fetch("/api/webcam/start-virtual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsVirtualWebcamRunning(true)
          if (onStatusUpdate) {
            onStatusUpdate({
              webcamReady: systemStatus.ready,
              virtualWebcamRunning: true,
            })
          }
        }
      }
    } catch (error) {
      console.error("Failed to start virtual webcam:", error)
    }
  }

  const stopVirtualWebcam = async () => {
    try {
      const response = await fetch("/api/webcam/stop-virtual", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsVirtualWebcamRunning(false)
          if (onStatusUpdate) {
            onStatusUpdate({
              webcamReady: systemStatus.ready,
              virtualWebcamRunning: false,
            })
          }
        }
      }
    } catch (error) {
      console.error("Failed to stop virtual webcam:", error)
    }
  }

  const generateLivenessVideo = async () => {
    try {
      const response = await fetch("/api/webcam/generate-liveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: 30,
          movements: ["blink", "smile", "turn_left", "turn_right", "nod"],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert("Liveness video generated successfully!")
        }
      }
    } catch (error) {
      console.error("Failed to generate liveness video:", error)
    }
  }

  const launchBot = async () => {
    try {
      const response = await fetch("/api/webcam/launch-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settings,
          mode: "bls_automation",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert("BLS automation bot launched successfully!")
        }
      }
    } catch (error) {
      console.error("Failed to launch bot:", error)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const getStatusIcon = (result: any) => {
    if (!result) return <AlertCircle className="w-4 h-4 text-gray-400" />
    if (result.success) return <CheckCircle className="w-4 h-4 text-green-500" />
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = (result: any) => {
    if (!result) return <Badge variant="secondary">Testing...</Badge>
    if (result.success) return <Badge className="bg-green-500">Ready</Badge>
    return <Badge variant="destructive">Error</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing webcam system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-600" />
            Webcam System Status
          </CardTitle>
          <CardDescription>Advanced webcam integration for BLS visa automation with liveness detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.python)}
                <div>
                  <p className="font-medium">Python Environment</p>
                  <p className="text-sm text-gray-500">{testResults.python?.data?.pythonVersion || "Testing..."}</p>
                </div>
              </div>
              {getStatusBadge(testResults.python)}
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.dependencies)}
                <div>
                  <p className="font-medium">Dependencies</p>
                  <p className="text-sm text-gray-500">
                    {testResults.dependencies?.data?.installed?.length || 0} packages installed
                  </p>
                </div>
              </div>
              {getStatusBadge(testResults.dependencies)}
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.device)}
                <div>
                  <p className="font-medium">Webcam Device</p>
                  <p className="text-sm text-gray-500">{testResults.device?.data?.resolution || "Testing..."}</p>
                </div>
              </div>
              {getStatusBadge(testResults.device)}
            </div>
          </div>

          {/* System Status Alert */}
          {systemStatus.issues.length > 0 ? (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>System Issues Detected:</strong> {systemStatus.issues.join(", ")}. Please resolve these issues
                before using webcam features.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>System Ready:</strong> All webcam components are working properly. You can now use advanced
                webcam features.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={runSystemTests} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Retest System
            </Button>
            {systemStatus.ready && (
              <Button onClick={launchBot} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Launch BLS Bot
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Virtual Webcam Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Virtual Webcam Control
          </CardTitle>
          <CardDescription>Control virtual webcam for BLS automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Virtual Webcam Status</Label>
              <p className="text-sm text-gray-500">
                {isVirtualWebcamRunning ? "Virtual webcam is running" : "Virtual webcam is stopped"}
              </p>
            </div>
            <Badge variant={isVirtualWebcamRunning ? "default" : "secondary"}>
              {isVirtualWebcamRunning ? "Running" : "Stopped"}
            </Badge>
          </div>

          <div className="flex gap-2">
            {!isVirtualWebcamRunning ? (
              <Button
                onClick={startVirtualWebcam}
                disabled={!systemStatus.ready}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Virtual Webcam
              </Button>
            ) : (
              <Button onClick={stopVirtualWebcam} variant="destructive" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Stop Virtual Webcam
              </Button>
            )}
            <Button
              onClick={generateLivenessVideo}
              disabled={!systemStatus.ready}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Eye className="w-4 h-4" />
              Generate Liveness Video
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webcam Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Webcam Configuration
          </CardTitle>
          <CardDescription>Configure webcam settings for optimal performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Virtual Webcam</Label>
                <p className="text-sm text-gray-500">Enable virtual webcam functionality</p>
              </div>
              <Switch
                checked={settings.virtualWebcamEnabled}
                onCheckedChange={(checked) => updateSetting("virtualWebcamEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Liveness Detection</Label>
                <p className="text-sm text-gray-500">Enable AI-powered liveness detection</p>
              </div>
              <Switch
                checked={settings.livenessDetectionEnabled}
                onCheckedChange={(checked) => updateSetting("livenessDetectionEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Face Recognition</Label>
                <p className="text-sm text-gray-500">Enable face recognition features</p>
              </div>
              <Switch
                checked={settings.faceRecognitionEnabled}
                onCheckedChange={(checked) => updateSetting("faceRecognitionEnabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Auto Liveness Generation</Label>
                <p className="text-sm text-gray-500">Automatically generate liveness videos</p>
              </div>
              <Switch
                checked={settings.autoLivenessGeneration}
                onCheckedChange={(checked) => updateSetting("autoLivenessGeneration", checked)}
              />
            </div>
          </div>

          {/* Device Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Webcam Device</Label>
              <Select value={settings.webcamDevice} onValueChange={(value) => updateSetting("webcamDevice", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select webcam device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Camera</SelectItem>
                  <SelectItem value="0">Camera 0</SelectItem>
                  <SelectItem value="1">Camera 1</SelectItem>
                  <SelectItem value="2">Camera 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Resolution</Label>
              <Select value={settings.resolution} onValueChange={(value) => updateSetting("resolution", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="640x480">640x480 (VGA)</SelectItem>
                  <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                  <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Quality Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Image Quality</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium">Brightness: {settings.brightness}%</Label>
                <Slider
                  value={[settings.brightness]}
                  onValueChange={(value) => updateSetting("brightness", value[0])}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Contrast: {settings.contrast}%</Label>
                <Slider
                  value={[settings.contrast]}
                  onValueChange={(value) => updateSetting("contrast", value[0])}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Saturation: {settings.saturation}%</Label>
                <Slider
                  value={[settings.saturation]}
                  onValueChange={(value) => updateSetting("saturation", value[0])}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Save Settings */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Details */}
      {(testResults.python || testResults.dependencies || testResults.device) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              System Test Results
            </CardTitle>
            <CardDescription>Detailed test results and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.python && !testResults.python.success && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Python Environment Issue:</strong> {testResults.python.error}
                  {testResults.python.recommendations && (
                    <ul className="list-disc list-inside mt-2">
                      {testResults.python.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {testResults.dependencies && !testResults.dependencies.success && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Dependencies Issue:</strong> {testResults.dependencies.error}
                  {testResults.dependencies.data?.installCommand && (
                    <div className="mt-2">
                      <p>Run this command to install missing packages:</p>
                      <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">
                        {testResults.dependencies.data.installCommand}
                      </code>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {testResults.device && !testResults.device.success && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Webcam Device Issue:</strong> {testResults.device.error}
                  {testResults.device.recommendations && (
                    <ul className="list-disc list-inside mt-2">
                      {testResults.device.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
