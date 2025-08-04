import { type NextRequest, NextResponse } from "next/server"

// Mock storage for form state
let savedFormState: any = null

export async function POST(request: NextRequest) {
  try {
    const formState = await request.json()

    console.log("💾 Saving form state:", {
      isGroupBooking: formState.isGroupBooking,
      numberOfApplicants: formState.numberOfApplicants,
      currentApplicantIndex: formState.currentApplicantIndex,
      currentSection: formState.currentSection,
    })

    // In a real implementation, you would:
    // 1. Store form state in database or session storage
    // 2. Associate with user session/ID
    // 3. Handle cleanup of old states

    // Store the form state
    savedFormState = formState

    return NextResponse.json({
      success: true,
      message: "Form state saved successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Save form state error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save form state",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
