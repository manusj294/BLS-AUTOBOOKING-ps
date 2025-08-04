import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { videoPath } = await request.json()

    if (!videoPath) {
      return NextResponse.json({ success: false, error: "Video path is required" }, { status: 400 })
    }

    const scriptPath = path.join(process.cwd(), "scripts", "start_virtual_webcam.py")

    console.log("📹 Starting virtual webcam...")
    console.log("Video source:", videoPath)

    // Execute Python script to start virtual webcam
    const command = `python3 "${scriptPath}" "${videoPath}"`

    // Start the process in background
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Virtual webcam error:", error)
        return
      }
      console.log("Virtual webcam output:", stdout)
      if (stderr) console.log("Virtual webcam stderr:", stderr)
    })

    // Give it a moment to start
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("✅ Virtual webcam started successfully")

    return NextResponse.json({
      success: true,
      message: "Virtual webcam started successfully",
      processId: childProcess.pid,
      videoPath,
    })
  } catch (error: any) {
    console.error("❌ Start virtual webcam error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start virtual webcam",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
