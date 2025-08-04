import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import { existsSync } from "fs"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { device } = await request.json()

    if (!device) {
      return NextResponse.json({ success: false, error: "Device path is required" }, { status: 400 })
    }

    console.log("📹 Testing virtual camera device:", device)

    // Check if device exists (Linux/Unix systems)
    if (device.startsWith("/dev/")) {
      const deviceExists = existsSync(device)

      if (!deviceExists) {
        return NextResponse.json({
          success: false,
          error: "Virtual camera device not found",
          details: `Device ${device} does not exist`,
          suggestion: "Install v4l2loopback: sudo apt install v4l2loopback-dkms && sudo modprobe v4l2loopback",
        })
      }

      // Test device accessibility
      try {
        const { stdout, stderr } = await execAsync(`ls -la ${device}`, {
          timeout: 5000,
        })

        console.log("✅ Device accessible:", stdout.trim())

        return NextResponse.json({
          success: true,
          message: "Virtual camera device is accessible",
          device,
          details: stdout.trim(),
        })
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: "Device access test failed",
          details: error.message,
        })
      }
    } else {
      // For Windows or other systems, just return success
      // In a real implementation, you'd test Windows virtual camera devices
      return NextResponse.json({
        success: true,
        message: "Virtual camera device configured",
        device,
        details: "Device path configured for non-Unix system",
      })
    }
  } catch (error: any) {
    console.error("❌ Device test failed:", error)

    return NextResponse.json({
      success: false,
      error: "Virtual camera device test failed",
      details: error.message,
    })
  }
}

export async function GET() {
  try {
    // This is a mock test since we can't actually test virtual camera from server-side
    // In a real implementation, this would use a Python script to test camera access

    return NextResponse.json({
      success: true,
      message: "Virtual camera test completed",
      details: "Note: This is a mock test. Please verify virtual camera manually in browser settings.",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to test virtual camera device",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
