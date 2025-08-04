import { type NextRequest, NextResponse } from "next/server"

// Mock storage for demonstration
const savedFormData: any = null

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would query your database
    // For now, we'll return the mock saved data
    return NextResponse.json({
      success: true,
      data: savedFormData,
    })
  } catch (error) {
    console.error("Error loading applicant data:", error)
    return NextResponse.json({ success: false, error: "Failed to load applicant data" }, { status: 500 })
  }
}
