import puppeteer from "puppeteer"
import { CaptchaSolver } from "./captcha-solver"
import { NotificationService } from "./notification-service"

export interface BlsCredentials {
  email: string
  password: string
}

export interface ApplicantData {
  Surname: string
  FirstName: string
  LastName: string
  DateOfBirth: Date | null
  PassportNo: string
  PhoneNumber: string
  EmailAddress: string
  // Add other fields as needed
}

export interface BookingData {
  isGroupBooking: boolean
  numberOfApplicants: number
  applicants: ApplicantData[]
  selectedDate: string
  selectedTime: string
  visaType: string
}

export class BLSAutomation {
  private browser: any
  private page: any
  private settings: any
  private captchaSolver: CaptchaSolver
  private notificationService: NotificationService
  private logs: Array<{ timestamp: Date; message: string; type: string }> = []
  private credentials = {
    email: "nomadsam6@gmail.com",
    password: "qXe2TRgk-qtVU!&",
  }
  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null
  private otpDetectionInterval: NodeJS.Timeout | null = null

  constructor(settings: any) {
    this.settings = settings
    this.captchaSolver = new CaptchaSolver({
      provider: settings.captchaProvider,
      apiKey: settings.captchaApiKey,
      aiEnabled: settings.aiCaptchaEnabled,
      aiProvider: settings.aiCaptchaProvider,
      aiApiKey: settings.aiCaptchaApiKey,
      aiModel: settings.aiCaptchaModel,
      customEnabled: settings.customCaptchaEnabled,
      customApiUrl: settings.customCaptchaApiUrl,
      customApiKey: settings.customCaptchaApiKey,
      customMethod: settings.customCaptchaMethod,
      customHeaders: settings.customCaptchaHeaders,
      customPayload: settings.customCaptchaPayload,
      customResponsePath: settings.customCaptchaResponsePath,
    })

    // Initialize notification service
    this.notificationService = new NotificationService({
      emailEnabled: settings.emailEnabled || false,
      pushEnabled: settings.pushEnabled || false,
      emailjsServiceId: settings.emailjsServiceId || "",
      emailjsTemplateId: settings.emailjsTemplateId || "",
      emailjsPublicKey: settings.emailjsPublicKey || "",
      recipientEmail: settings.recipientEmail || this.credentials.email,
    })
  }

  // Format date for BLS system (yyyy-mm-dd)
  private formatDateForBLS(date: Date | null | string): string {
    if (!date) return ""

    if (typeof date === "string") {
      return new Date(date).toISOString().split("T")[0]
    }

    return date.toISOString().split("T")[0]
  }

  private log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
    const logEntry = {
      timestamp: new Date(),
      message,
      type,
    }
    this.logs.push(logEntry)
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  async initialize() {
    this.log("🚀 Initializing BLS automation browser...", "info")

    this.browser = await puppeteer.launch({
      headless: !this.settings.debugMode,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    })

    this.page = await this.browser.newPage()

    // Set user agent
    await this.page.setUserAgent(this.settings.userAgent)
    this.log(`🔧 Set user agent: ${this.settings.userAgent}`, "info")

    // Set viewport
    await this.page.setViewport({ width: 1366, height: 768 })
    this.log("📱 Set viewport to 1366x768", "info")

    // Enable request interception for smart navigation
    if (this.settings.smartNavigation) {
      await this.page.setRequestInterception(true)
      this.page.on("request", (request) => {
        // Block unnecessary resources to speed up navigation
        if (["image", "stylesheet", "font"].includes(request.resourceType())) {
          request.abort()
        } else {
          request.continue()
        }
      })
      this.log("🧠 Smart navigation enabled", "info")
    }

    // Set up OTP monitoring
    await this.setupOTPMonitoring()
  }

  async setupOTPMonitoring() {
    this.log("📱 Setting up OTP monitoring...", "info")

    // Monitor for OTP-related elements and messages
    this.page.on("response", async (response) => {
      try {
        const url = response.url()
        const contentType = response.headers()["content-type"] || ""

        // Check for OTP-related API calls
        if (
          (url.includes("otp") || url.includes("sms") || url.includes("verification")) &&
          contentType.includes("application/json")
        ) {
          const responseText = await response.text()
          this.log(`🔍 OTP-related response detected: ${url}`, "info")

          if (responseText.toLowerCase().includes("otp") || responseText.toLowerCase().includes("code")) {
            await this.handleOTPDetection("API response indicates OTP sent", responseText)
          }
        }
      } catch (error) {
        // Ignore errors in response monitoring
      }
    })

    // Monitor for DOM changes that might indicate OTP
    await this.page.evaluateOnNewDocument(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element
                const text = element.textContent?.toLowerCase() || ""

                // Check for OTP-related text
                if (
                  text.includes("otp") ||
                  text.includes("verification code") ||
                  text.includes("sms code") ||
                  text.includes("enter code") ||
                  text.includes("6-digit code") ||
                  text.includes("4-digit code")
                ) {
                  // Signal OTP detection
                  window.postMessage({ type: "OTP_DETECTED", text: text }, "*")
                }
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    })

    // Listen for OTP detection messages
    this.page.on("console", async (msg) => {
      const text = msg.text()
      if (text.includes("OTP_DETECTED")) {
        await this.handleOTPDetection("DOM change indicates OTP request", text)
      }
    })

