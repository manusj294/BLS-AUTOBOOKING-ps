import { type NextRequest, NextResponse } from "next/server"

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "slot_found",
    title: "🎉 Appointment Slot Available",
    message: "New appointment slot found for Spain visa at Algiers center on 2024-02-15 at 10:00 AM",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    data: {
      location: "Algiers",
      date: "2024-02-15",
      time: "10:00",
      visaType: "Tourism",
    },
  },
  {
    id: "2",
    type: "booking_success",
    title: "✅ Booking Confirmed",
    message: "Your visa appointment has been successfully booked. Reference: BLS-2024-001234",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
    data: {
      reference: "BLS-2024-001234",
      location: "Algiers",
      date: "2024-02-20",
      time: "14:30",
    },
  },
  {
    id: "3",
    type: "system_info",
    title: "🔄 Monitoring Started",
    message: "Appointment monitoring has been started for Tourism visa at Algiers center",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    read: true,
    data: {
      location: "Algiers",
      visaType: "Tourism",
      category: "Normal",
    },
  },
]

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would query your database
    // Filter and sort notifications
    const notifications = mockNotifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: unreadCount,
      total: notifications.length,
    })
  } catch (error) {
    console.error("Error loading notifications:", error)
    return NextResponse.json({ success: false, error: "Failed to load notifications" }, { status: 500 })
  }
}
