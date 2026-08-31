import './Sidebar.css'

interface SidebarProps {
    userName: string
    onLogout: () => void
}

function Sidebar({ userName, onLogout }: SidebarProps) {
    const initial = userName.charAt(0).toUpperCase()

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-logo-icon">🧀</span>

                <span>
                    Cheese
                    <br />
                    Cash
                </span>
            </div>

            <nav className="sidebar-nav">
                <button className="sidebar-nav-item active">
                    <span>⌂</span>
                    Home
                </button>

                <button className="sidebar-nav-item">
                    <span>$</span>
                    Operar
                </button>

                <button className="sidebar-nav-item">
                    <span>◷</span>
                    Historial
                </button>

                <button className="sidebar-nav-item">
                    <span>⇄</span>
                    Conversor
                </button>

                <button className="sidebar-nav-item">
                    <span>▢</span>
                    Chatbot
                </button>
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-avatar">{initial}</div>

                <div className="sidebar-user-info">
                    <strong>{userName}</strong>
                    <span>Premium</span>
                </div>

                <button
                    className="sidebar-logout"
                    onClick={onLogout}
                    title="Cerrar sesión"
                >
                    ↪
                </button>
            </div>
        </aside>
    )
}

export default Sidebar