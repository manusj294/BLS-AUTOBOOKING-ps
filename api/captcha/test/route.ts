import { type NextRequest, NextResponse } from "next/server"
import { CaptchaSolver } from "@/lib/captcha-solver"

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    console.log("🧪 Testing CAPTCHA configuration:", {
      provider: config.provider,
      aiEnabled: config.aiEnabled,
      customEnabled: config.customEnabled,
    })

    // Create CAPTCHA solver instance
    const solver = new CaptchaSolver({
      provider: config.provider,
      apiKey: config.apiKey,
      aiEnabled: config.aiEnabled,
      aiProvider: config.aiProvider,
      aiApiKey: config.aiApiKey,
      aiModel: config.aiModel,
      customEnabled: config.customEnabled,
      customApiUrl: config.customApiUrl,
      customApiKey: config.customApiKey,
      customMethod: config.customMethod,
      customHeaders: config.customHeaders,
      customPayload: config.customPayload,
      customResponsePath: config.customResponsePath,
    })

    // Test the connection
    const testResult = await solver.testConnection()

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: "CAPTCHA service test successful",
        provider: config.provider,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error,
        provider: config.provider,
      })
    }
  } catch (error) {
    console.error("❌ CAPTCHA test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "CAPTCHA test failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
