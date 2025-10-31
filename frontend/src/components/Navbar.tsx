
const Navbar = ({
    currentPage,
    setCurrentPage,
}: {
    currentPage: "chat" | "dashboard"
    setCurrentPage: (page: "chat" | "dashboard") => void
}) => {
    return (
        <nav className="app-nav">
            <div className="nav-brand">AI Companion</div>
            <div className="nav-links">
                <button
                    className={`nav-link ${currentPage === "chat" ? "active" : ""}`}
                    onClick={() => setCurrentPage("chat")}
                >
                    Chat
                </button>
                <button
                    className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
                    onClick={() => setCurrentPage("dashboard")}
                >
                    Dashboard
                </button>
            </div>
        </nav>
    )
}

export default Navbar