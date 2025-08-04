"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, Settings, TestTube, CheckCircle, XCircle, AlertCircle, Play, Download, RefreshCw } from "lucide-react"

interface WebcamSettings {
  enabled: boolean
  videoQuality: "720p" | "1080p"
  videoDuration: number
  animationIntensity: number
  virtualCameraDevice: string
  autoTrigger: boolean
  debugMode: boolean
  saveVideos: boolean
  outputPath: string
}

interface TestResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export default function WebcamSettings() {
  const [settings, setSettings] = useState<WebcamSettings>({
    enabled: true,
    videoQuality: "720p",
    videoDuration: 10,
    animationIntensity: 50,
    virtualCameraDevice: "OBS Virtual Camera",
    autoTrigger: true,
    debugMode: false,
    saveVideos: true,
    outputPath: "./webcam_videos",
  })

  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/webcam/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data.settings })
      }
    } catch (error) {
      console.error("Failed to load webcam settings:", error)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/webcam/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const runSystemTests = async () => {
    setTesting(true)
    setTestResults([])

    const tests = [
      { name: "Python Environment", endpoint: "/api/webcam/test/python" },
      { name: "Dependencies", endpoint: "/api/webcam/test/dependencies" },
      { name: "Virtual Camera", endpoint: "/api/webcam/test/device" },
    ]

    for (const test of tests) {
      try {
        const response = await fetch(test.endpoint)
        const data = await response.json()

        setTestResults((prev) => [
          ...prev,
          {
            name: test.name,
            status: data.success ? "success" : "error",
            message: data.message,
            details: data.details,
          },
        ])
      } catch (error) {
        setTestResults((prev) => [
          ...prev,
          {
            name: test.name,
            status: "error",
            message: "Test failed to run",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        ])
      }
    }

    setTesting(false)
  }

  const getTestIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getTestBadgeColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webcam Settings</h2>
          <p className="text-gray-600">Configure webcam automation for BLS booking verification</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Webcam Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="webcam-enabled" className="text-base font-medium">
                    Enable Webcam Integration
                  </Label>
                  <p className="text-sm text-gray-600">Automatically handle webcam verification during booking</p>
                </div>
                <Switch
                  id="webcam-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="video-quality">Video Quality</Label>
                  <Select
                    value={settings.videoQuality}
                    onValueChange={(value: "720p" | "1080p") => setSettings({ ...settings, videoQuality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (Recommended)</SelectItem>
                      <SelectItem value="1080p">1080p (High Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-duration">Video Duration (seconds)</Label>
                  <Input
                    id="video-duration"
                    type="number"
                    min="5"
                    max="30"
                    value={settings.videoDuration}
                    onChange={(e) => setSettings({ ...settings, videoDuration: Number.parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Animation Intensity: {settings.animationIntensity}%</Label>
                <Slider
                  value={[settings.animationIntensity]}
                  onValueChange={([value]) => setSettings({ ...settings, animationIntensity: value })}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">Controls how much the face moves during liveness simulation</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-trigger" className="text-base font-medium">
                    Auto-trigger Webcam
                  </Label>
                  <p className="text-sm text-gray-600">Automatically start webcam when booking requires verification</p>
                </div>
                <Switch
                  id="auto-trigger"
                  checked={settings.autoTrigger}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoTrigger: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="virtual-camera">Virtual Camera Device</Label>
                <Select
                  value={settings.virtualCameraDevice}
                  onValueChange={(value) => setSettings({ ...settings, virtualCameraDevice: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBS Virtual Camera">OBS Virtual Camera</SelectItem>
                    <SelectItem value="ManyCam Virtual Webcam">ManyCam Virtual Webcam</SelectItem>
                    <SelectItem value="XSplit VCam">XSplit VCam</SelectItem>
                    <SelectItem value="Custom">Custom Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="output-path">Video Output Path</Label>
                <Input
                  id="output-path"
                  value={settings.outputPath}
                  onChange={(e) => setSettings({ ...settings, outputPath: e.target.value })}
                  placeholder="./webcam_videos"
                />
                <p className="text-sm text-gray-600">Directory where generated videos will be saved</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="save-videos" className="text-base font-medium">
                    Save Generated Videos
                  </Label>
                  <p className="text-sm text-gray-600">Keep copies of generated liveness videos</p>
                </div>
                <Switch
                  id="save-videos"
                  checked={settings.saveVideos}
                  onCheckedChange={(checked) => setSettings({ ...settings, saveVideos: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode" className="text-base font-medium">
                    Debug Mode
                  </Label>
                  <p className="text-sm text-gray-600">Enable detailed logging and debugging features</p>
                </div>
                <Switch
                  id="debug-mode"
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                System Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Test your system compatibility and webcam setup before using the automation.
                </p>
                <Button onClick={runSystemTests} disabled={testing} className="flex items-center gap-2">
                  {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {testing ? "Testing..." : "Run Tests"}
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Test Results:</h3>
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTestIcon(result.status)}
                          <span className="font-medium">{result.name}</span>
                        </div>
                        <Badge className={getTestBadgeColor(result.status)}>{result.status.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{result.message}</p>
                      {result.details && (
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer">Details</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">{result.details}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!testing && testResults.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Run Tests" to check your system compatibility for webcam automation.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help */}
        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">1. Install Python Dependencies</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm">pip install -r scripts/requirements.txt</code>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">2. Install Virtual Camera Software</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>
                    • <strong>OBS Studio</strong> - Free, recommended option
                  </li>
                  <li>
                    • <strong>ManyCam</strong> - Commercial option with more features
                  </li>
                  <li>
                    • <strong>XSplit VCam</strong> - Professional streaming solution
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">3. Configure Virtual Camera</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Start your virtual camera software</li>
                  <li>• Enable virtual camera output</li>
                  <li>• Test that the virtual camera appears in browser</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">4. Test the System</h3>
                <p className="text-sm text-gray-600">
                  Use the Testing tab to verify all components are working correctly before starting automation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-red-600">Common Issues:</h3>
                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                  <li>
                    <strong>Python not found:</strong> Ensure Python 3.8+ is installed and in your PATH
                  </li>
                  <li>
                    <strong>Virtual camera not detected:</strong> Restart your browser after installing virtual camera
                    software
                  </li>
                  <li>
                    <strong>Permission denied:</strong> Grant camera permissions to your browser
                  </li>
                  <li>
                    <strong>Video generation fails:</strong> Check that all Python dependencies are installed
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
