import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "stop_virtual_webcam.py")

    console.log("🛑 Stopping virtual webcam...")

    // Execute Python script to stop virtual webcam
    const command = `python3 "${scriptPath}"`

    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000, // 10 second timeout
    })

    if (stderr && !stderr.includes("WARNING")) {
      console.error("Stop webcam error:", stderr)
    }

    console.log("✅ Virtual webcam stopped successfully")
    console.log("Python output:", stdout)

    return NextResponse.json({
      success: true,
      message: "Virtual webcam stopped successfully",
      details: stdout,
    })
  } catch (error: any) {
    console.error("❌ Stop virtual webcam error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to stop virtual webcam",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
