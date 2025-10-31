const BANNED_TERMS = ["minor", "under 18", "teen", "child", "high school"]

export function checkSafety(message: string): { safe: boolean; reason?: string } {
  const lowerMessage = message.toLowerCase()

  for (const term of BANNED_TERMS) {
    if (lowerMessage.includes(term)) {
      return {
        safe: false,
        reason: `Message contains restricted content: "${term}"`,
      }
    }
  }

  return { safe: true }
}

export function getSafetyReply(): string {
  return "I can't engage with that topic. Let's talk about something else!"
}
