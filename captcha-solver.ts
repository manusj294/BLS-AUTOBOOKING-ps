export interface CaptchaSolverConfig {
  provider: string
  apiKey: string
  aiEnabled: boolean
  aiProvider: string
  aiApiKey: string
  aiModel: string
  customEnabled: boolean
  customApiUrl: string
  customApiKey: string
  customMethod: string
  customHeaders: string
  customPayload: string
  customResponsePath: string
}

export class CaptchaSolver {
  private config: CaptchaSolverConfig

  constructor(config: CaptchaSolverConfig) {
    this.config = config
  }

  async solveCaptcha(imageBase64: string): Promise<string> {
    // Try traditional CAPTCHA services first
    if (this.config.apiKey) {
      try {
        return await this.solveWithTraditionalService(imageBase64)
      } catch (error) {
        console.log("Traditional CAPTCHA service failed, trying AI fallback...")
      }
    }

    // Try AI CAPTCHA solving as fallback
    if (this.config.aiEnabled && this.config.aiApiKey) {
      try {
        return await this.solveWithAI(imageBase64)
      } catch (error) {
        console.log("AI CAPTCHA solving failed, trying custom API...")
      }
    }

    // Try custom CAPTCHA API as last resort
    if (this.config.customEnabled && this.config.customApiUrl) {
      try {
        return await this.solveWithCustomAPI(imageBase64)
      } catch (error) {
        console.log("Custom CAPTCHA API failed")
      }
    }

    throw new Error("All CAPTCHA solving methods failed")
  }

  private async solveWithTraditionalService(imageBase64: string): Promise<string> {
    const apiKey = this.config.apiKey
    const provider = this.config.provider

    switch (provider) {
      case "2captcha":
        return await this.solve2Captcha(imageBase64, apiKey)
      case "anticaptcha":
        return await this.solveAntiCaptcha(imageBase64, apiKey)
      case "deathbycaptcha":
        return await this.solveDeathByCaptcha(imageBase64, apiKey)
      case "capmonster":
        return await this.solveCapMonster(imageBase64, apiKey)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private async solve2Captcha(imageBase64: string, apiKey: string): Promise<string> {
    // Submit CAPTCHA
    const submitResponse = await fetch("http://2captcha.com/in.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        method: "base64",
        key: apiKey,
        body: imageBase64,
      }),
    })

    const submitText = await submitResponse.text()
    if (!submitText.startsWith("OK|")) {
      throw new Error(`2Captcha submit failed: ${submitText}`)
    }

    const captchaId = submitText.split("|")[1]

