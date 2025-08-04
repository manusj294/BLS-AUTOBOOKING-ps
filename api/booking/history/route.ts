import { NextResponse } from "next/server"
import { visaTypesData } from "@/visa-types"

export async function GET() {
  try {
    // In a real implementation, this would fetch booking history from a database
    // For now, we'll generate some mock data

    const bookings = []
    const today = new Date()

    // Generate 5 mock bookings
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - Math.floor(Math.random() * 30)) // Random date in the past 30 days

      // Random visa type and subtype
      const visaTypeIndex = Math.floor(Math.random() * visaTypesData.visaTypes.length)
      const visaType = visaTypesData.visaTypes[visaTypeIndex]

      const applicableSubTypes = visaTypesData.visaSubTypes.filter((st) => st.typeId === visaType.id)
      const visaSubTypeIndex = Math.floor(Math.random() * applicableSubTypes.length)
      const visaSubType = applicableSubTypes[visaSubTypeIndex] || { id: "unknown", name: "Unknown" }

      // Random location
      const locationIndex = Math.floor(Math.random() * visaTypesData.locations.length)
      const location = visaTypesData.locations[locationIndex]

      // Generate random time between 9:00 and 16:00
      const hour = Math.floor(Math.random() * 8) + 9
      const minute = Math.random() < 0.5 ? "00" : "30"
      const time = `${hour.toString().padStart(2, "0")}:${minute}`

      // Random status
      const statuses = ["confirmed", "completed", "cancelled", "rescheduled"]
      const statusIndex = Math.floor(Math.random() * statuses.length)
      const status = statuses[statusIndex]

      // Generate a random confirmation number
      const confirmationNumber = `BLS-${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`

      bookings.push({
        id: `booking_${i + 1}`,
        confirmationNumber,
        date: date.toISOString().split("T")[0],
        time,
        visaTypeId: visaType.id,
        visaTypeName: visaType.name,
        visaSubTypeId: visaSubType.id,
        visaSubTypeName: visaSubType.name,
        locationId: location.id,
        locationName: location.name,
        applicantName: `John Doe ${i + 1}`,
        passportNumber: `AB${Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")}`,
        status,
        createdAt: new Date(date.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      bookings,
    })
  } catch (error) {
    console.error("Error fetching booking history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch booking history" }, { status: 500 })
  }
}
