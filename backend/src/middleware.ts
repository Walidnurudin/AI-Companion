import type { Request, Response, NextFunction } from "express"

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"]
  const validKey = process.env.API_KEY || "dev-123"

  if (apiKey !== validKey) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  next()
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err)
  res.status(500).json({ error: err.message || "Internal server error" })
}
