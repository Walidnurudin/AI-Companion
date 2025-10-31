import type { LLMProvider } from "./provider"

export class OpenAIProvider implements LLMProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = "gpt-3.5-turbo") {
    this.apiKey = apiKey
    this.model = model
  }

  async generateReply(
    systemPrompt: string,
    userMessage: string,
  ): Promise<{ reply: string; latency_ms: number; tokens_used?: number }> {
    const startTime = Date.now()

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = (await response.json()) as any
      const latency_ms = Date.now() - startTime

      return {
        reply: data.choices[0].message.content,
        latency_ms,
        tokens_used: data.usage?.total_tokens,
      }
    } catch (error) {
      console.error("OpenAI error:", error)
      throw error
    }
  }
}
