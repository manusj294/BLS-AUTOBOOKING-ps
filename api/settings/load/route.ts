import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, this would load from database
    // For now, return default settings
    const defaultSettings = {
      captchaProvider: "2captcha",
      captchaEnabled: true,
      aiCaptchaEnabled: false,
      customCaptchaEnabled: false,
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: true,
      bypassWAF: true,
      handleCSRF: true,
      smartNavigation: true,
      autoBook: true,
      debugMode: false,
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error("❌ Load settings error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load settings",
      },
      { status: 500 },
    )
  }
}
