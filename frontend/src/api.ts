const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
const API_KEY = import.meta.env.VITE_API_KEY || "dev-123"

const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
}

console.log({
  API_URL,
  API_KEY,
  real_API_KEY: import.meta.env.VITE_API_KEY,
  real_API_URL: import.meta.env.VITE_API_URL,
})

export async function sendMessage(userId: string, personaId: string, message: string) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId, persona_id: personaId, message }),
  })

  if (!response.ok) throw new Error("Failed to send message")
  return (await response.json()) as any
}

export async function getPersonas() {
  const response = await fetch(`${API_URL}/personas`, { headers })
  if (!response.ok) throw new Error("Failed to fetch personas")
  return (await response.json()) as any[]
}

export async function createPersona(name: string, system_prompt: string) {
  const response = await fetch(`${API_URL}/personas`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, system_prompt }),
  })

  if (!response.ok) throw new Error("Failed to create persona")
  return (await response.json()) as any
}

export async function updatePersona(id: string, name: string, system_prompt: string) {
  const response = await fetch(`${API_URL}/personas/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ name, system_prompt }),
  })

  if (!response.ok) throw new Error("Failed to update persona")
  return (await response.json()) as any
}

export async function getMetrics() {
  const response = await fetch(`${API_URL}/metrics/summary`, { headers })
  if (!response.ok) throw new Error("Failed to fetch metrics")
  return (await response.json()) as any
}
