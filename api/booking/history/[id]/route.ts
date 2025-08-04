import { NextResponse } from "next/server"
import { visaTypesData } from "@/visa-types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing booking ID" }, { status: 400 })
    }

    console.log(`Fetching booking details for ID: ${id}`)

    // In a real implementation, this would fetch booking details from a database
    // For now, we'll generate some mock data based on the ID

    // Generate deterministic random data based on the ID
    const idNumber = Number.parseInt(id.replace(/\D/g, "")) || 123
    const seed = idNumber % 1000

    // Random visa type and subtype
    const visaTypeIndex = seed % visaTypesData.visaTypes.length
    const visaType = visaTypesData.visaTypes[visaTypeIndex]

    const applicableSubTypes = visaTypesData.visaSubTypes.filter((st) => st.typeId === visaType.id)
    const visaSubTypeIndex = seed % applicableSubTypes.length
    const visaSubType = applicableSubTypes[visaSubTypeIndex] || { id: "unknown", name: "Unknown" }

    // Random location
    const locationIndex = seed % visaTypesData.locations.length
    const location = visaTypesData.locations[locationIndex]

    // Generate date and time
    const today = new Date()
    const date = new Date(today)
    date.setDate(today.getDate() - (seed % 30)) // Random date in the past 30 days

    const hour = 9 + (seed % 8)
    const minute = seed % 2 === 0 ? "00" : "30"
    const time = `${hour.toString().padStart(2, "0")}:${minute}`

    // Random status
    const statuses = ["confirmed", "completed", "cancelled", "rescheduled"]
    const statusIndex = seed % statuses.length
    const status = statuses[statusIndex]

    // Generate a confirmation number based on the ID
    const confirmationNumber = `BLS-${(seed * 1000).toString().padStart(6, "0")}`

    // Generate applicant details
    const firstName = "John"
    const lastName = `Doe ${seed % 10}`
    const passportNumber = `AB${(seed * 1000).toString().padStart(6, "0")}`

    // Generate payment details
    const paymentAmount = 60 + (seed % 5) * 10
    const paymentMethod = ["Credit Card", "Debit Card", "Bank Transfer"][seed % 3]
    const paymentStatus = ["Paid", "Pending", "Failed"][seed % 3]

    // Generate additional services
    const additionalServices = []
    if (seed % 2 === 0) additionalServices.push("SMS Notification")
    if (seed % 3 === 0) additionalServices.push("Premium Lounge")
    if (seed % 4 === 0) additionalServices.push("Document Translation")

    const booking = {
      id,
      confirmationNumber,
      date: date.toISOString().split("T")[0],
      time,
      visaTypeId: visaType.id,
      visaTypeName: visaType.name,
      visaSubTypeId: visaSubType.id,
      visaSubTypeName: visaSubType.name,
      locationId: location.id,
      locationName: location.name,
      applicantDetails: {
        firstName,
        lastName,
        passportNumber,
        dateOfBirth: new Date(1980, 0, 1 + (seed % 28)).toISOString().split("T")[0],
        nationality: "Algeria",
        email: `john.doe${seed}@example.com`,
        phone: `+213 5${seed.toString().padStart(8, "0")}`,
      },
      status,
      statusHistory: [
        {
          status: "created",
          timestamp: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "confirmed",
          timestamp: new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status,
          timestamp: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      payment: {
        amount: paymentAmount,
        currency: "EUR",
        method: paymentMethod,
        status: paymentStatus,
        reference: `PAY-${(seed * 1000).toString().padStart(8, "0")}`,
      },
      additionalServices,
      documents: [
        {
          name: "Passport Copy",
          status: "Uploaded",
          uploadDate: new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          name: "Visa Application Form",
          status: "Uploaded",
          uploadDate: new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          name: "Photo",
          status: "Uploaded",
          uploadDate: new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error("Error fetching booking details:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch booking details" }, { status: 500 })
  }
}
