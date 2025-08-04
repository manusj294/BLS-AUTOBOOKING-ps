import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import { writeFileSync, unlinkSync } from "fs"
import { join } from "path"

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    console.log("📹 Testing webcam device access...")

    // Create a temporary Python script to test webcam
    const testScript = `
import cv2
import sys
import json

try:
    # Try to access the default camera
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print(json.dumps({
            "success": False,
            "error": "Cannot access webcam device",
            "details": "Camera device is not available or in use by another application"
        }))
        sys.exit(1)
    
    # Get camera properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    # Try to read a frame
    ret, frame = cap.read()
    
    if not ret:
        print(json.dumps({
            "success": False,
            "error": "Cannot read from webcam",
            "details": "Camera is accessible but cannot capture frames"
        }))
        cap.release()
        sys.exit(1)
    
    # Release the camera
    cap.release()
    
    print(json.dumps({
        "success": True,
        "message": "Webcam device is working properly",
        "data": {
            "resolution": f"{width}x{height}",
            "fps": fps,
            "frameSize": frame.shape if 'frame' in locals() else None
        }
    }))
    
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": "Missing required packages",
        "details": f"ImportError: {str(e)}"
    }))
except Exception as e:
    print(json.dumps({
        "success": False,
        "error": "Webcam test failed",
        "details": str(e)
    }))
`

    // Write the test script to a temporary file
    const scriptPath = join(process.cwd(), "temp_webcam_test.py")
    writeFileSync(scriptPath, testScript)

    try {
      // Execute the Python script
      const { stdout, stderr } = await execAsync(`python "${scriptPath}"`)

      // Clean up the temporary file
      unlinkSync(scriptPath)

      if (stderr) {
        console.error("Python stderr:", stderr)
      }

      // Parse the JSON output from Python
      const result = JSON.parse(stdout.trim())

      return NextResponse.json(result)
    } catch (execError) {
      // Clean up the temporary file
      try {
        unlinkSync(scriptPath)
      } catch (cleanupError) {
        console.error("Failed to cleanup temp file:", cleanupError)
      }

      throw execError
    }
  } catch (error) {
    console.error("❌ Webcam device test failed:", error)

    return NextResponse.json({
      success: false,
      error: "Webcam device test failed",
      details: error.message,
      recommendations: [
        "Ensure webcam is connected and not in use by other applications",
        "Check webcam permissions in system settings",
        "Install required Python packages: pip install opencv-python",
        "Try restarting the webcam or computer",
        "Check if webcam drivers are properly installed",
      ],
    })
  }
}
