"use client"

import { useState, useEffect, useRef } from "react"
import { sendMessage, getPersonas } from "../api"
import type { Persona, Message } from "../types"
import "./ChatPage.css"

export function ChatPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId] = useState(() => `user-${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPersonas()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadPersonas() {
    try {
      const data = await getPersonas()
      console.log(data)
      setPersonas(data)
      if (data.length > 0) {
        setSelectedPersona(data[0].id)
      }
    } catch (error) {
      console.error("Failed to load personas:", error)
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || !selectedPersona || loading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      user_id: userId,
      persona_id: selectedPersona,
      role: "user",
      content: input,
      created_at: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await sendMessage(userId, selectedPersona, input)

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-reply`,
        user_id: userId,
        persona_id: selectedPersona,
        role: "assistant",
        content: response.reply,
        latency_ms: response.latency_ms,
        tokens_used: response.tokens_used,
        created_at: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        user_id: userId,
        persona_id: selectedPersona,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        created_at: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>AI Companion Chat</h1>
        <select
          value={selectedPersona}
          onChange={(e) => {
            setSelectedPersona(e.target.value)
            setMessages([])
          }}
          className="persona-select"
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation with {personas.find((p) => p.id === selectedPersona)?.name || "the AI"}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.role}`}>
              <div className="message-content">{msg.content}</div>
              {msg.role === "assistant" && msg.latency_ms && (
                <div className="message-meta">
                  {msg.latency_ms}ms
                  {msg.tokens_used && ` • ${msg.tokens_used} tokens`}
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="message message-assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your message..."
          disabled={loading}
          className="message-input"
        />
        <button onClick={handleSendMessage} disabled={loading || !input.trim()} className="send-button">
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  )
}
