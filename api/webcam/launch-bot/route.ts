import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { applicantData, idPhotoPath } = await request.json()

    if (!applicantData || !idPhotoPath) {
      return NextResponse.json(
        { success: false, error: "Applicant data and ID photo path are required" },
        { status: 400 },
      )
    }

    const scriptPath = path.join(process.cwd(), "scripts", "run_bot.py")

    console.log("🤖 Launching browser automation bot...")
    console.log("Applicant:", applicantData.firstName, applicantData.lastName)

    // Prepare applicant data as JSON string for Python script
    const applicantJson = JSON.stringify(applicantData)

    // Execute Python script for browser automation
    const command = `python3 "${scriptPath}" '${applicantJson}' "${idPhotoPath}"`

    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000, // 5 minute timeout for browser automation
    })

    if (stderr && !stderr.includes("WARNING")) {
      console.error("Browser bot error:", stderr)
      throw new Error(`Browser automation failed: ${stderr}`)
    }

    console.log("✅ Browser automation completed successfully")
    console.log("Python output:", stdout)

    return NextResponse.json({
      success: true,
      message: "Browser automation completed successfully",
      details: stdout,
      applicantData: {
        name: `${applicantData.firstName} ${applicantData.lastName}`,
        email: applicantData.email,
      },
    })
  } catch (error: any) {
    console.error("❌ Launch browser bot error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to launch browser automation",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
