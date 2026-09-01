import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
/**
 * Rutas privadas — redirige a /login si no hay sesión válida.
 * Mientras carga la sesión inicial muestra un spinner.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading">
        <span className="spinner" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * Rutas públicas (login, register) — si el usuario ya tiene sesión,
 * lo redirige al dashboard para evitar volver a loguearse.
 */
export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading">
        <span className="spinner" />
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}
