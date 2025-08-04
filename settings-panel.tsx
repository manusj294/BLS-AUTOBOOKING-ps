"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Key, Mail, Shield, Zap, Bot, Settings, TestTube } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    // CAPTCHA Settings
    captchaProvider: "2captcha",
    captchaApiKey: "",
    captchaEnabled: true,

    // AI CAPTCHA Settings
    aiCaptchaEnabled: false,
    aiCaptchaProvider: "openai",
    aiCaptchaApiKey: "",
    aiCaptchaModel: "gpt-4-vision-preview",

    // Custom CAPTCHA Settings
    customCaptchaEnabled: false,
    customCaptchaApiUrl: "",
    customCaptchaApiKey: "",
    customCaptchaMethod: "POST",
    customCaptchaHeaders: "{}",
    customCaptchaPayload: "{}",
    customCaptchaResponsePath: "result",

    // EmailJS Settings
    emailjsServiceId: "",
    emailjsTemplateId: "",
    emailjsPublicKey: "",
    emailjsRecipientEmail: "",
    emailNotificationsEnabled: true,

    // Push Notifications
    pushNotificationsEnabled: true,

    // Security Settings
    useProxy: false,
    proxyUrl: "",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    requestDelay: 2000,
    maxRetries: 3,

    // Advanced Settings
    debugMode: false,
    logLevel: "info",
    autoBook: true,
    bookingTimeout: 30000,

    // BLS Security Adaptation
    bypassWAF: true,
    handleCSRF: true,
    randomizeRequests: true,
    sessionPersistence: true,
    smartNavigation: true,
  })

  const [saved, setSaved] = useState(false)
  const [testResults, setTestResults] = useState({})

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    try {
      const response = await fetch("/api/settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error("Save settings error:", error)
    }
  }

  const testCaptcha = async () => {
    try {
      const response = await fetch("/api/captcha/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.captchaProvider,
          apiKey: settings.captchaApiKey,
          aiEnabled: settings.aiCaptchaEnabled,
          aiProvider: settings.aiCaptchaProvider,
          aiApiKey: settings.aiCaptchaApiKey,
          aiModel: settings.aiCaptchaModel,
          customEnabled: settings.customCaptchaEnabled,
          customApiUrl: settings.customCaptchaApiUrl,
          customApiKey: settings.customCaptchaApiKey,
          customMethod: settings.customCaptchaMethod,
          customHeaders: settings.customCaptchaHeaders,
          customPayload: settings.customCaptchaPayload,
          customResponsePath: settings.customCaptchaResponsePath,
        }),
      })

      const result = await response.json()
      setTestResults((prev) => ({ ...prev, captcha: result }))
      alert(result.success ? "✅ CAPTCHA test successful!" : "❌ CAPTCHA test failed: " + result.error)
    } catch (error) {
      alert("❌ CAPTCHA test failed: " + error.message)
    }
  }

  const testEmail = async () => {
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: settings.emailjsServiceId,
          templateId: settings.emailjsTemplateId,
          publicKey: settings.emailjsPublicKey,
          recipientEmail: settings.emailjsRecipientEmail,
        }),
      })

      const result = await response.json()
      setTestResults((prev) => ({ ...prev, email: result }))
      alert(result.success ? "✅ Email test successful!" : "❌ Email test failed: " + result.error)
    } catch (error) {
      alert("❌ Email test failed: " + error.message)
    }
  }

  useEffect(() => {
    // Load saved settings
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings/load")
        if (response.ok) {
          const data = await response.json()
          setSettings((prev) => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error("Load settings error:", error)
      }
    }

    loadSettings()
  }, [])

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              Settings & Configuration
            </div>
            <Button
              onClick={saveSettings}
              className={`shadow-lg ${saved ? "bg-green-600" : "bg-blue-600"} hover:bg-blue-700`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? "✅ Saved!" : "Save Settings"}
            </Button>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure CAPTCHA solver, AI assistance, notifications, and advanced BLS automation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="captcha" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="captcha" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                CAPTCHA
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="captcha" className="space-y-6 mt-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Configure multiple CAPTCHA solving methods with automatic fallback for maximum reliability.
                </AlertDescription>
              </Alert>

              {/* Traditional CAPTCHA Services */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    Traditional CAPTCHA Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="captchaEnabled"
                      checked={settings.captchaEnabled}
                      onCheckedChange={(checked) => updateSetting("captchaEnabled", checked)}
                    />
                    <Label htmlFor="captchaEnabled" className="font-medium">
                      Enable CAPTCHA Solving
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="captchaProvider">CAPTCHA Provider</Label>
                      <select
                        id="captchaProvider"
                        value={settings.captchaProvider}
                        onChange={(e) => updateSetting("captchaProvider", e.target.value)}
                        className="w-full p-2 border rounded-md bg-white mt-1"
                      >
                        <option value="2captcha">2Captcha</option>
                        <option value="anticaptcha">Anti-Captcha</option>
                        <option value="deathbycaptcha">DeathByCaptcha</option>
                        <option value="capmonster">CapMonster</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="captchaApiKey">API Key</Label>
                      <Input
                        id="captchaApiKey"
                        type="password"
                        value={settings.captchaApiKey}
                        onChange={(e) => updateSetting("captchaApiKey", e.target.value)}
                        placeholder="Enter your CAPTCHA service API key"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI CAPTCHA Section */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-green-600" />
                    AI CAPTCHA Solving (Fallback)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="aiCaptchaEnabled"
                      checked={settings.aiCaptchaEnabled}
                      onCheckedChange={(checked) => updateSetting("aiCaptchaEnabled", checked)}
                    />
                    <Label htmlFor="aiCaptchaEnabled" className="font-medium">
                      Enable AI CAPTCHA Solving
                    </Label>
                  </div>

                  {settings.aiCaptchaEnabled && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="aiCaptchaProvider">AI Provider</Label>
                          <select
                            id="aiCaptchaProvider"
                            value={settings.aiCaptchaProvider}
                            onChange={(e) => updateSetting("aiCaptchaProvider", e.target.value)}
                            className="w-full p-2 border rounded-md bg-white mt-1"
                          >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="google">Google (Gemini)</option>
                            <option value="groq">Groq</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="aiCaptchaApiKey">AI API Key</Label>
                          <Input
                            id="aiCaptchaApiKey"
                            type="password"
                            value={settings.aiCaptchaApiKey}
                            onChange={(e) => updateSetting("aiCaptchaApiKey", e.target.value)}
                            placeholder="Enter your AI service API key"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="aiCaptchaModel">AI Model</Label>
                        <select
                          id="aiCaptchaModel"
                          value={settings.aiCaptchaModel}
                          onChange={(e) => updateSetting("aiCaptchaModel", e.target.value)}
                          className="w-full p-2 border rounded-md bg-white mt-1"
                        >
                          {settings.aiCaptchaProvider === "openai" && (
                            <>
                              <option value="gpt-4-vision-preview">GPT-4 Vision Preview</option>
                              <option value="gpt-4o">GPT-4o</option>
                              <option value="gpt-4o-mini">GPT-4o Mini</option>
                            </>
                          )}
                          {settings.aiCaptchaProvider === "anthropic" && (
                            <>
                              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            </>
                          )}
                          {settings.aiCaptchaProvider === "google" && (
                            <>
                              <option value="gemini-pro-vision">Gemini Pro Vision</option>
                              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            </>
                          )}
                          {settings.aiCaptchaProvider === "groq" && (
                            <>
                              <option value="llava-v1.5-7b-4096-preview">LLaVA 1.5 7B</option>
                              <option value="llama-3.2-11b-vision-preview">Llama 3.2 11B Vision</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom CAPTCHA Section */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Custom CAPTCHA API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="customCaptchaEnabled"
                      checked={settings.customCaptchaEnabled}
                      onCheckedChange={(checked) => updateSetting("customCaptchaEnabled", checked)}
                    />
                    <Label htmlFor="customCaptchaEnabled" className="font-medium">
                      Enable Custom CAPTCHA API
                    </Label>
                  </div>

                  {settings.customCaptchaEnabled && (
                    <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customCaptchaApiUrl">Custom API URL</Label>
                          <Input
                            id="customCaptchaApiUrl"
                            value={settings.customCaptchaApiUrl}
                            onChange={(e) => updateSetting("customCaptchaApiUrl", e.target.value)}
                            placeholder="https://your-captcha-api.com/solve"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="customCaptchaApiKey">Custom API Key</Label>
                          <Input
                            id="customCaptchaApiKey"
                            type="password"
                            value={settings.customCaptchaApiKey}
                            onChange={(e) => updateSetting("customCaptchaApiKey", e.target.value)}
                            placeholder="Enter your custom API key"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="customCaptchaMethod">HTTP Method</Label>
                        <select
                          id="customCaptchaMethod"
                          value={settings.customCaptchaMethod}
                          onChange={(e) => updateSetting("customCaptchaMethod", e.target.value)}
                          className="w-full p-2 border rounded-md bg-white mt-1"
                        >
                          <option value="POST">POST</option>
                          <option value="GET">GET</option>
                          <option value="PUT">PUT</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="customCaptchaHeaders">Custom Headers (JSON)</Label>
                        <Textarea
                          id="customCaptchaHeaders"
                          value={settings.customCaptchaHeaders}
                          onChange={(e) => updateSetting("customCaptchaHeaders", e.target.value)}
                          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                          rows={3}
                          className="mt-1 font-mono text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="customCaptchaPayload">Request Payload Template (JSON)</Label>
                        <Textarea
                          id="customCaptchaPayload"
                          value={settings.customCaptchaPayload}
                          onChange={(e) => updateSetting("customCaptchaPayload", e.target.value)}
                          placeholder='{"image": "{IMAGE_BASE64}", "type": "image", "api_key": "{API_KEY}"}'
                          rows={4}
                          className="mt-1 font-mono text-sm"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Use <code className="bg-gray-100 px-1 rounded">{"{IMAGE_BASE64}"}</code> for the CAPTCHA image
                          and <code className="bg-gray-100 px-1 rounded">{"{API_KEY}"}</code> for the API key
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="customCaptchaResponsePath">Response Path</Label>
                        <Input
                          id="customCaptchaResponsePath"
                          value={settings.customCaptchaResponsePath}
                          onChange={(e) => updateSetting("customCaptchaResponsePath", e.target.value)}
                          placeholder="result.text"
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          JSON path to the solved CAPTCHA text in the response (e.g., "result", "data.text")
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={testCaptcha}
                  disabled={!settings.captchaApiKey && !settings.aiCaptchaApiKey && !settings.customCaptchaApiUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test CAPTCHA Services
                </Button>
                {testResults.captcha && (
                  <Badge variant={testResults.captcha.success ? "default" : "destructive"}>
                    {testResults.captcha.success ? "✅ Test Passed" : "❌ Test Failed"}
                  </Badge>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-6">
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Configure email and push notifications to stay informed about booking status and available slots.
                </AlertDescription>
              </Alert>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotificationsEnabled"
                      checked={settings.emailNotificationsEnabled}
                      onCheckedChange={(checked) => updateSetting("emailNotificationsEnabled", checked)}
                    />
                    <Label htmlFor="emailNotificationsEnabled" className="font-medium">
                      Enable Email Notifications
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailjsServiceId">EmailJS Service ID</Label>
                      <Input
                        id="emailjsServiceId"
                        value={settings.emailjsServiceId}
                        onChange={(e) => updateSetting("emailjsServiceId", e.target.value)}
                        placeholder="service_xxxxxxx"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailjsTemplateId">EmailJS Template ID</Label>
                      <Input
                        id="emailjsTemplateId"
                        value={settings.emailjsTemplateId}
                        onChange={(e) => updateSetting("emailjsTemplateId", e.target.value)}
                        placeholder="template_xxxxxxx"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailjsPublicKey">EmailJS Public Key</Label>
                      <Input
                        id="emailjsPublicKey"
                        value={settings.emailjsPublicKey}
                        onChange={(e) => updateSetting("emailjsPublicKey", e.target.value)}
                        placeholder="Your public key"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailjsRecipientEmail">Recipient Email</Label>
                      <Input
                        id="emailjsRecipientEmail"
                        type="email"
                        value={settings.emailjsRecipientEmail}
                        onChange={(e) => updateSetting("emailjsRecipientEmail", e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={testEmail} disabled={!settings.emailjsServiceId} variant="outline">
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Email Service
                    </Button>
                    {testResults.email && (
                      <Badge variant={testResults.email.success ? "default" : "destructive"}>
                        {testResults.email.success ? "✅ Test Passed" : "❌ Test Failed"}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Push Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotificationsEnabled"
                      checked={settings.pushNotificationsEnabled}
                      onCheckedChange={(checked) => updateSetting("pushNotificationsEnabled", checked)}
                    />
                    <Label htmlFor="pushNotificationsEnabled" className="font-medium">
                      Enable Push Notifications
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Browser notifications will be shown for important events like slot availability and booking
                    confirmations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-6">
              <Alert className="border-orange-200 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Configure security settings to bypass BLS anti-bot measures and ensure successful automation.
                </AlertDescription>
              </Alert>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">BLS Security Adaptation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="bypassWAF"
                        checked={settings.bypassWAF}
                        onCheckedChange={(checked) => updateSetting("bypassWAF", checked)}
                      />
                      <Label htmlFor="bypassWAF" className="font-medium">
                        Bypass AWS WAF
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="handleCSRF"
                        checked={settings.handleCSRF}
                        onCheckedChange={(checked) => updateSetting("handleCSRF", checked)}
                      />
                      <Label htmlFor="handleCSRF" className="font-medium">
                        Handle CSRF Tokens
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="randomizeRequests"
                        checked={settings.randomizeRequests}
                        onCheckedChange={(checked) => updateSetting("randomizeRequests", checked)}
                      />
                      <Label htmlFor="randomizeRequests" className="font-medium">
                        Randomize Requests
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sessionPersistence"
                        checked={settings.sessionPersistence}
                        onCheckedChange={(checked) => updateSetting("sessionPersistence", checked)}
                      />
                      <Label htmlFor="sessionPersistence" className="font-medium">
                        Session Persistence
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smartNavigation"
                        checked={settings.smartNavigation}
                        onCheckedChange={(checked) => updateSetting("smartNavigation", checked)}
                      />
                      <Label htmlFor="smartNavigation" className="font-medium">
                        Smart Navigation
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Proxy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useProxy"
                      checked={settings.useProxy}
                      onCheckedChange={(checked) => updateSetting("useProxy", checked)}
                    />
                    <Label htmlFor="useProxy" className="font-medium">
                      Use Proxy
                    </Label>
                  </div>

                  {settings.useProxy && (
                    <div>
                      <Label htmlFor="proxyUrl">Proxy URL</Label>
                      <Input
                        id="proxyUrl"
                        value={settings.proxyUrl}
                        onChange={(e) => updateSetting("proxyUrl", e.target.value)}
                        placeholder="http://proxy:port or socks5://proxy:port"
                        className="mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Request Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="userAgent">User Agent</Label>
                    <Textarea
                      id="userAgent"
                      value={settings.userAgent}
                      onChange={(e) => updateSetting("userAgent", e.target.value)}
                      rows={2}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="requestDelay">Request Delay (ms)</Label>
                      <Input
                        id="requestDelay"
                        type="number"
                        value={settings.requestDelay}
                        onChange={(e) => updateSetting("requestDelay", Number.parseInt(e.target.value))}
                        min="1000"
                        max="10000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxRetries">Max Retries</Label>
                      <Input
                        id="maxRetries"
                        type="number"
                        value={settings.maxRetries}
                        onChange={(e) => updateSetting("maxRetries", Number.parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <Alert className="border-purple-200 bg-purple-50">
                <Zap className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  Advanced settings for debugging, automation behavior, and performance optimization.
                </AlertDescription>
              </Alert>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Automation Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoBook"
                      checked={settings.autoBook}
                      onCheckedChange={(checked) => updateSetting("autoBook", checked)}
                    />
                    <Label htmlFor="autoBook" className="font-medium">
                      Auto-book when slots are found
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="bookingTimeout">Booking Timeout (ms)</Label>
                    <Input
                      id="bookingTimeout"
                      type="number"
                      value={settings.bookingTimeout}
                      onChange={(e) => updateSetting("bookingTimeout", Number.parseInt(e.target.value))}
                      min="10000"
                      max="120000"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum time to wait for booking completion</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Debug & Logging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debugMode"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => updateSetting("debugMode", checked)}
                    />
                    <Label htmlFor="debugMode" className="font-medium">
                      Debug Mode (Show browser)
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <select
                      id="logLevel"
                      value={settings.logLevel}
                      onChange={(e) => updateSetting("logLevel", e.target.value)}
                      className="w-full p-2 border rounded-md bg-white mt-1"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
