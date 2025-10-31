export interface LLMProvider {
  generateReply(
    systemPrompt: string,
    userMessage: string,
  ): Promise<{
    reply: string
    latency_ms: number
    tokens_used?: number
  }>
}

export interface LLMConfig {
  type: "openai" | "ollama" | "mock"
  apiKey?: string
  baseUrl?: string
  model?: string
}
