import { type NextRequest, NextResponse } from "next/server"

// Mock storage for settings (in production, use a database)
let webcamSettings = {
  enabled: true,
  videoQuality: "720p",
  videoDuration: 10,
  animationIntensity: 50,
  virtualCameraDevice: "OBS Virtual Camera",
  autoTrigger: true,
  debugMode: false,
  saveVideos: true,
  outputPath: "./webcam_videos",
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: webcamSettings,
    })
  } catch (error) {
    console.error("Failed to get webcam settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get settings",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json()

    // Validate settings
    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          error: "Settings data is required",
        },
        { status: 400 },
      )
    }

    // Update settings (in production, save to database)
    webcamSettings = { ...webcamSettings, ...settings }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: webcamSettings,
    })
  } catch (error) {
    console.error("Failed to save webcam settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save settings",
      },
      { status: 500 },
    )
  }
}
