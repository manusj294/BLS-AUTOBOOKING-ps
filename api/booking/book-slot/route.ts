import { NextResponse } from "next/server"
import { visaTypesData } from "@/visa-types"

export async function POST(request: Request) {
  try {
    const { slot, visaSelection, applicantData } = await request.json()

    if (!slot || !visaSelection || !applicantData) {
      return NextResponse.json({ success: false, error: "Missing required data" }, { status: 400 })
    }

    // Validate visa selection against available data
    const visaType = visaTypesData.visaTypes.find((vt) => vt.id === visaSelection.visaTypeId)
    const visaSubType = visaTypesData.visaSubTypes.find((vst) => vst.id === visaSelection.visaSubTypeId)
    const location = visaTypesData.locations.find((loc) => loc.id === visaSelection.locationId)

    if (!visaType || !visaSubType || !location) {
      return NextResponse.json({ success: false, error: "Invalid visa selection data" }, { status: 400 })
    }

    console.log(`Booking slot for ${visaType.name} (${visaSubType.name}) at ${location.name}`)
    console.log(`Date: ${slot.date}, Time: ${slot.time}`)
    console.log(`Applicant: ${applicantData.currentApplicant?.FirstName} ${applicantData.currentApplicant?.LastName}`)

    // In a real implementation, this would call the BLS API to book the slot
    // For now, we'll just return a success response with mock data

    // Simulate some delay as a real API call would have
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a random confirmation number
    const confirmationNumber = `BLS-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      confirmationNumber,
      appointmentDetails: {
        date: slot.date,
        time: slot.time,
        location: location.name,
        visaType: visaType.name,
        visaSubType: visaSubType.name,
        applicantName: `${applicantData.currentApplicant?.FirstName} ${applicantData.currentApplicant?.LastName}`,
        passportNumber: applicantData.currentApplicant?.PassportNo,
      },
    })
  } catch (error) {
    console.error("Error booking slot:", error)
    return NextResponse.json({ success: false, error: "Failed to book appointment" }, { status: 500 })
  }
}
