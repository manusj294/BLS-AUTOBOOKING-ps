import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log("💾 Saving all applicants data:", {
      isGroupBooking: data.isGroupBooking,
      numberOfApplicants: data.numberOfApplicants,
      applicantsCount: data.applicants?.length || 0,
    })

    // In a real implementation, you would:
    // 1. Validate all applicant data
    // 2. Store photos securely (convert base64 to files)
    // 3. Save to database with proper relationships
    // 4. Generate unique applicant IDs for each
    // 5. Handle group booking relationships
    // 6. Send confirmation emails
    // 7. Generate booking reference numbers

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate mock applicant IDs
    const applicantIds = []
    const numberOfApplicants = data.numberOfApplicants || 1

    for (let i = 0; i < numberOfApplicants; i++) {
      applicantIds.push(`APP-${Date.now()}-${String(i + 1).padStart(3, "0")}`)
    }

    // Generate group booking ID if applicable
    const groupBookingId = data.isGroupBooking ? `GRP-${Date.now()}` : null

    return NextResponse.json({
      success: true,
      message: `${data.isGroupBooking ? "Group booking" : "Individual booking"} saved successfully`,
      applicantIds: applicantIds,
      groupBookingId: groupBookingId,
      totalApplicants: numberOfApplicants,
      bookingReference: groupBookingId || applicantIds[0],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Save all applicants error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save applicant data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
