import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { initializeDatabase } from "./db"
import { apiKeyMiddleware, errorHandler } from "./middleware"
import { createChatRouter } from "./routes/chat"
import personasRouter from "./routes/personas"
import metricsRouter from "./routes/metrics"
import { createLLMProvider } from "./llm/factory"
import type { LLMConfig } from "./llm/provider"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(apiKeyMiddleware)

// Initialize database
initializeDatabase()

// Create LLM provider
const llmConfig: LLMConfig = {
  type: (process.env.LLM_PROVIDER as any) || "ollama",
  apiKey: process.env.OPENAI_API_KEY,
  baseUrl: process.env.OLLAMA_BASE_URL,
  model: process.env.LLM_MODEL,
}

const llmProvider = createLLMProvider(llmConfig)

// Routes
app.use("/api", createChatRouter(llmProvider))
app.use("/api", personasRouter)
app.use("/api", metricsRouter)

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`LLM Provider: ${llmConfig.type}`)
})
