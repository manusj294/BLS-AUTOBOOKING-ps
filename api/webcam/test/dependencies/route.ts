import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    const requiredPackages = ["opencv-python", "numpy", "pillow", "selenium", "pyvirtualcam"]

    const results = []

    for (const pkg of requiredPackages) {
      try {
        await execAsync(`python -c "import ${pkg.replace("-", "_").split("-")[0]}"`)
        results.push({ package: pkg, status: "installed" })
      } catch (error) {
        results.push({ package: pkg, status: "missing" })
      }
    }

    const missingPackages = results.filter((r) => r.status === "missing")

    if (missingPackages.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All required Python packages are installed",
        details: results.map((r) => `${r.package}: ${r.status}`).join("\n"),
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Missing ${missingPackages.length} required packages`,
        details: `Missing packages:\n${missingPackages.map((r) => r.package).join("\n")}\n\nRun: pip install ${missingPackages.map((r) => r.package).join(" ")}`,
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check Python dependencies",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
