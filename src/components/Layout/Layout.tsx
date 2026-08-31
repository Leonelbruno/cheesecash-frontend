import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './Layout.css'

/* ── Coin mark (mismos gradientes del auth) ── */
function CoinMark() {
  return (
    <svg className="mark" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="21" fill="url(#rimGrad)" />
      <circle cx="24" cy="24" r="18.4" fill="url(#cheeseGrad)" />
      <circle cx="16.5" cy="17" r="3.3" fill="url(#holeGrad)" />
      <circle cx="27" cy="14.5" r="2" fill="url(#holeGrad)" />
      <circle cx="30.5" cy="25.5" r="3.7" fill="url(#holeGrad)" />
      <circle cx="18" cy="29.5" r="2.5" fill="url(#holeGrad)" />
      <circle cx="23.5" cy="22" r="1.4" fill="url(#holeGrad)" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/operar',    icon: '↕️', label: 'Operar' },
  { to: '/historial', icon: '🕐', label: 'Historial' },
  { to: '/conversor', icon: '⇄',  label: 'Conversor' },
  { to: '/transferir',icon: '→',  label: 'Transferir' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="app-shell">
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <CoinMark />
          <span className="wordmark">Cheese Cash</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer: usuario + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.fullName ?? 'Usuario'}</div>
              <div className="user-plan">Premium</div>
            </div>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>

      </aside>

      {/* Contenido de la ruta activa */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