    // Poll for result
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const resultResponse = await fetch(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}`)
      const resultText = await resultResponse.text()

      if (resultText.startsWith("OK|")) {
        return resultText.split("|")[1]
      } else if (resultText !== "CAPCHA_NOT_READY") {
        throw new Error(`2Captcha result failed: ${resultText}`)
      }
    }

    throw new Error("2Captcha timeout")
  }

  private async solveAntiCaptcha(imageBase64: string, apiKey: string): Promise<string> {
    // Submit CAPTCHA
    const submitResponse = await fetch("https://api.anti-captcha.com/createTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: apiKey,
        task: {
          type: "ImageToTextTask",
          body: imageBase64,
        },
      }),
    })

    const submitData = await submitResponse.json()
    if (submitData.errorId !== 0) {
      throw new Error(`AntiCaptcha submit failed: ${submitData.errorDescription}`)
    }

    const taskId = submitData.taskId

    // Poll for result
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const resultResponse = await fetch("https://api.anti-captcha.com/getTaskResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: apiKey,
          taskId: taskId,
        }),
      })

      const resultData = await resultResponse.json()

      if (resultData.status === "ready") {
        return resultData.solution.text
      } else if (resultData.status !== "processing") {
        throw new Error(`AntiCaptcha result failed: ${resultData.errorDescription}`)
      }
    }

    throw new Error("AntiCaptcha timeout")
  }

  private async solveDeathByCaptcha(imageBase64: string, apiKey: string): Promise<string> {
    const [username, password] = apiKey.split(":")
    if (!username || !password) {
      throw new Error("DeathByCaptcha requires username:password format")
    }

    // Submit CAPTCHA
    const submitResponse = await fetch("http://api.dbcapi.me/api/captcha", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: username,
        password: password,
        captchafile: `data:image/png;base64,${imageBase64}`,
      }),
    })

    const submitData = await submitResponse.json()
    if (!submitData.captcha) {
      throw new Error(`DeathByCaptcha submit failed: ${JSON.stringify(submitData)}`)
    }

    const captchaId = submitData.captcha

    // Poll for result
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const resultResponse = await fetch(`http://api.dbcapi.me/api/captcha/${captchaId}`, {
        method: "GET",
      })

      const resultData = await resultResponse.json()

      if (resultData.text) {
        return resultData.text
      } else if (resultData.is_correct === false) {
        throw new Error("DeathByCaptcha solving failed")
      }
    }

    throw new Error("DeathByCaptcha timeout")
  }

  private async solveCapMonster(imageBase64: string, apiKey: string): Promise<string> {
    // Submit CAPTCHA
    const submitResponse = await fetch("https://api.capmonster.cloud/createTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: apiKey,
        task: {
          type: "ImageToTextTask",
          body: imageBase64,
        },
      }),
    })

    const submitData = await submitResponse.json()
    if (submitData.errorId !== 0) {
      throw new Error(`CapMonster submit failed: ${submitData.errorDescription}`)
    }

    const taskId = submitData.taskId

    // Poll for result
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      const resultResponse = await fetch("https://api.capmonster.cloud/getTaskResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: apiKey,
          taskId: taskId,
        }),
      })

      const resultData = await resultResponse.json()

      if (resultData.status === "ready") {
        return resultData.solution.text
      } else if (resultData.status !== "processing") {
        throw new Error(`CapMonster result failed: ${resultData.errorDescription}`)
      }
    }

    throw new Error("CapMonster timeout")
  }

  private async solveWithAI(imageBase64: string): Promise<string> {
    const provider = this.config.aiProvider
    const apiKey = this.config.aiApiKey
    const model = this.config.aiModel

    switch (provider) {
      case "openai":
        return await this.solveWithOpenAI(imageBase64, apiKey, model)
      case "anthropic":
        return await this.solveWithAnthropic(imageBase64, apiKey, model)
      case "google":
        return await this.solveWithGoogle(imageBase64, apiKey, model)
      case "groq":
        return await this.solveWithGroq(imageBase64, apiKey, model)
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  private async solveWithOpenAI(imageBase64: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please solve this CAPTCHA image. Return only the text/characters you see, nothing else.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 50,
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(`OpenAI error: ${data.error.message}`)
    }

    return data.choices[0].message.content.trim()
  }

  private async solveWithAnthropic(imageBase64: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please solve this CAPTCHA image. Return only the text/characters you see, nothing else.",
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(`Anthropic error: ${data.error.message}`)
    }

    return data.content[0].text.trim()
  }

  private async solveWithGoogle(imageBase64: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Please solve this CAPTCHA image. Return only the text/characters you see, nothing else.",
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    if (data.error) {
      throw new Error(`Google error: ${data.error.message}`)
    }

    return data.candidates[0].content.parts[0].text.trim()
  }

  private async solveWithGroq(imageBase64: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please solve this CAPTCHA image. Return only the text/characters you see, nothing else.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 50,
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(`Groq error: ${data.error.message}`)
    }

    return data.choices[0].message.content.trim()
  }

  private async solveWithCustomAPI(imageBase64: string): Promise<string> {
    try {
      const headers = JSON.parse(this.config.customHeaders || "{}")
      const payloadTemplate = this.config.customPayload || "{}"

      // Replace placeholders in payload
      const payload = payloadTemplate
        .replace(/\{IMAGE_BASE64\}/g, imageBase64)
        .replace(/\{API_KEY\}/g, this.config.customApiKey)

      const response = await fetch(this.config.customApiUrl, {
        method: this.config.customMethod,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: payload,
      })

      const data = await response.json()

      // Extract result using response path
      const responsePath = this.config.customResponsePath || "result"
      const pathParts = responsePath.split(".")

      let result = data
      for (const part of pathParts) {
        if (result && typeof result === "object" && part in result) {
          result = result[part]
        } else {
          throw new Error(`Could not find path ${responsePath} in response`)
        }
      }

      if (typeof result !== "string") {
        throw new Error("CAPTCHA result is not a string")
      }

      return result.trim()
    } catch (error) {
      throw new Error(`Custom API error: ${error.message}`)
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create a simple test image (1x1 pixel base64)
      const testImage =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

      await this.solveCaptcha(testImage)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
