import type { LLMProvider } from "./provider"

export class MockProvider implements LLMProvider {
  async generateReply(
    systemPrompt: string,
    userMessage: string,
  ): Promise<{ reply: string; latency_ms: number; tokens_used?: number }> {
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

    const responses: Record<string, string> = {
      hello: "Hello! How can I help you today?",
      hi: "Hi there! What can I do for you?",
      how: "I am doing great, thanks for asking!",
      default: `I understand you said: "${userMessage}". That's interesting! How can I assist you further?`,
    }

    const key = userMessage.toLowerCase().split(" ")[0]
    const reply = responses[key] || responses.default

    return {
      reply,
      latency_ms: 150,
      tokens_used: Math.floor(Math.random() * 100) + 50,
    }
  }
}