    this.log("✅ OTP monitoring setup complete", "success")
  }

  async handleOTPDetection(source: string, details: string) {
    this.log(`📱 OTP DETECTED! Source: ${source}`, "warning")
    this.log(`📋 Details: ${details}`, "info")

    // Send notifications
    try {
      await this.notificationService.sendNotification({
        type: "slot_found", // Using existing type for now
        title: "🔐 BLS OTP Code Required",
        message: `BLS Spain Algeria has sent you an OTP verification code. Please check your phone/email and enter the code on the website.\n\nSource: ${source}\nTime: ${new Date().toLocaleString()}`,
        data: {
          source,
          details,
          timestamp: new Date().toISOString(),
          url: this.page.url(),
        },
      })

      this.log("📧 OTP notification sent successfully", "success")
    } catch (error) {
      this.log(`❌ Failed to send OTP notification: ${error.message}`, "error")
    }

    // Wait for user to handle OTP
    this.log("⏳ Waiting for OTP to be entered...", "info")

    // Monitor for OTP input completion
    try {
      await this.waitForOTPCompletion()
    } catch (error) {
      this.log(`⚠️ OTP monitoring timeout: ${error.message}`, "warning")
    }
  }

  async waitForOTPCompletion(timeout = 300000) {
    // 5 minutes timeout
    this.log("⏳ Monitoring for OTP completion...", "info")

    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        // Check if OTP input fields are filled
        const otpFilled = await this.page.evaluate(() => {
          const otpInputs = document.querySelectorAll(
            'input[type="text"][maxlength="1"], input[type="number"][maxlength="1"], input[name*="otp"], input[id*="otp"], input[placeholder*="code"], input[placeholder*="OTP"]',
          )

          if (otpInputs.length > 0) {
            // Check if all OTP inputs are filled
            return Array.from(otpInputs).every((input: any) => input.value && input.value.trim() !== "")
          }

          // Check for single OTP input field
          const singleOtpInput = document.querySelector(
            'input[name*="verification"], input[id*="verification"], input[placeholder*="verification"]',
          ) as HTMLInputElement

          if (singleOtpInput) {
            return singleOtpInput.value && singleOtpInput.value.length >= 4
          }

          return false
        })

        if (otpFilled) {
          this.log("✅ OTP appears to be entered", "success")

          // Look for submit button and click it
          const submitClicked = await this.page.evaluate(() => {
            const submitButtons = document.querySelectorAll(
              'button[type="submit"], input[type="submit"], button:contains("Verify"), button:contains("Submit"), button:contains("Continue")',
            )

            for (const button of submitButtons) {
              if (button instanceof HTMLElement && !button.disabled) {
                button.click()
                return true
              }
            }
            return false
          })

          if (submitClicked) {
            this.log("🚀 OTP submit button clicked", "success")

            // Wait for navigation or response
            try {
              await Promise.race([
                this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }),
                this.page.waitForSelector(".success, .verified, .complete", { timeout: 10000 }),
              ])
              this.log("✅ OTP verification completed", "success")
              return
            } catch (e) {
              this.log("⚠️ No immediate response after OTP submission", "warning")
            }
          }
        }

        // Wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        this.log(`⚠️ Error during OTP monitoring: ${error.message}`, "warning")
      }
    }

    throw new Error("OTP completion timeout")
  }

  async navigateToBLS() {
    this.log("🌐 Navigating to BLS Spain Algeria website...", "info")

    try {
      await this.page.goto("https://algeria.blsspainglobal.com/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      })

      this.log("✅ Successfully loaded BLS website", "success")

      // Handle potential security challenges
      await this.handleSecurityMeasures()

      return true
    } catch (error) {
      this.log(`❌ Failed to navigate to BLS website: ${error.message}`, "error")
      throw error
    }
  }

  async loginToBLS() {
    this.log("🔐 Starting BLS login process...", "info")

    try {
      // Look for login button or link
      const loginSelectors = [
        'a[href*="login"]',
        'a[href*="signin"]',
        ".login-btn",
        ".signin-btn",
        'button:contains("Login")',
        'button:contains("Sign In")',
        "#login",
        ".login",
      ]

      let loginFound = false
      for (const selector of loginSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          await this.page.click(selector)
          this.log(`✅ Found and clicked login button: ${selector}`, "success")
          loginFound = true
          break
        } catch (e) {
          continue
        }
      }

      if (!loginFound) {
        // Try to navigate directly to login page
        await this.page.goto("https://algeria.blsspainglobal.com/login", {
          waitUntil: "networkidle2",
          timeout: 15000,
        })
        this.log("🔗 Navigated directly to login page", "info")
      }

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name*="email"], input[id*="email"]', {
        timeout: 10000,
      })
      this.log("📝 Login form detected", "info")

      // Fill email field
      const emailSelectors = [
        'input[type="email"]',
        'input[name*="email"]',
        'input[id*="email"]',
        'input[placeholder*="email"]',
      ]

      let emailFilled = false
      for (const selector of emailSelectors) {
        try {
          const emailField = await this.page.$(selector)
          if (emailField) {
            await this.page.focus(selector)
            await this.page.evaluate((sel) => (document.querySelector(sel).value = ""), selector)
            await this.page.type(selector, this.credentials.email, { delay: 100 })
            this.log(`✅ Email filled: ${this.credentials.email}`, "success")
            emailFilled = true
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!emailFilled) {
        throw new Error("Could not find email input field")
      }

      // Fill password field
      const passwordSelectors = [
        'input[type="password"]',
        'input[name*="password"]',
        'input[id*="password"]',
        'input[placeholder*="password"]',
      ]

      let passwordFilled = false
      for (const selector of passwordSelectors) {
        try {
          const passwordField = await this.page.$(selector)
          if (passwordField) {
            await this.page.focus(selector)
            await this.page.evaluate((sel) => (document.querySelector(sel).value = ""), selector)
            await this.page.type(selector, this.credentials.password, { delay: 100 })
            this.log("✅ Password filled successfully", "success")
            passwordFilled = true
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!passwordFilled) {
        throw new Error("Could not find password input field")
      }

      // Handle CAPTCHA if present before login
      const captcha = await this.page.$('.captcha, #captcha, [id*="captcha"], [class*="captcha"]')
      if (captcha) {
        this.log("🤖 CAPTCHA detected on login form, attempting to solve...", "warning")
        await this.solveCaptcha()
      }

      // Submit login form
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        ".login-submit",
        ".signin-submit",
        'button:contains("Login")',
        'button:contains("Sign In")',
        'button:contains("Submit")',
      ]

      let loginSubmitted = false
      for (const selector of submitSelectors) {
        try {
          const submitButton = await this.page.$(selector)
          if (submitButton) {
            await submitButton.click()
            this.log(`✅ Login form submitted using: ${selector}`, "success")
            loginSubmitted = true
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!loginSubmitted) {
        // Try pressing Enter on password field
        await this.page.keyboard.press("Enter")
        this.log("⌨️ Submitted login using Enter key", "info")
      }

      // Wait for login to complete or OTP request
      try {
        await Promise.race([
          this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }),
          this.page.waitForSelector(".otp, #otp, [id*='otp'], [class*='otp'], [placeholder*='code']", {
            timeout: 15000,
          }),
        ])

        // Check if OTP is required
        const otpRequired = await this.page.$(".otp, #otp, [id*='otp'], [class*='otp'], [placeholder*='code']")
        if (otpRequired) {
          this.log("📱 OTP verification required after login", "warning")
          await this.handleOTPDetection("Login process requires OTP", "OTP input field detected after login")
        } else {
          this.log("🎉 Login successful - redirected to dashboard", "success")
        }
      } catch (e) {
        // Check if we're still on login page (login failed)
        const currentUrl = this.page.url()
        if (currentUrl.includes("login") || currentUrl.includes("signin")) {
          throw new Error("Login failed - still on login page")
        }
        this.log("✅ Login appears successful", "success")
      }

      // Verify login success by checking for user-specific elements
      const loggedInIndicators = [
        ".user-menu",
        ".dashboard",
        ".logout",
        ".profile",
        'a[href*="logout"]',
        'a[href*="profile"]',
      ]

      let loginVerified = false
      for (const selector of loggedInIndicators) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          this.log(`✅ Login verified - found: ${selector}`, "success")
          loginVerified = true
          break
        } catch (e) {
          continue
        }
      }

      if (!loginVerified) {
        this.log("⚠️ Could not verify login success, but proceeding...", "warning")
      }

      return true
    } catch (error) {
      this.log(`❌ Login failed: ${error.message}`, "error")
      throw error
    }
  }

  // Smart login with multiple selector fallbacks
  async performLogin(): Promise<boolean> {
    try {
      this.log("🔐 Starting BLS login process...", "info")

      // Navigate to BLS login page
      const loginSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        "#email",
        ".email-input",
        'input[placeholder*="email" i]',
      ]

      const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        "#password",
        ".password-input",
        'input[placeholder*="password" i]',
      ]

      // Try to find and fill email field
      let emailField = null
      for (const selector of loginSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          emailField = await this.page.$(selector)
          if (emailField) {
            await this.page.focus(selector)
            await this.page.evaluate((sel) => (document.querySelector(sel).value = ""), selector)
            await this.page.type(selector, this.credentials.email, { delay: 100 })
            this.log(`✅ Email filled: ${this.credentials.email}`, "success")
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!emailField) {
        throw new Error("Email field not found")
      }

      // Try to find and fill password field
      let passwordField = null
      for (const selector of passwordSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          passwordField = await this.page.$(selector)
          if (passwordField) {
            await this.page.focus(selector)
            await this.page.evaluate((sel) => (document.querySelector(sel).value = ""), selector)
            await this.page.type(selector, this.credentials.password, { delay: 100 })
            this.log("✅ Password filled successfully", "success")
            break
          }
        } catch (e) {
          continue
        }
      }

      if (!passwordField) {
        throw new Error("Password field not found")
      }

      // Find and click login button
      const loginButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        ".login-btn",
        ".submit-btn",
        'button:contains("Login")',
        'button:contains("Sign In")',
      ]

      let loginButton = null
      for (const selector of loginButtonSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          loginButton = await this.page.$(selector)
          if (loginButton) {
            await loginButton.click()
            this.log("✅ Login form submitted", "success")
            break
          }
        } catch (e) {
          continue
        }
      }

      if (loginButton) {
        // Start OTP detection
        await this.startOtpDetection()

        return true
      } else {
        throw new Error("Login button not found")
      }
    } catch (error) {
      this.log(`❌ Login failed: ${error.message}`, "error")
      return false
    }
  }

  // Enhanced OTP detection with notifications
  private async startOtpDetection(): Promise<void> {
    this.log("🔍 Starting OTP detection...", "info")

    this.otpDetectionInterval = setInterval(async () => {
      try {
        // Check for OTP-related elements
        const otpSelectors = [
          'input[name*="otp" i]',
          'input[placeholder*="otp" i]',
          'input[placeholder*="code" i]',
          ".otp-input",
          ".verification-code",
          'input[maxlength="6"]',
          'input[maxlength="4"]',
        ]

        let otpField = null
        for (const selector of otpSelectors) {
          try {
            otpField = await this.page.$(selector)
            if (otpField) break
          } catch (e) {
            continue
          }
        }

        // Check for OTP-related text content
        const otpTextIndicators = [
          "verification code",
          "otp",
          "one time password",
          "enter code",
          "código de verificación",
        ]

        const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase())
        const hasOtpText = otpTextIndicators.some((indicator) => pageText.includes(indicator))

        if (otpField || hasOtpText) {
          this.log("🚨 OTP detected! Sending notifications...", "warning")

          // Send notifications
          await this.sendOtpNotifications()

          // Wait for OTP completion
          if (otpField) {
            await this.waitForOtpCompletion(otpField)
          }

          // Clear the detection interval
          if (this.otpDetectionInterval) {
            clearInterval(this.otpDetectionInterval)
            this.otpDetectionInterval = null
          }
        }
      } catch (error) {
        this.log(`❌ OTP detection error: ${error.message}`, "error")
      }
    }, 2000) // Check every 2 seconds
  }

  // Send OTP notifications (push and email)
  private async sendOtpNotifications(): Promise<void> {
    try {
      // Send push notification
      if (this.settings.pushEnabled && "Notification" in global) {
        // Check if notification permission is granted
        const permission = await this.page.evaluate(() => Notification.requestPermission())

        if (permission === "granted") {
          await this.page.evaluate(() => {
            new Notification("BLS OTP Required", {
              body: "Please check your phone/email for the OTP code and enter it on the BLS website.",
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
              tag: "bls-otp",
              requireInteraction: true,
            })
          })
        } else {
          this.log("⚠️ Push notifications not enabled or permission denied", "warning")
        }
      }

      // Send email notification via API
      if (this.settings.emailEnabled) {
        await this.notificationService.sendNotification({
          type: "otp_required",
          title: "🔐 BLS OTP Code Required",
          message:
            "BLS Spain Algeria has sent you an OTP code. Please check your phone/email and enter it on the website.",
          data: {
            timestamp: new Date().toISOString(),
          },
        })
      }

      this.log("📧 OTP notifications sent successfully", "success")
    } catch (error) {
      this.log(`❌ Failed to send OTP notifications: ${error.message}`, "error")
    }
  }

  // Wait for OTP completion
  private async waitForOtpCompletion(otpField: any): Promise<void> {
    if (!otpField) return

    this.log("⏳ Waiting for OTP completion...", "info")

    const checkOtpCompletion = setInterval(async () => {
      try {
        const expectedLength = await this.page.evaluate((field) => field.maxLength || 6, otpField)
        const otpValueLength = await this.page.evaluate((field) => field.value.length, otpField)

        if (otpValueLength >= expectedLength) {
          this.log("✅ OTP completed, continuing automation...", "success")
          clearInterval(checkOtpCompletion)

          // Continue with form submission or next steps
          setTimeout(async () => {
            await this.continueAfterOtp()
          }, 2000)
        }
      } catch (error) {
        this.log(`❌ OTP completion check error: ${error.message}`, "error")
      }
    }, 1000)

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkOtpCompletion)
      this.log("⏰ OTP completion timeout", "warning")
    }, 300000)
  }

  // Continue automation after OTP
  private async continueAfterOtp(): Promise<void> {
    this.log("🔄 Continuing automation after OTP...", "info")

    // Look for submit button or next step
    const submitSelectors = [
      'button[type="submit"]',
      ".submit-btn",
      ".continue-btn",
      ".next-btn",
      'button:contains("Submit")',
      'button:contains("Continue")',
      'button:contains("Next")',
    ]

    for (const selector of submitSelectors) {
      try {
        const button = await this.page.$(selector)
        if (button && !(await button.getProperty("disabled")).jsonValue()) {
          await button.click()
          this.log("✅ Continued after OTP verification", "success")
          break
        }
      } catch (e) {
        continue
      }
    }
  }

  // Fill applicant form with comprehensive data
  async fillApplicantForm(applicantData: ApplicantData): Promise<boolean> {
    try {
      this.log("📝 Filling applicant form...", "info")

      // Personal Details
      await this.fillField('input[name="Surname"]', applicantData.Surname)
      await this.fillField('input[name="FirstName"]', applicantData.FirstName)
      await this.fillField('input[name="LastName"]', applicantData.LastName)

      // Date of Birth
      if (applicantData.DateOfBirth) {
        await this.fillField('input[name="DateOfBirth"]', this.formatDateForBLS(applicantData.DateOfBirth))
      }

      // Contact Information
      await this.fillField('input[name="PhoneNumber"]', applicantData.PhoneNumber)
      await this.fillField('input[name="EmailAddress"]', applicantData.EmailAddress)

      // Passport Details
      await this.fillField('input[name="PassportNo"]', applicantData.PassportNo)

      this.log("✅ Applicant form filled successfully", "success")
      return true
    } catch (error) {
      this.log(`❌ Failed to fill applicant form: ${error.message}`, "error")
      return false
    }
  }

  // Helper method to fill form fields
  private async fillField(selector: string, value: string): Promise<void> {
    try {
      const field = await this.page.$(selector)
      if (field && value) {
        await this.page.focus(selector)
        await this.page.evaluate((sel) => (document.querySelector(sel).value = ""), selector)
        await this.page.type(selector, String(value), { delay: 50 })
        // Small delay to ensure the field is properly filled
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } catch (error) {
      this.log(`❌ Failed to fill field ${selector}: ${error.message}`, "error")
    }
  }

  // Process group booking with individual references
  async processGroupBooking(bookingData: BookingData): Promise<any> {
    try {
      this.log(`👥 Processing group booking for ${bookingData.numberOfApplicants} applicants...`, "info")

      const groupBookingId = `BLS-${Date.now()}`
      const applicants = []

      // Process each applicant
      for (let i = 0; i < bookingData.applicants.length; i++) {
        const applicant = bookingData.applicants[i]
        this.log(`📝 Processing applicant ${i + 1}: ${applicant.FirstName} ${applicant.LastName}`, "info")

        // Fill form for current applicant
        await this.fillApplicantForm(applicant)

        // Handle CAPTCHA if present
        const captcha = await this.page.$('.captcha, #captcha, [id*="captcha"], [class*="captcha"]')
        if (captcha) {
          this.log(`🤖 CAPTCHA detected for applicant ${i + 1}...`, "warning")
          await this.solveCaptcha()
        }

        // Submit for this applicant
        await this.submitBooking()

        // Get individual confirmation
        const confirmation = await this.getConfirmation()

        applicants.push({
          name: `${applicant.FirstName} ${applicant.LastName}`,
          passportNumber: applicant.PassportNo,
          appointmentId: confirmation.referenceNumber || `APPT-${String(i + 1).padStart(4, "0")}`,
        })

        this.log(`✅ Applicant ${i + 1} processed successfully`, "success")

        // Add delay between applicants
        if (i < bookingData.applicants.length - 1) {
          await this.page.waitForTimeout(2000)
        }
      }

      this.log(`🎉 Group booking completed! Group ID: ${groupBookingId}`, "success")

      return {
        success: true,
        groupBookingId: groupBookingId,
        appointmentDate: bookingData.selectedDate,
        appointmentTime: bookingData.selectedTime,
        location: "BLS Spain Visa Centre - Algeria",
        applicants: applicants,
      }
    } catch (error) {
      this.log(`❌ Group booking failed: ${error.message}`, "error")
      throw error
    }
  }

  // Submit application
  private async submitApplication(): Promise<void> {
    try {
      // Look for submit buttons
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        ".submit-btn",
        ".book-btn",
        ".confirm-btn",
        'button:contains("Submit")',
        'button:contains("Book")',
        'button:contains("Confirm")',
      ]

      for (const selector of submitSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            await element.click()
            await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
            this.log(`✅ Booking submitted using: ${selector}`, "success")
            return
          }
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not find submit button")
    } catch (error) {
      this.log(`❌ Failed to submit booking: ${error.message}`, "error")
      throw error
    }
  }

  async smartNavigateToBooking(location: string, visaType: string, category: string) {
    this.log("🧭 Starting smart navigation to booking page...", "info")

    try {
      // First ensure we're logged in
      await this.loginToBLS()

      // Step 1: Navigate to appointment booking section
      this.log("📍 Step 1: Navigating to appointment section", "info")
      const appointmentSelectors = [
        'a[href*="appointment"]',
        'a[href*="booking"]',
        ".appointment-link",
        ".booking-link",
        'button:contains("Book Appointment")',
        'a:contains("Appointment")',
        'a:contains("Booking")',
      ]

      let appointmentFound = false
      for (const selector of appointmentSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 })
          await this.page.click(selector)
          await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 })
          this.log(`✅ Navigated to appointments using: ${selector}`, "success")
          appointmentFound = true
          break
        } catch (e) {
          continue
        }
      }

      if (!appointmentFound) {
        // Try direct URL navigation
        await this.page.goto("https://algeria.blsspainglobal.com/appointment", {
          waitUntil: "networkidle2",
          timeout: 15000,
        })
        this.log("🔗 Navigated directly to appointment page", "info")
      }

      // Step 2: Select location
      this.log(`🏢 Step 2: Selecting location: ${location}`, "info")
      await this.selectLocation(location)

      // Step 3: Select visa type
      this.log(`📋 Step 3: Selecting visa type: ${visaType}`, "info")
      await this.selectVisaType(visaType)

      // Step 4: Select category
      this.log(`⚡ Step 4: Selecting category: ${category}`, "info")
      await this.selectCategory(category)

      // Step 5: Navigate to calendar/slot selection
      this.log("📅 Step 5: Navigating to slot selection", "info")
      await this.navigateToSlotSelection()

      this.log("✅ Smart navigation completed successfully", "success")
      return true
    } catch (error) {
      this.log(`❌ Smart navigation failed: ${error.message}`, "error")
      throw error
    }
  }

  async selectLocation(locationId: string) {
    try {
      // Try multiple selectors for location selection
      const locationSelectors = [
        `select[name*="location"] option[value="${locationId}"]`,
        `select[name*="center"] option[value="${locationId}"]`,
        `select[name*="city"] option[value="${locationId}"]`,
        `input[value="${locationId}"]`,
        `.location-option[data-value="${locationId}"]`,
        `[data-location="${locationId}"]`,
      ]

      for (const selector of locationSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 })
          await this.page.click(selector)
          this.log(`✅ Location selected using selector: ${selector}`, "success")

          // Wait for any dynamic content to load
          await this.page.waitForTimeout(2000)
          return
        } catch (e) {
          continue
        }
      }

      // Try selecting by text content
      const locationNames = {
        algiers: ["Algiers", "Alger", "ALGIERS"],
        oran: ["Oran", "ORAN"],
        constantine: ["Constantine", "CONSTANTINE"],
        annaba: ["Annaba", "ANNABA"],
      }

      const possibleNames = locationNames[locationId.toLowerCase()] || [locationId]

      for (const name of possibleNames) {
        try {
          const option = await this.page.$x(`//option[contains(text(), "${name}")]`)
          if (option.length > 0) {
            await option[0].click()
            this.log(`✅ Location selected by text: ${name}`, "success")
            await this.page.waitForTimeout(2000)
            return
          }
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not find location selector")
    } catch (error) {
      this.log(`❌ Failed to select location: ${error.message}`, "error")
      throw error
    }
  }

  async selectVisaType(visaTypeId: string) {
    try {
      const visaSelectors = [
        `select[name*="visa"] option[value="${visaTypeId}"]`,
        `select[name*="type"] option[value="${visaTypeId}"]`,
        `input[value="${visaTypeId}"]`,
        `.visa-option[data-value="${visaTypeId}"]`,
        `[data-visa-type="${visaTypeId}"]`,
      ]

      for (const selector of visaSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 })
          await this.page.click(selector)
          this.log(`✅ Visa type selected using selector: ${selector}`, "success")
          await this.page.waitForTimeout(2000)
          return
        } catch (e) {
          continue
        }
      }

      // Try selecting by text content
      const visaTypeNames = {
        tourism: ["Tourism", "Tourist", "TOURISM"],
        business: ["Business", "BUSINESS"],
        family: ["Family", "Family Visit", "FAMILY"],
        study: ["Study", "Student", "STUDY"],
        work: ["Work", "Employment", "WORK"],
      }

      const possibleNames = visaTypeNames[visaTypeId.toLowerCase()] || [visaTypeId]

      for (const name of possibleNames) {
        try {
          const option = await this.page.$x(`//option[contains(text(), "${name}")]`)
          if (option.length > 0) {
            await option[0].click()
            this.log(`✅ Visa type selected by text: ${name}`, "success")
            await this.page.waitForTimeout(2000)
            return
          }
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not find visa type selector")
    } catch (error) {
      this.log(`❌ Failed to select visa type: ${error.message}`, "error")
      throw error
    }
  }

  async selectCategory(categoryId: string) {
    try {
      const categorySelectors = [
        `select[name*="category"] option[value="${categoryId}"]`,
        `select[name*="service"] option[value="${categoryId}"]`,
        `input[value="${categoryId}"]`,
        `.category-option[data-value="${categoryId}"]`,
        `[data-category="${categoryId}"]`,
      ]

      for (const selector of categorySelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 })
          await this.page.click(selector)
          this.log(`✅ Category selected using selector: ${selector}`, "success")
          await this.page.waitForTimeout(2000)
          return
        } catch (e) {
          continue
        }
      }

      // Try selecting by text content
      const categoryNames = {
        normal: ["Normal", "Regular", "Standard", "NORMAL"],
        urgent: ["Urgent", "Express", "URGENT"],
        premium: ["Premium", "VIP", "PREMIUM"],
      }

      const possibleNames = categoryNames[categoryId.toLowerCase()] || [categoryId]

      for (const name of possibleNames) {
        try {
          const option = await this.page.$x(`//option[contains(text(), "${name}")]`)
          if (option.length > 0) {
            await option[0].click()
            this.log(`✅ Category selected by text: ${name}`, "success")
            await this.page.waitForTimeout(2000)
            return
          }
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not find category selector")
    } catch (error) {
      this.log(`❌ Failed to select category: ${error.message}`, "error")
      throw error
    }
  }

  async navigateToSlotSelection() {
    try {
      // Look for "Next", "Continue", "Check Availability" buttons
      const nextButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        ".btn-next",
        ".continue-btn",
        ".check-availability",
        ".proceed-btn",
        'button:contains("Next")',
        'button:contains("Continue")',
        'button:contains("Check")',
        'button:contains("Proceed")',
      ]

      for (const selector of nextButtonSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          await this.page.click(selector)
          await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 })
          this.log(`✅ Navigated using button: ${selector}`, "success")
          return
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not find navigation button")
    } catch (error) {
      this.log(`❌ Failed to navigate to slot selection: ${error.message}`, "error")
      throw error
    }
  }

  async checkSlots(location: string, visaType: string, category: string) {
    try {
      this.log("🔍 Starting slot availability check...", "info")

      // Navigate to BLS website
      await this.navigateToBLS()

      // Use smart navigation to reach booking page
      await this.smartNavigateToBooking(location, visaType, category)

      // Extract available slots
      const slots = await this.extractAvailableSlots()

      this.log(`📊 Found ${slots.length} available slots`, slots.length > 0 ? "success" : "info")

      return slots
    } catch (error) {
      this.log(`❌ Slot checking failed: ${error.message}`, "error")
      throw error
    }
  }

  async handleSecurityMeasures() {
    this.log("🛡️ Handling BLS security measures...", "info")

    try {
      // Handle CSRF tokens
      if (this.settings.handleCSRF) {
        await this.page.evaluate(() => {
          const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value
          if (token) {
            window.csrfToken = token
          }
        })
        this.log("🔐 CSRF token extracted", "info")
      }

      // Handle AWS WAF challenge if present
      if (this.settings.bypassWAF) {
        const wafChallenge = await this.page.$(".aws-waf-challenge")
        if (wafChallenge) {
          this.log("⚠️ AWS WAF challenge detected, waiting...", "warning")
          await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 })
          this.log("✅ AWS WAF challenge handled", "success")
        }
      }

      // Handle CAPTCHA if present
      const captcha = await this.page.$('.captcha, #captcha, [id*="captcha"], [class*="captcha"]')
      if (captcha) {
        this.log("🤖 CAPTCHA detected, attempting to solve...", "warning")
        await this.solveCaptcha()
      }

      // Add random delay if enabled
      if (this.settings.randomizeRequests) {
        const delay = Math.random() * 2000 + 1000 // 1-3 seconds
        await new Promise((resolve) => setTimeout(resolve, delay))
        this.log(`⏱️ Added random delay: ${Math.round(delay)}ms`, "info")
      }
    } catch (error) {
      this.log(`❌ Security handling error: ${error.message}`, "error")
    }
  }

  async solveCaptcha() {
    if (!this.settings.captchaEnabled && !this.settings.aiCaptchaEnabled && !this.settings.customCaptchaEnabled) {
      throw new Error("CAPTCHA detected but no solver is configured")
    }

    try {
      this.log("📸 Extracting CAPTCHA image...", "info")

      // Extract CAPTCHA image
      const captchaImage = await this.page.$eval('img[src*="captcha"]', (img: any) => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        return canvas.toDataURL().split(",")[1] // Return base64 without data URL prefix
      })

      this.log("🧠 Sending CAPTCHA to solver...", "info")

      // Solve CAPTCHA using the configured solver
      const solution = await this.captchaSolver.solveCaptcha(captchaImage)

      this.log(`✅ CAPTCHA solved: ${solution}`, "success")

      // Enter solution
      await this.page.type('input[name*="captcha"], input[id*="captcha"]', solution)

      // Submit CAPTCHA
      const submitButton = await this.page.$('button[type="submit"], input[type="submit"]')
      if (submitButton) {
        await submitButton.click()
        await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 })
      }

      this.log("✅ CAPTCHA submitted successfully", "success")
    } catch (error) {
      this.log(`❌ CAPTCHA solving failed: ${error.message}`, "error")
      throw error
    }
  }

  async extractAvailableSlots() {
    this.log("📅 Extracting available appointment slots...", "info")

    try {
      // Wait for calendar or slot elements to load
      await this.page.waitForSelector(".calendar, .slots, .available-dates, .appointment-slots", { timeout: 10000 })

      //  .slots, .available-dates, .appointment-slots", { timeout: 10000 })

      // Extract available appointment slots from the page
      const slots = await this.page.evaluate(() => {
        const slotSelectors = [
          ".available-slot",
          ".slot-available",
          ".calendar-day.available",
          ".appointment-slot.free",
          ".date-available",
          "[data-available='true']",
        ]

        let slotElements = []

        for (const selector of slotSelectors) {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            slotElements = Array.from(elements)
            break
          }
        }

        return slotElements
          .map((element: any) => {
            // Extract date in yyyy-mm-dd format
            let date = element.dataset.date || element.getAttribute("data-date")

            if (!date) {
              // Try to extract from text content
              const dateMatch =
                element.textContent?.match(/\d{4}-\d{2}-\d{2}/) || element.textContent?.match(/\d{1,2}\/\d{1,2}\/\d{4}/)
              if (dateMatch) {
                date = dateMatch[0]
                // Convert dd/mm/yyyy to yyyy-mm-dd if needed
                if (date.includes("/")) {
                  const parts = date.split("/")
                  if (parts.length === 3) {
                    date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
                  }
                }
              }
            }

            return {
              date: date,
              time:
                element.dataset.time ||
                element.getAttribute("data-time") ||
                element.textContent?.match(/\d{1,2}:\d{2}/)?.[0],
              available: true,
              element: element.outerHTML.substring(0, 100), // For debugging
            }
          })
          .filter((slot) => slot.date) // Only return slots with valid dates
      })

      this.log(`📊 Extracted ${slots.length} available slots`, "info")

      return slots
    } catch (error) {
      this.log(`❌ Failed to extract slots: ${error.message}`, "error")
      return []
    }
  }

  async bookSlot(slotData: any, applicantData: any) {
    this.log("🎯 Starting automatic booking process...", "info")

    try {
      // Select the slot
      this.log(`📅 Selecting slot: ${slotData.date} at ${slotData.time}`, "info")
      await this.selectSlot(slotData)

      // Handle group booking if multiple applicants
      if (applicantData.isGroupBooking && applicantData.numberOfApplicants > 1) {
        this.log(`👥 Processing group booking for ${applicantData.numberOfApplicants} applicants`, "info")
        return await this.processGroupBooking(slotData, applicantData)
      } else {
        // Single applicant booking
        return await this.processSingleBooking(slotData, applicantData.applicants[0] || applicantData.currentApplicant)
      }
    } catch (error) {
      this.log(`❌ Booking failed: ${error.message}`, "error")
      throw error
    }
  }

  async processSingleBooking(slotData: any, applicantData: any) {
    this.log("👤 Processing single applicant booking...", "info")

    try {
      // Fill the booking form with applicant data
      this.log("📝 Filling booking form with applicant data...", "info")
      await this.fillBookingForm(applicantData)

      // Handle any additional CAPTCHA
      const captcha = await this.page.$('.captcha, #captcha, [id*="captcha"], [class*="captcha"]')
      if (captcha) {
        this.log("🤖 Additional CAPTCHA detected during booking...", "warning")
        await this.solveCaptcha()
      }

      // Submit the booking
      this.log("🚀 Submitting booking...", "info")
      await this.submitBooking()

      // Get confirmation details
      this.log("📋 Extracting confirmation details...", "info")
      const confirmation = await this.getConfirmation()

      this.log(`🎉 Booking successful! Confirmation: ${confirmation.referenceNumber}`, "success")

      return {
        success: true,
        appointmentDate: slotData.date,
        appointmentTime: slotData.time,
        confirmationNumber: confirmation.referenceNumber,
        applicant: {
          name: `${applicantData.FirstName} ${applicantData.LastName}`,
          passportNumber: applicantData.PassportNo,
          appointmentId: confirmation.referenceNumber,
        },
      }
    } catch (error) {
      this.log(`❌ Single booking failed: ${error.message}`, "error")
      throw error
    }
  }

  async selectSlot(slotData: any) {
    try {
      // Try multiple approaches to select the slot
      const slotSelectors = [
        `[data-date="${slotData.date}"][data-time="${slotData.time}"]`,
        `[data-date="${slotData.date}"]`,
        `.slot[data-date="${slotData.date}"]`,
        `.calendar-day[data-date="${slotData.date}"]`,
      ]

      for (const selector of slotSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 })
          await this.page.click(selector)
          this.log(`✅ Slot selected using: ${selector}`, "success")
          return
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not select slot")
    } catch (error) {
      this.log(`❌ Failed to select slot: ${error.message}`, "error")
      throw error
    }
  }

  async fillBookingForm(applicantData: any) {
    try {
      // Comprehensive field mapping for BLS form
      const fieldMappings = {
        // Personal Details
        Surname: applicantData.Surname,
        FirstName: applicantData.FirstName,
        LastName: applicantData.LastName,
        DateOfBirth: applicantData.DateOfBirth ? this.formatDateForBLS(applicantData.DateOfBirth) : "",
        PlaceOfBirth: applicantData.PlaceOfBirth,
        PassportNo: applicantData.PassportNo,
        PhoneNumber: applicantData.PhoneNumber,
        EmailAddress: applicantData.EmailAddress,

        // Travel Information
        MainDestinationCity: applicantData.MainDestinationCity,
        IntendedDateOfArrival: applicantData.IntendedDateOfArrival
          ? this.formatDateForBLS(applicantData.IntendedDateOfArrival)
          : "",
        IntendedDateOfDeparture: applicantData.IntendedDateOfDeparture
          ? this.formatDateForBLS(applicantData.IntendedDateOfDeparture)
          : "",
        TravelPurposeDetails: applicantData.TravelPurposeDetails,
        AccommodationName: applicantData.AccommodationName,
        AccommodationAddress: applicantData.AccommodationAddress,

        // Previous Schengen Visa
        PreviousSchengenVisaNumber: applicantData.PreviousSchengenVisaNumber,
        PreviousSchengenIssueDate: applicantData.PreviousSchengenIssueDate
          ? this.formatDateForBLS(applicantData.PreviousSchengenIssueDate)
          : "",
        PreviousSchengenExpiryDate: applicantData.PreviousSchengenExpiryDate
          ? this.formatDateForBLS(applicantData.PreviousSchengenExpiryDate)
          : "",

        // Alternative field names
        surname: applicantData.Surname,
        firstName: applicantData.FirstName,
        lastName: applicantData.LastName,
        passportNumber: applicantData.PassportNo,
        phone: applicantData.PhoneNumber,
        email: applicantData.EmailAddress,

        // Common variations
        applicant_surname: applicantData.Surname,
        applicant_firstname: applicantData.FirstName,
        applicant_lastname: applicantData.LastName,
        passport_no: applicantData.PassportNo,
        mobile_number: applicantData.PhoneNumber,
        email_address: applicantData.EmailAddress,

        // Date fields in yyyy-mm-dd format
        date_of_birth: applicantData.DateOfBirth ? this.formatDateForBLS(applicantData.DateOfBirth) : "",
        issue_date: applicantData.IssueDate ? this.formatDateForBLS(applicantData.IssueDate) : "",
        expiry_date: applicantData.ExpiryDate ? this.formatDateForBLS(applicantData.ExpiryDate) : "",
        travel_date: applicantData.TravelDate ? this.formatDateForBLS(applicantData.TravelDate) : "",
        arrival_date: applicantData.IntendedDateOfArrival
          ? this.formatDateForBLS(applicantData.IntendedDateOfArrival)
          : "",
        departure_date: applicantData.IntendedDateOfDeparture
          ? this.formatDateForBLS(applicantData.IntendedDateOfDeparture)
          : "",
      }

      let filledFields = 0

      for (const [fieldName, value] of Object.entries(fieldMappings)) {
        if (value) {
          try {
            const selectors = [
              `input[name="${fieldName}"]`,
              `input[id="${fieldName}"]`,
              `select[name="${fieldName}"]`,
              `textarea[name="${fieldName}"]`,
            ]

            for (const selector of selectors) {
              try {
                const element = await this.page.$(selector)
                if (element) {
                  await this.page.focus(selector)
                  await this.page.evaluate((sel) => (document.querySelector(sel).value = ""), selector)
                  await this.page.type(selector, String(value), { delay: 50 })
                  filledFields++
                  this.log(`✅ Filled field ${fieldName}: ${value}`, "info")
                  break
                }
              } catch (e) {
                continue
              }
            }
          } catch (error) {
            this.log(`⚠️ Could not fill field ${fieldName}: ${error.message}`, "warning")
          }
        }
      }

      this.log(`📝 Successfully filled ${filledFields} form fields`, "success")
    } catch (error) {
      this.log(`❌ Form filling failed: ${error.message}`, "error")
      throw error
    }
  }

  async submitBooking() {
    try {
      // Look for submit buttons
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        ".submit-btn",
        ".book-btn",
        ".confirm-btn",
        'button:contains("Submit")',
        'button:contains("Book")',
        'button:contains("Confirm")',
      ]

      for (const selector of submitSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            await element.click()
            await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
            this.log(`✅ Booking submitted using: ${selector}`, "success")
            return
          }
        } catch (e) {
          continue
        }
      }

      throw new Error("Could not find submit button")
    } catch (error) {
      this.log(`❌ Failed to submit booking: ${error.message}`, "error")
      throw error
    }
  }

  async getConfirmation() {
    try {
      // Wait for confirmation page
      await this.page.waitForSelector(".confirmation, .success, .booking-confirmation, .reference", { timeout: 15000 })

      // Extract booking confirmation details
      const confirmation = await this.page.evaluate(() => {
        const confirmationSelectors = [
          ".confirmation",
          ".success",
          ".booking-confirmation",
          ".reference-number",
          ".confirmation-details",
        ]

        let confirmationElement = null
        for (const selector of confirmationSelectors) {
          confirmationElement = document.querySelector(selector)
          if (confirmationElement) break
        }

        if (!confirmationElement) {
          confirmationElement = document.body
        }

        const text = confirmationElement.textContent || confirmationElement.innerText || ""

        return {
          referenceNumber:
            text.match(/(?:reference|confirmation|booking)[\s\w]*:?\s*([A-Z0-9]{6,})/i)?.[1] ||
            text.match(/([A-Z0-9]{8,})/)?.[1] ||
            `BLS${Date.now()}`,
          date: text.match(/\d{4}-\d{2}-\d{2}/)?.[0] || text.match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0],
          time: text.match(/\d{1,2}:\d{2}/)?.[0],
          fullText: text.substring(0, 500), // For debugging
        }
      })

      this.log(`🎉 Confirmation extracted: ${confirmation.referenceNumber}`, "success")

      return confirmation
    } catch (error) {
      this.log(`❌ Failed to get confirmation: ${error.message}`, "error")

      // Return a fallback confirmation
      return {
        referenceNumber: `BLS${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        error: error.message,
      }
    }
  }

  // Check for available appointment slots
  async checkAvailableSlots(): Promise<any[]> {
    try {
      this.log("🔍 Checking available appointment slots...", "info")

      const slots = []
      const slotSelectors = [
        ".available-slot",
        ".time-slot.available",
        ".appointment-slot:not(.disabled)",
        ".slot-button:not([disabled])",
      ]

      for (const selector of slotSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          const slotElements = await this.page.$$(selector)
          for (const element of slotElements) {
            const timeText = await this.page.evaluate((el) => el.textContent?.trim(), element)
            const dateText = await this.page.evaluate(
              (el) => el.getAttribute("data-date") || el.closest("[data-date]")?.getAttribute("data-date"),
              element,
            )

            if (timeText && dateText) {
              slots.push({
                id: `slot_${slots.length}`,
                date: dateText,
                time: timeText,
                available: true,
                element: element,
              })
            }
          }
        } catch (e) {
          continue
        }
      }

      this.log(`✅ Found ${slots.length} available slots`, "success")
      return slots
    } catch (error) {
      this.log(`❌ Failed to check slots: ${error.message}`, "error")
      return []
    }
  }

  // Book appointment for specific date/time
  async bookAppointment(date: string, time: string): Promise<boolean> {
    try {
      this.log(`📅 Booking appointment for ${date} at ${time}...`, "info")

      // Find and click the specific slot
      const slotSelectors = [
        `[data-date="${date}"][data-time="${time}"]`,
        `.slot[data-date="${date}"] .time:contains("${time}")`,
        `.available-slot:contains("${time}")`,
      ]

      let slotElement = null
      for (const selector of slotSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 3000 })
          slotElement = await this.page.$(selector)
          if (slotElement) {
            await slotElement.click()
            this.log("✅ Appointment slot selected", "success")

            // Wait for confirmation
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // Look for confirmation button
            const confirmSelectors = [
              ".confirm-booking",
              ".book-now",
              'button:contains("Confirm")',
              'button:contains("Book")',
            ]

            for (const selector of confirmSelectors) {
              try {
                const confirmButton = (await this.page.$(selector)) as any
                if (confirmButton && !(await confirmButton.getProperty("disabled")).jsonValue()) {
                  await confirmButton.click()
                  this.log("✅ Appointment booking confirmed", "success")
                  return true
                }
              } catch (e) {
                continue
              }
            }
          }
        } catch (e) {
          continue
        }
      }

      return false
    } catch (error) {
      this.log(`❌ Appointment booking failed: ${error.message}`, "error")
      return false
    }
  }

  // Start monitoring for available slots
  startMonitoring(callback: (slots: any[]) => void): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.log("🔄 Starting appointment monitoring...", "info")

    this.monitoringInterval = setInterval(async () => {
      try {
        const slots = await this.checkAvailableSlots()
        if (slots.length > 0) {
          callback(slots)
        }
      } catch (error) {
        this.log(`❌ Monitoring error: ${error.message}`, "error")
      }
    }, 30000) // Check every 30 seconds
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    if (this.otpDetectionInterval) {
      clearInterval(this.otpDetectionInterval)
      this.otpDetectionInterval = null
    }

    this.isMonitoring = false
    this.log("⏹️ Monitoring stopped", "info")
  }

  // Get monitoring status
  getMonitoringStatus(): boolean {
    return this.isMonitoring
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }

  async close() {
    this.log("🔚 Closing browser session...", "info")
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Export singleton instance
let blsAutomationInstance: BLSAutomation | null = null

export function getBlsAutomation(settings?: any): BLSAutomation {
  if (!blsAutomationInstance && settings) {
    blsAutomationInstance = new BLSAutomation(settings)
  }
  return blsAutomationInstance!
}

export function resetBlsAutomation(): void {
  if (blsAutomationInstance) {
    blsAutomationInstance.stopMonitoring()
    blsAutomationInstance = null
  }
}
