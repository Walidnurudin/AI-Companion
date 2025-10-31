import type { LLMProvider } from "./provider"

export class OllamaProvider implements LLMProvider {
  private baseUrl: string
  private model: string

  constructor(baseUrl = "http://localhost:11434", model = "gemma3:1b") {
    this.baseUrl = baseUrl
    this.model = model
  }

  async generateReply(
    systemPrompt: string,
    userMessage: string,
  ): Promise<{ reply: string; latency_ms: number; tokens_used?: number }> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = (await response.json()) as any
      const latency_ms = Date.now() - startTime

      return {
        reply: data.message.content,
        latency_ms,
      }
    } catch (error) {
      console.error("Ollama error:", error)
      throw error
    }
  }
}
