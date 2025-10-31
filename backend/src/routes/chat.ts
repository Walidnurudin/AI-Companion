import { Router, type Request, type Response } from "express"
import { db } from "../db"
import type { ChatRequest, ChatResponse, Message } from "../types"
import type { LLMProvider } from "../llm/provider"
import { checkSafety, getSafetyReply } from "../safety"
import { v4 as uuidv4 } from "uuid"

export function createChatRouter(llmProvider: LLMProvider) {
  const router = Router()

  router.post("/chat", async (req: Request, res: Response) => {
    try {
      const { user_id, persona_id, message } = req.body as ChatRequest

      if (!user_id || !persona_id || !message) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Safety check
      const safety = checkSafety(message)
      if (!safety.safe) {
        const userMsg: Message = {
          id: uuidv4(),
          user_id,
          persona_id,
          role: "user",
          content: message,
          created_at: Date.now(),
        }
        db.prepare(`
          INSERT INTO messages (id, user_id, persona_id, role, content, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userMsg.id, user_id, persona_id, "user", message, userMsg.created_at)

        const safeReply = getSafetyReply()
        const assistantMsg: Message = {
          id: uuidv4(),
          user_id,
          persona_id,
          role: "assistant",
          content: safeReply,
          created_at: Date.now(),
        }
        db.prepare(`
          INSERT INTO messages (id, user_id, persona_id, role, content, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(assistantMsg.id, user_id, persona_id, "assistant", safeReply, assistantMsg.created_at)

        return res.json({ reply: safeReply, latency_ms: 10 } as ChatResponse)
      }

      // Get persona
      const persona = db.prepare("SELECT * FROM personas WHERE id = ?").get(persona_id) as any
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" })
      }

      // Save user message
      const userMsgId = uuidv4()
      db.prepare(`
        INSERT INTO messages (id, user_id, persona_id, role, content, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userMsgId, user_id, persona_id, "user", message, Date.now())

      // Generate reply
      const llmResult = await llmProvider.generateReply(persona.system_prompt, message)

      // Save assistant message
      const assistantMsgId = uuidv4()
      db.prepare(`
        INSERT INTO messages (id, user_id, persona_id, role, content, latency_ms, tokens_used, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        assistantMsgId,
        user_id,
        persona_id,
        "assistant",
        llmResult.reply,
        llmResult.latency_ms,
        llmResult.tokens_used || null,
        Date.now(),
      )

      res.json({
        reply: llmResult.reply,
        latency_ms: llmResult.latency_ms,
        tokens_used: llmResult.tokens_used,
      } as ChatResponse)
    } catch (error) {
      console.error("Chat error:", error)
      res.status(500).json({ error: "Failed to generate reply" })
    }
  })

  return router
}
