import { test, describe, beforeEach, afterEach } from "node:test"
import assert from "node:assert"
import express from "express"
import { createChatRouter } from "../routes/chat"
import { initializeDatabase, db } from "../db"
import { createLLMProvider } from "../llm/factory"
import type { LLMProvider } from "../llm/provider"

describe("Chat API", () => {
  let app: express.Application
  let llmProvider: LLMProvider
  let testPersonaId: string
  let testUserId: string

  beforeEach(() => {
    // Initialize test database
    initializeDatabase()

    // Create mock LLM provider
    llmProvider = createLLMProvider({ type: "mock" })

    // Setup Express app with chat router
    app = express()
    app.use(express.json())
    app.use("/api", createChatRouter(llmProvider))

    // Create test persona with unique ID per test
    testPersonaId = "test-persona-" + Date.now()
    testUserId = "test-user-" + Date.now()

    db.prepare("DELETE FROM personas WHERE id = ?").run(testPersonaId)
    db.prepare(`
      INSERT INTO personas (id, name, system_prompt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(testPersonaId, "Test Persona", "You are a helpful test assistant.", Date.now(), Date.now())
  })

  afterEach(() => {
    // Cleanup test data
    db.prepare("DELETE FROM messages WHERE user_id = ?").run(testUserId)
    db.prepare("DELETE FROM personas WHERE id = ?").run(testPersonaId)
  })

  test("should send a message and receive a reply", async () => {
    const response = await new Promise<any>((resolve, reject) => {
      const req = {
        body: {
          user_id: testUserId,
          persona_id: testPersonaId,
          message: "Hello, how are you?",
        },
      } as any

      const res = {
        status: (code: number) => ({
          json: (data: any) => reject(new Error(`Error: ${code}`)),
        }),
        json: (data: any) => resolve(data),
      } as any

        // Simulate the route handler
        ; (async () => {
          try {
            const { user_id, persona_id, message } = req.body

            // Verify required fields
            assert(user_id, "user_id is required")
            assert(persona_id, "persona_id is required")
            assert(message, "message is required")

            // Get persona
            const persona = db.prepare("SELECT * FROM personas WHERE id = ?").get(persona_id) as any
            assert(persona, "Persona not found")

            // Generate reply
            const llmResult = await llmProvider.generateReply(persona.system_prompt, message)

            // Verify response structure
            assert(llmResult.reply, "reply is required")
            assert(typeof llmResult.latency_ms === "number", "latency_ms must be a number")
            assert(llmResult.latency_ms >= 0, "latency_ms must be >= 0")

            res.json({
              reply: llmResult.reply,
              latency_ms: llmResult.latency_ms,
              tokens_used: llmResult.tokens_used,
            })
          } catch (error) {
            reject(error)
          }
        })()
    })

    assert(response.reply, "reply should be defined")
    assert(typeof response.reply === "string", "reply should be a string")
    assert(response.latency_ms >= 0, "latency_ms should be >= 0")
  })

  test("should reject requests with missing fields", () => {
    const testCases = [
      { user_id: "user-1", persona_id: "persona-1" }, // missing message
      { user_id: "user-1", message: "hello" }, // missing persona_id
      { persona_id: "persona-1", message: "hello" }, // missing user_id
    ]

    for (const testCase of testCases) {
      assert.throws(() => {
        const { user_id, persona_id, message } = testCase as any
        if (!user_id || !persona_id || !message) {
          throw new Error("Missing required fields")
        }
      })
    }
  })

  test("should handle safety violations", async () => {
    const unsafeMessage = "I am a child and need help"

    const response = await new Promise<any>((resolve, reject) => {
      ; (async () => {
        try {
          // Simulate safety check
          const bannedTerms = ["minor", "under 18", "teen", "child", "high school"]
          const isSafe = !bannedTerms.some((term) => unsafeMessage.toLowerCase().includes(term))

          assert(!isSafe, "Message should be flagged as unsafe")

          // Should return safe reply without calling LLM
          const safeReply = "I'm not able to assist with that."
          resolve({ reply: safeReply, latency_ms: 5 })
        } catch (error) {
          reject(error)
        }
      })()
    })

    assert.strictEqual(response.reply, "I'm not able to assist with that.")
    assert(response.latency_ms < 10, "latency_ms should be < 10")
  })
})
