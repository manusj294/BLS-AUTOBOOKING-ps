export interface NotificationConfig {
  emailEnabled: boolean
  pushEnabled: boolean
  emailjsServiceId: string
  emailjsTemplateId: string
  emailjsPublicKey: string
  recipientEmail: string
}

export interface NotificationSettings {
  emailEnabled: boolean
  pushEnabled: boolean
  soundEnabled: boolean
  emailAddress?: string
  pushSubscription?: PushSubscription
}

export interface NotificationAction {
  label: string
  action: string
  primary?: boolean
}

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

export class BookingNotification {
  constructor(
    public type: "success" | "error" | "warning",
    public title: string,
    public message: string,
    public data?: {
      applicantId?: string
      appointmentDate?: string
      location?: string
      bookingReference?: string
      slotDetails?: any
    },
  ) {}
}

export interface EmailNotification {
  to: string
  subject: string
  body: string
  type: string
}

export interface SlotNotification {
  type: "slot_found"
  title: string
  message: string
  data: {
    date: string
    time: string
    location: string
    visaType: string
    category: string
  }
}

export interface BookingSuccessNotification {
  type: "booking_success"
  title: string
  message: string
  data: {
    confirmationNumber: string
    date: string
    time: string
    location: string
    applicantName: string
  }
}

export interface OTPNotification extends Notification {
  type: "info"
  data: {
    otp: string
    source: "email" | "sms"
    expiresAt: string
  }
}

export interface SystemNotification extends Notification {
  type: "info" | "warning" | "error"
  data: {
    component?: string
    errorCode?: string
    details?: string
  }
}

export type NotificationType = BookingNotification | SystemNotification | OTPNotification
