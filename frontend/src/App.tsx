"use client"

import { useState } from "react"
import { ChatPage } from "./components/ChatPage"
import { DashboardPage } from "./components/DashboardPage"
import "./App.css"
import Navbar from "./components/Navbar"

function App() {
  const [currentPage, setCurrentPage] = useState<"chat" | "dashboard">("chat")

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="app-main">{currentPage === "chat" ? <ChatPage /> : <DashboardPage />}</main>
    </div>
  )
}

export default App
