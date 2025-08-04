import { NextResponse } from "next/server"
import { visaTypesData } from "@/visa-types"

export async function POST(request: Request) {
  try {
    const { visaSelection, preferredDates, preferredTimes } = await request.json()

    if (!visaSelection) {
      return NextResponse.json({ success: false, error: "Missing visa selection data" }, { status: 400 })
    }

    // Validate visa selection against available data
    const visaType = visaTypesData.visaTypes.find((vt) => vt.id === visaSelection.visaTypeId)
    const visaSubType = visaTypesData.visaSubTypes.find((vst) => vst.id === visaSelection.visaSubTypeId)
    const location = visaTypesData.locations.find((loc) => loc.id === visaSelection.locationId)

    if (!visaType || !visaSubType || !location) {
      return NextResponse.json({ success: false, error: "Invalid visa selection data" }, { status: 400 })
    }

    // Check if the selected visa subtype is available for the selected location
    if (!location.visaTypeIds.includes(visaType.id) || !location.visaSubTypeIds.includes(visaSubType.id)) {
      return NextResponse.json(
        { success: false, error: "Selected visa type is not available at the chosen location" },
        { status: 400 },
      )
    }

    console.log(`Checking slots for ${visaType.name} (${visaSubType.name}) at ${location.name}`)

    // In a real implementation, this would call the BLS API to check for available slots
    // For now, we'll generate some mock data based on the visa selection

    // Generate some random slots for demonstration
    const today = new Date()
    const slots = []

    // Generate slots for the next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Only include slots for preferred dates if specified
      if (preferredDates && preferredDates.length > 0) {
        const dateString = date.toISOString().split("T")[0]
        if (!preferredDates.includes(dateString)) {
          continue
        }
      }

      // Generate 0-3 slots per day (randomly)
      const numSlots = Math.floor(Math.random() * 4)

      for (let j = 0; j < numSlots; j++) {
        // Generate random time between 9:00 and 16:00
        const hour = Math.floor(Math.random() * 8) + 9
        const minute = Math.random() < 0.5 ? "00" : "30"
        const time = `${hour.toString().padStart(2, "0")}:${minute}`

        // Only include slots for preferred times if specified
        if (preferredTimes && preferredTimes.length > 0 && !preferredTimes.includes(time)) {
          continue
        }

        slots.push({
          date: date.toISOString().split("T")[0],
          time: time,
          available: true,
          locationId: location.id,
          visaTypeId: visaType.id,
          visaSubTypeId: visaSubType.id,
        })
      }
    }

    // Simulate some delay as a real API call would have
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      slots: slots,
      message: `Found ${slots.length} available slots`,
    })
  } catch (error) {
    console.error("Error checking slots:", error)
    return NextResponse.json({ success: false, error: "Failed to check slots" }, { status: 500 })
  }
}
