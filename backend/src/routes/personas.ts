import { Router, type Request, type Response } from "express"
import { db } from "../db"
import type { Persona } from "../types"
import { v4 as uuidv4 } from "uuid"

const router = Router()

router.get("/personas", (req: Request, res: Response) => {
  try {
    const personas = db.prepare("SELECT * FROM personas ORDER BY created_at DESC").all() as Persona[]
    res.json(personas)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch personas" })
  }
})

router.post("/personas", (req: Request, res: Response) => {
  try {
    const { name, system_prompt } = req.body

    if (!name || !system_prompt) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const id = uuidv4()
    const now = Date.now()

    db.prepare(`
      INSERT INTO personas (id, name, system_prompt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, system_prompt, now, now)

    const persona = db.prepare("SELECT * FROM personas WHERE id = ?").get(id) as Persona
    res.status(201).json(persona)
  } catch (error) {
    res.status(500).json({ error: "Failed to create persona" })
  }
})

router.put("/personas/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, system_prompt } = req.body

    if (!name || !system_prompt) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const now = Date.now()
    db.prepare(`
      UPDATE personas SET name = ?, system_prompt = ?, updated_at = ?
      WHERE id = ?
    `).run(name, system_prompt, now, id)

    const persona = db.prepare("SELECT * FROM personas WHERE id = ?").get(id) as Persona
    if (!persona) {
      return res.status(404).json({ error: "Persona not found" })
    }

    res.json(persona)
  } catch (error) {
    res.status(500).json({ error: "Failed to update persona" })
  }
})

export default router
