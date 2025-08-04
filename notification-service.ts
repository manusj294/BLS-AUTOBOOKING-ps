import emailjs from "@emailjs/browser"
import {
  BookingNotification,
  type EmailNotification,
  Notification,
  type NotificationConfig,
} from "./notification-types" // Assuming BookingNotification, EmailNotification, Notification, NotificationAction, NotificationConfig are declared in another file

class NotificationService {
  private config: NotificationConfig
  private notifications: Notification[] = []
  private subscribers: ((notifications: Notification[]) => void)[] = []

  constructor(config: NotificationConfig) {
    this.config = config
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  async sendNotification(notification: BookingNotification): Promise<void> {
    const promises = []

    if (this.config.emailEnabled) {
      promises.push(this.sendEmailNotification(notification))
    }

    if (this.config.pushEnabled) {
      promises.push(this.sendPushNotification(notification))
    }

    await Promise.allSettled(promises)
  }

  private async sendEmailNotification(notification: BookingNotification | EmailNotification): Promise<void> {
    try {
      if (notification instanceof BookingNotification) {
        const templateParams = {
          to_email: this.config.recipientEmail,
          subject: notification.title,
          message: notification.message,
          type: notification.type,
          timestamp: new Date().toLocaleString(),
          data: notification.data ? JSON.stringify(notification.data, null, 2) : "",
        }

        await emailjs.send(
          this.config.emailjsServiceId,
          this.config.emailjsTemplateId,
          templateParams,
          this.config.emailjsPublicKey,
        )

        console.log("Email notification sent successfully")
      } else {
        const response = await fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        })

        if (!response.ok) {
          throw new Error(`Email notification failed: ${response.statusText}`)
        }

        console.log("📧 Email notification sent successfully")
      }
    } catch (error) {
      console.error("Email notification failed:", error)
      throw error
    }
  }

  private async sendPushNotification(notification: BookingNotification): Promise<void> {
    try {
      if (!("Notification" in window)) {
        console.warn("This browser does not support notifications")
        return
      }

      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: notification.type,
          requireInteraction:
            notification.type === "slot_found" ||
            notification.type === "booking_success" ||
            notification.type === "otp_required",
        })
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: notification.type,
            requireInteraction:
              notification.type === "slot_found" ||
              notification.type === "booking_success" ||
              notification.type === "otp_required",
          })
        }
      }
    } catch (error) {
      console.error("Push notification failed:", error)
    }
  }

  // Add notification
  addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">): string {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(newNotification)

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    this.notifySubscribers()

    // Show browser notification for important types
    if (["error", "otp", "success"].includes(notification.type)) {
      this.showBrowserNotification(newNotification)
    }

    return newNotification.id
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification): Promise<void> {
    const hasPermission = await this.requestPermission()
    if (!hasPermission) return

    const options: NotificationOptions = {
      body: notification.message,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: notification.type,
      requireInteraction: notification.type === "otp",
      actions: notification.actions?.map((action) => ({
        action: action.action,
        title: action.label,
      })),
    }

    const browserNotification = new Notification(notification.title, options)

    browserNotification.onclick = () => {
      window.focus()
      browserNotification.close()
    }

    // Auto-close after 10 seconds (except for OTP)
    if (notification.type !== "otp") {
      setTimeout(() => {
        browserNotification.close()
      }, 10000)
    }
  }

  // Send OTP notification (both push and email)
  async sendOtpNotification(phoneNumber?: string, email?: string): Promise<void> {
    // Add to notification center
    const notificationId = this.addNotification({
      type: "otp",
      title: "BLS OTP Required",
      message: "Please check your phone/email for the OTP code and enter it on the BLS website.",
      actions: [
        { label: "Open BLS Site", action: "open_bls", primary: true },
        { label: "Dismiss", action: "dismiss" },
      ],
    })

    // Send email notification if email is provided
    if (email) {
      try {
        await this.sendEmailNotification({
          to: email,
          subject: "BLS Spain Algeria - OTP Code Required",
          body: `
            <h2>BLS Visa Appointment - OTP Required</h2>
            <p>Your BLS Spain Algeria visa appointment booking process requires an OTP verification.</p>
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Check your phone for SMS with OTP code</li>
              <li>Check your email for OTP code</li>
              <li>Enter the code on the BLS website</li>
              <li>Complete your appointment booking</li>
            </ul>
            <p>This is an automated notification from your BLS booking assistant.</p>
            <p><em>Time: ${new Date().toLocaleString()}</em></p>
          `,
          type: "otp",
        })
      } catch (error) {
        console.error("Failed to send OTP email notification:", error)
      }
    }

    // Log for debugging
    console.log("🚨 OTP notification sent:", {
      notificationId,
      phoneNumber: phoneNumber ? `***${phoneNumber.slice(-4)}` : "N/A",
      email: email ? `***${email.split("@")[1]}` : "N/A",
      timestamp: new Date().toISOString(),
    })
  }

  // Send booking success notification
  async sendBookingSuccessNotification(bookingDetails: any): Promise<void> {
    const message = bookingDetails.isGroupBooking
      ? `Group booking confirmed! Master ID: ${bookingDetails.masterBookingId}. ${bookingDetails.individualReferences.length} individual appointments scheduled.`
      : `Appointment booked successfully! Confirmation: ${bookingDetails.confirmationNumber || "Pending"}`

    this.addNotification({
      type: "success",
      title: "Booking Confirmed",
      message,
      actions: [
        { label: "View Details", action: "view_booking", primary: true },
        { label: "Download Receipt", action: "download_receipt" },
      ],
    })

    // Send email confirmation if available
    if (bookingDetails.email) {
      await this.sendEmailNotification({
        to: bookingDetails.email,
        subject: "BLS Spain Algeria - Appointment Confirmed",
        body: `
          <h2>Appointment Confirmation</h2>
          <p>Your BLS Spain Algeria visa appointment has been confirmed!</p>
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${bookingDetails.date}</li>
            <li><strong>Time:</strong> ${bookingDetails.time}</li>
            <li><strong>Type:</strong> ${bookingDetails.isGroupBooking ? "Group Booking" : "Individual Booking"}</li>
            ${bookingDetails.masterBookingId ? `<li><strong>Master Booking ID:</strong> ${bookingDetails.masterBookingId}</li>` : ""}
            ${bookingDetails.confirmationNumber ? `<li><strong>Confirmation Number:</strong> ${bookingDetails.confirmationNumber}</li>` : ""}
          </ul>
          ${
            bookingDetails.individualReferences
              ? `
            <h3>Individual References:</h3>
            <ul>
              ${bookingDetails.individualReferences
                .map((ref: any) => `<li>${ref.name} - ${ref.reference}</li>`)
                .join("")}
            </ul>
          `
              : ""
          }
          <p><strong>Important:</strong> Please arrive 15 minutes before your appointment time with all required documents.</p>
          <p><em>Booking confirmed at: ${new Date().toLocaleString()}</em></p>
        `,
        type: "booking",
      })
    }
  }

  // Send error notification
  sendErrorNotification(title: string, message: string, error?: any): void {
    this.addNotification({
      type: "error",
      title,
      message: `${message}${error ? ` Error: ${error.message || error}` : ""}`,
      actions: [
        { label: "Retry", action: "retry", primary: true },
        { label: "Report Issue", action: "report" },
      ],
    })
  }

  // Send warning notification
  sendWarningNotification(title: string, message: string): void {
    this.addNotification({
      type: "warning",
      title,
      message,
    })
  }

  // Send info notification
  sendInfoNotification(title: string, message: string): void {
    this.addNotification({
      type: "info",
      title,
      message,
    })
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter((n) => !n.read)
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.notifySubscribers()
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true))
    this.notifySubscribers()
  }

  // Clear notification
  clearNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notifySubscribers()
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = []
    this.notifySubscribers()
  }

  // Subscribe to notifications
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.push(callback)

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback)
    }
  }

  // Notify subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback([...this.notifications])
      } catch (error) {
        console.error("Error notifying subscriber:", error)
      }
    })
  }

  // Get notification count
  getNotificationCount(): { total: number; unread: number } {
    return {
      total: this.notifications.length,
      unread: this.notifications.filter((n) => !n.read).length,
    }
  }

  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied"
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }
}

