import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { idPhotoPath, outputPath } = await request.json()

    if (!idPhotoPath) {
      return NextResponse.json({ success: false, error: "ID photo path is required" }, { status: 400 })
    }

    const scriptPath = path.join(process.cwd(), "scripts", "create_liveness_video.py")
    const finalOutputPath = outputPath || "/tmp/liveness_video.mp4"

    console.log("🎬 Generating liveness video...")
    console.log("Input photo:", idPhotoPath)
    console.log("Output video:", finalOutputPath)

    // Execute Python script to generate liveness video
    const command = `python3 "${scriptPath}" "${idPhotoPath}" "${finalOutputPath}"`

    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
    })

    if (stderr && !stderr.includes("WARNING")) {
      console.error("Python script error:", stderr)
      throw new Error(`Video generation failed: ${stderr}`)
    }

    console.log("✅ Liveness video generated successfully")
    console.log("Python output:", stdout)

    return NextResponse.json({
      success: true,
      message: "Liveness video generated successfully",
      outputPath: finalOutputPath,
      details: stdout,
    })
  } catch (error: any) {
    console.error("❌ Generate liveness video error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate liveness video",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
