import { Outlet } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import Sidebar from '../Sidebar/Sidebar'
import './AppLayout.css'

function AppLayout() {
    const { user, logout } = useAuth()

    const userName = user?.full_name || 'Usuario'

    return (
        <div className="app-layout">
            <Sidebar userName={userName} onLogout={logout} />

            <div className="app-layout-content">
                <Outlet />
            </div>
        </div>
    )
}

export default AppLayout