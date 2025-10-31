import { Router, type Request, type Response } from "express"
import { db } from "../db"
import type { MetricsSummary } from "../types"

const router = Router()

router.get("/metrics/summary", (req: Request, res: Response) => {
  try {
    const totalUsers = (db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM messages").get() as any).count
    const totalMessages = (db.prepare("SELECT COUNT(*) as count FROM messages").get() as any).count

    const personaMetrics = db
      .prepare(`
      SELECT p.id, p.name, COUNT(m.id) as message_count
      FROM personas p
      LEFT JOIN messages m ON p.id = m.persona_id
      GROUP BY p.id
      ORDER BY message_count DESC
    `)
      .all() as any[]

    const summary: MetricsSummary = {
      total_users: totalUsers,
      total_messages: totalMessages,
      personas: personaMetrics.map((p) => ({
        persona_id: p.id,
        persona_name: p.name,
        message_count: p.message_count,
      })),
    }

    res.json(summary)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" })
  }
})

export default router
