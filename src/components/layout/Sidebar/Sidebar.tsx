import { NavLink } from 'react-router-dom'
import {
    House,
    WalletCards,
    History,
    ArrowLeftRight,
    MessageSquare,
    LogOut,
} from 'lucide-react'

import { CheeseCoin } from '../../BrandPanel/BrandPanel'
import './Sidebar.css'

interface SidebarProps {
    userName: string
    onLogout: () => void
}

function Sidebar({ userName, onLogout }: SidebarProps) {
    const initial = userName.charAt(0).toUpperCase()

    return (
        <aside className="sidebar">
            <NavLink to="/dashboard" className="sidebar-logo">
                <CheeseCoin className="sidebar-logo-icon" />

                <span>
                    Cheese
                    <br />
                    Cash
                </span>
            </NavLink>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <House size={20} />
                    <span>Home</span>
                </NavLink>

                <NavLink
                    to="/wallet"
                    className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    <WalletCards size={20} />
                    <span>Operar</span>
                </NavLink>

                <button className="sidebar-nav-item" disabled>
                    <History size={20} />
                    <span>Historial</span>
                </button>

                <button className="sidebar-nav-item" disabled>
                    <ArrowLeftRight size={20} />
                    <span>Conversor</span>
                </button>

                <button className="sidebar-nav-item" disabled>
                    <MessageSquare size={20} />
                    <span>Chatbot</span>
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
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    )
}

export default Sidebar