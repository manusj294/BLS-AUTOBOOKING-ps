"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Smartphone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  if (isInstalled) {
    return (
      <Alert className="max-w-md mx-auto border-green-200 bg-green-50">
        <Smartphone className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ App installed! You can now use BLS Booking offline.
        </AlertDescription>
      </Alert>
    )
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <Alert className="max-w-md mx-auto border-blue-200 bg-blue-50">
      <Download className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <span>Install this app for offline access</span>
          <Button onClick={handleInstallClick} size="sm" className="ml-3 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
