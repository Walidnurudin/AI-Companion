import type { LLMProvider, LLMConfig } from "./provider"
import { OpenAIProvider } from "./openai-provider"
import { OllamaProvider } from "./ollama-provider"
import { MockProvider } from "./mock-provider"

export function createLLMProvider(config: LLMConfig): LLMProvider {
  switch (config.type) {
    case "openai":
      if (!config.apiKey) throw new Error("OpenAI API key required")
      return new OpenAIProvider(config.apiKey, config.model)
    case "ollama":
      return new OllamaProvider(config.baseUrl, config.model)
    case "mock":
      return new MockProvider()
    default:
      throw new Error(`Unknown LLM provider: ${config.type}`)
  }
}
