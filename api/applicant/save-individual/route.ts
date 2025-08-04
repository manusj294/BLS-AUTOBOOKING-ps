import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log("💾 Saving individual applicant data:", {
      isGroupBooking: data.isGroupBooking,
      currentApplicantIndex: data.currentApplicantIndex,
      applicantName: `${data.applicant?.FirstName} ${data.applicant?.LastName}`,
    })

    // In a real implementation, you would:
    // 1. Validate applicant data
    // 2. Store photos securely (convert base64 to files)
    // 3. Save to database
    // 4. Generate unique applicant ID
    // 5. Send confirmation email
    // 6. Update group booking if applicable

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate mock applicant ID
    const applicantId = `APP-${Date.now()}-${String(data.currentApplicantIndex + 1).padStart(3, "0")}`

    return NextResponse.json({
      success: true,
      message: "Individual applicant data saved successfully",
      applicantId: applicantId,
      applicantIndex: data.currentApplicantIndex,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Save individual applicant error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save individual applicant data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
