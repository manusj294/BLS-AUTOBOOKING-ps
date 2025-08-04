import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    console.log("🐍 Testing Python installation...")

    // Test Python installation
    const { stdout: pythonVersion } = await execAsync("python --version")
    console.log("✅ Python version:", pythonVersion.trim())

    // Test pip installation
    const { stdout: pipVersion } = await execAsync("pip --version")
    console.log("✅ Pip version:", pipVersion.trim())

    return NextResponse.json({
      success: true,
      message: "Python environment is ready",
      data: {
        pythonVersion: pythonVersion.trim(),
        pipVersion: pipVersion.trim(),
        status: "ready",
      },
    })
  } catch (error) {
    console.error("❌ Python test failed:", error)

    return NextResponse.json({
      success: false,
      error: "Python environment test failed",
      details: error.message,
      recommendations: [
        "Install Python 3.8 or higher",
        "Ensure Python is added to PATH",
        "Install pip package manager",
        "Restart the application after installation",
      ],
    })
  }
}