// Email templates for different notification types
const getEmailTemplate = (type: string) => {
  const templates = {
    slot_found: {
      subject: "🎉 BLS Visa Appointment Slot Found!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Appointment Slot Available!</h2>
          <p>Great news! We found an available appointment slot for your BLS Spain visa application.</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Slot Details:</h3>
            <p><strong>Date:</strong> {{slot_date}}</p>
            <p><strong>Time:</strong> {{slot_time}}</p>
            <p><strong>Location:</strong> {{location}}</p>
            <p><strong>Visa Type:</strong> {{visa_type}}</p>
          </div>
          <p style="color: #dc2626; font-weight: bold;">⚠️ Act quickly! Slots fill up fast.</p>
          <p>The system will attempt to book this slot automatically if auto-booking is enabled.</p>
        </div>
      `,
    },
    booking_success: {
      subject: "✅ BLS Visa Appointment Booked Successfully!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Booking Confirmed!</h2>
          <p>Excellent! Your BLS Spain visa appointment has been successfully booked.</p>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <p><strong>Confirmation Number:</strong> {{confirmation_number}}</p>
            <p><strong>Date:</strong> {{appointment_date}}</p>
            <p><strong>Time:</strong> {{appointment_time}}</p>
            <p><strong>Location:</strong> {{location}}</p>
          </div>
          <p>Please save this confirmation number and arrive 15 minutes before your appointment time.</p>
          <p>Don't forget to bring all required documents!</p>
        </div>
      `,
    },
    booking_failed: {
      subject: "❌ BLS Visa Appointment Booking Failed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Booking Failed</h2>
          <p>Unfortunately, we couldn't book the appointment slot. This usually happens when:</p>
          <ul>
            <li>The slot was taken by someone else</li>
            <li>There was a technical issue with the BLS website</li>
            <li>CAPTCHA solving failed</li>
          </ul>
          <p>Don't worry! The monitor will continue looking for available slots.</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Error Details:</strong> {{error_message}}</p>
          </div>
        </div>
      `,
    },
    otp_required: {
      subject: "🔐 BLS OTP Verification Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">OTP Verification Required</h2>
          <p>BLS Spain Algeria has sent you an OTP (One-Time Password) verification code.</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Action Required:</h3>
            <p><strong>1.</strong> Check your phone for SMS or email for the OTP code</p>
            <p><strong>2.</strong> Enter the code on the BLS website</p>
            <p><strong>3.</strong> Complete the verification process</p>
          </div>
          <p style="color: #dc2626; font-weight: bold;">⚠️ Time sensitive! OTP codes usually expire within 5-10 minutes.</p>
          <p>The automation system is waiting for you to complete the OTP verification.</p>
        </div>
      `,
    },
  }

  return templates[type] || templates.slot_found
}

// Export singleton instance
export const notificationService = new NotificationService()

// Initialize notification permission on load
if (typeof window !== "undefined") {
  notificationService.requestPermission()
}
