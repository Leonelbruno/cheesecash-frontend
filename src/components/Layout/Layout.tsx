import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import CheeseCashLogo from '../CheeseCashLogo/CheeseCashLogo'
import './Layout.css'

/* ── SVG Icons ── */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" />
      <polyline points="9 21 9 13 15 13 15 21" />
    </svg>
  )
}
function IconOperar({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}
function IconHistorial({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function IconConversor({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  )
}
function IconTransferir({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', Icon: IconHome },
  { to: '/operar', label: 'Operar', Icon: IconOperar },
  { to: '/historial', label: 'Historial', Icon: IconHistorial },
  { to: '/conversor', label: 'Conversor', Icon: IconConversor },
  { to: '/transferir', label: 'Transferir', Icon: IconTransferir },
]

/* ── Bottom nav (solo mobile) ── */
function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <span className="bottom-nav-icon"><Icon active={isActive} /></span>
              <span className="bottom-nav-label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.fullName
    ? user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : '?'

  return (
    <div className="app-shell">

      {/* Header (solo mobile) */}
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <CheeseCashLogo size={28} />
          <span className="wordmark wordmark--gradient">Cheese Cash</span>
        </div>

        <div className="mobile-header-user">
          <div className="user-avatar">{initials}</div>
          <button
            className="mobile-logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <IconLogout />
          </button>
        </div>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <CheeseCashLogo size={34} />
          <div className="logo-divider" />
          <span className="wordmark wordmark--gradient">Cheese Cash</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <span className="nav-icon"><Icon active={isActive} /></span>
                  <span>{label}</span>
                </>
              )}
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
            <span className="nav-icon"><IconLogout /></span>
            <span>Cerrar sesión</span>
          </button>
        </div>

      </aside>

      {/* Contenido de la ruta activa */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom nav (solo mobile) */}
      <BottomNav />

    </div>
  )
}