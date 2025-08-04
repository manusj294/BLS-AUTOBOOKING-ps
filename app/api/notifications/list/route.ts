import { NextResponse } from "next/server"

// Mock notifications storage
const mockNotifications = [
  {
    id: "1",
    type: "slot_found",
    title: "🎉 Appointment Slot Available!",
    message: "New appointment slot found for Algiers - Tourism visa on 2025-08-15 at 09:30",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    data: {
      location: "Algiers",
      visaType: "Tourism",
      date: "2025-08-15",
      time: "09:30",
    },
  },
  {
    id: "2",
    type: "booking_success",
    title: "✅ Booking Confirmed",
    message: "Your visa appointment has been successfully booked. Reference: BLS-2025-001234",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    data: {
      reference: "BLS-2025-001234",
      date: "2025-08-15",
      time: "09:30",
    },
  },
  {
    id: "3",
    type: "system_info",
    title: "🔧 System Update",
    message: "Webcam settings have been updated successfully. Virtual camera is now ready.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    read: true,
    data: {},
  },
]

export async function GET() {
  try {
    const unreadCount = mockNotifications.filter((n) => !n.read).length

    return NextResponse.json({
      success: true,
      data: mockNotifications,
      unreadCount: unreadCount,
      total: mockNotifications.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ List notifications error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load notifications",
        data: [],
        unreadCount: 0,
      },
      { status: 500 },
    )
  }
}
