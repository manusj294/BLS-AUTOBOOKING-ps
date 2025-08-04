import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Test Python installation
    const { stdout, stderr } = await execAsync("python --version")

    if (stderr && !stdout) {
      // Try python3 if python fails
      try {
        const { stdout: stdout3 } = await execAsync("python3 --version")
        return NextResponse.json({
          success: true,
          message: "Python 3 is installed and accessible",
          details: stdout3.trim(),
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: "Python is not installed or not accessible",
          details: "Please install Python 3.8+ and ensure it's in your PATH",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Python is installed and accessible",
      details: stdout.trim(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check Python installation",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
