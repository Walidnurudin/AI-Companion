export interface Persona {
  id: string
  name: string
  system_prompt: string
  created_at: number
  updated_at: number
}

export interface Message {
  id: string
  user_id: string
  persona_id: string
  role: "user" | "assistant"
  content: string
  latency_ms?: number
  tokens_used?: number
  created_at: number
}

export interface ChatResponse {
  reply: string
  latency_ms: number
  tokens_used?: number
}
