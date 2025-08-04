import { NextResponse } from "next/server"
import { visaTypesData } from "@/visa-types"

export async function POST(request: Request) {
  try {
    const { visaSelection, preferredDates, preferredTimes, monitoringInterval, autoBook, applicantData } =
      await request.json()

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

    console.log(`Starting monitoring for ${visaType.name} (${visaSubType.name}) at ${location.name}`)
    console.log(`Monitoring interval: ${monitoringInterval} seconds`)
    console.log(`Auto-book: ${autoBook ? "Enabled" : "Disabled"}`)
    console.log(`Preferred dates: ${preferredDates?.length || 0}`)
    console.log(`Preferred times: ${preferredTimes?.length || 0}`)

    // In a real implementation, this would start a background process or schedule regular API calls
    // For now, we'll just return a success response

    // Simulate some delay as a real API call would have
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Monitoring started successfully",
      monitoringId: `monitor_${Date.now()}`,
      config: {
        visaSelection,
        preferredDates,
        preferredTimes,
        monitoringInterval,
        autoBook,
      },
    })
  } catch (error) {
    console.error("Error starting monitoring:", error)
    return NextResponse.json({ success: false, error: "Failed to start monitoring" }, { status: 500 })
  }
}
