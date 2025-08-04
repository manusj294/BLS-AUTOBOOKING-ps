import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    console.log("📦 Testing Python dependencies...")

    const requiredPackages = ["opencv-python", "numpy", "pillow", "mediapipe", "face-recognition", "dlib"]

    const results = []

    for (const pkg of requiredPackages) {
      try {
        const { stdout } = await execAsync(`pip show ${pkg}`)
        const version = stdout.match(/Version: (.+)/)?.[1] || "unknown"
        results.push({
          package: pkg,
          status: "installed",
          version: version,
        })
        console.log(`✅ ${pkg}: ${version}`)
      } catch (error) {
        results.push({
          package: pkg,
          status: "missing",
          error: error.message,
        })
        console.log(`❌ ${pkg}: not installed`)
      }
    }

    const missingPackages = results.filter((r) => r.status === "missing")
    const installedPackages = results.filter((r) => r.status === "installed")

    return NextResponse.json({
      success: missingPackages.length === 0,
      message:
        missingPackages.length === 0
          ? "All dependencies are installed"
          : `${missingPackages.length} dependencies are missing`,
      data: {
        installed: installedPackages,
        missing: missingPackages,
        installCommand:
          missingPackages.length > 0 ? `pip install ${missingPackages.map((p) => p.package).join(" ")}` : null,
      },
    })
  } catch (error) {
    console.error("❌ Dependencies test failed:", error)

    return NextResponse.json({
      success: false,
      error: "Dependencies test failed",
      details: error.message,
      recommendations: [
        "Install required Python packages",
        "Run: pip install opencv-python numpy pillow mediapipe face-recognition dlib",
        "Ensure all packages are compatible with your Python version",
        "Check internet connection for package downloads",
      ],
    })
  }
}
