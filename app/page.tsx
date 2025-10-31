// The actual app runs in the separate React Vite frontend at /frontend
export default function Page() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>AI Companion</h1>
      <p>The frontend runs separately. Start the app with:</p>
      <pre style={{ background: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>npm run dev</pre>
      <p>
        Then visit <strong>http://localhost:5173</strong>
      </p>
    </div>
  )
}
