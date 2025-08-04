import { type NextRequest, NextResponse } from "next/server"

// Mock storage for demonstration
let savedApplicantsCount = 0

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would query your database
    // For now, we'll return the mock count
    return NextResponse.json({
      success: true,
      count: savedApplicantsCount,
    })
  } catch (error) {
    console.error("Error getting applicant count:", error)
    return NextResponse.json({ success: false, error: "Failed to get applicant count" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { increment } = await request.json()

    if (increment) {
      savedApplicantsCount += increment
    }

    return NextResponse.json({
      success: true,
      count: savedApplicantsCount,
    })
  } catch (error) {
    console.error("Error updating applicant count:", error)
    return NextResponse.json({ success: false, error: "Failed to update applicant count" }, { status: 500 })
  }
}
