"use client"

import { useState, useEffect } from "react"
import { getPersonas, createPersona, updatePersona, getMetrics } from "../api"
import type { Persona } from "../types"
import "./DashboardPage.css"

interface Metrics {
  total_users: number
  total_messages: number
  personas: Array<{
    persona_id: string
    persona_name: string
    message_count: number
  }>
}

export function DashboardPage() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", system_prompt: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      const [personasData, metricsData] = await Promise.all([getPersonas(), getMetrics()])
      setPersonas(personasData)
      setMetrics(metricsData)
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.system_prompt.trim()) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        await updatePersona(editingId, formData.name, formData.system_prompt)
      } else {
        await createPersona(formData.name, formData.system_prompt)
      }
      setFormData({ name: "", system_prompt: "" })
      setEditingId(null)
      await loadData()
    } catch (error) {
      console.error("Failed to save persona:", error)
      alert("Failed to save persona")
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(persona: Persona) {
    setEditingId(persona.id)
    setFormData({ name: persona.name, system_prompt: persona.system_prompt })
  }

  function handleCancel() {
    setEditingId(null)
    setFormData({ name: "", system_prompt: "" })
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>AI Companion Dashboard</h1>
      </div>

      <div className="dashboard-content">
        {/* Metrics Section */}
        <div className="metrics-section">
          <h2>Usage Metrics</h2>
          {metrics ? (
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Users</div>
                <div className="metric-value">{metrics.total_users}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total Messages</div>
                <div className="metric-value">{metrics.total_messages}</div>
              </div>
            </div>
          ) : (
            <p>Loading metrics...</p>
          )}

          {metrics && metrics.personas.length > 0 && (
            <div className="personas-metrics">
              <h3>Messages by Persona</h3>
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Persona</th>
                    <th>Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.personas.map((p) => (
                    <tr key={p.persona_id}>
                      <td>{p.persona_name}</td>
                      <td>{p.message_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Personas Management Section */}
        <div className="personas-section">
          <h2>Manage Personas</h2>

          {/* Form */}
          <div className="persona-form">
            <h3>{editingId ? "Edit Persona" : "Create New Persona"}</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Helpful Assistant"
              />
            </div>
            <div className="form-group">
              <label>System Prompt</label>
              <textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="e.g., You are a helpful AI assistant..."
                rows={4}
              />
            </div>
            <div className="form-actions">
              <button onClick={handleSave} disabled={loading} className="btn-primary">
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Personas List */}
          <div className="personas-list">
            <h3>Existing Personas</h3>
            {personas.length === 0 ? (
              <p className="empty-message">No personas yet. Create one to get started!</p>
            ) : (
              <div className="personas-grid">
                {personas.map((persona) => (
                  <div key={persona.id} className="persona-card">
                    <div className="persona-name">{persona.name}</div>
                    <div className="persona-prompt">{persona.system_prompt}</div>
                    <button onClick={() => handleEdit(persona)} className="btn-edit">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
