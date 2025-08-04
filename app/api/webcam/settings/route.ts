import { type NextRequest, NextResponse } from "next/server"

// Mock webcam settings storage
let webcamSettings = {
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
  lastUpdated: new Date().toISOString(),
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: webcamSettings,
    })
  } catch (error) {
    console.error("Error loading webcam settings:", error)
    return NextResponse.json({ success: false, error: "Failed to load webcam settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSettings = await request.json()

    // Update settings
    webcamSettings = {
      ...webcamSettings,
      ...newSettings,
      lastUpdated: new Date().toISOString(),
    }

    console.log("📹 Webcam settings updated:", webcamSettings)

    return NextResponse.json({
      success: true,
      message: "Webcam settings updated successfully",
      data: webcamSettings,
    })
  } catch (error) {
    console.error("Error updating webcam settings:", error)
    return NextResponse.json({ success: false, error: "Failed to update webcam settings" }, { status: 500 })
  }
}
