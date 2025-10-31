import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, "companion.db")
export const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

export function initializeDatabase() {
  // Personas table
  db.exec(`
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      persona_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      latency_ms INTEGER,
      tokens_used INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (persona_id) REFERENCES personas(id)
    )
  `)

  // Create default persona if none exist
  const defaultPersona = db.prepare("SELECT COUNT(*) as count FROM personas").get() as { count: number }
  if (defaultPersona.count === 0) {
    const id = "default-" + Date.now()
    db.prepare(`
      INSERT INTO personas (id, name, system_prompt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      "Helpful Assistant",
      "You are a helpful, friendly AI assistant. Be concise and clear.",
      Date.now(),
      Date.now(),
    )
  }
}
