import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import CheeseCashLogo from '../../components/CheeseCashLogo/CheeseCashLogo'
import '../ForgotPassword/PasswordFlow.css'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const tooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && password !== confirm
  const canSubmit = password.length >= 8 && password === confirm && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !token) return

    setLoading(true)
    setError('')

    try {
      await api.post(
        '/auth/reset-password',
        { token, newPassword: password },
        { auth: false },
      )
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="pwflow">
        <div className="pwflow-card">
          <CheeseCashLogo withName size={36} />
          <h1>Enlace inválido</h1>
          <p className="pwflow-lede" role="alert">
            El enlace no incluye un token. Pedí uno nuevo desde la pantalla de ingreso.
          </p>
          <Link className="pwflow-btn" to="/forgot-password">Pedir otro enlace</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pwflow">
      <div className="pwflow-card">
        <CheeseCashLogo withName size={36} />

        {done ? (
          <>
            <div className="pwflow-icon">
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#f2d488" strokeWidth="2" />
                <polyline points="14 24 21 31 34 18" stroke="#f2d488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1>Contraseña actualizada</h1>
            <p className="pwflow-lede">Ya podés entrar con tu contraseña nueva.</p>

            <button className="pwflow-btn" onClick={() => navigate('/login')}>
              Ir al ingreso
            </button>
          </>
        ) : (
          <>
            <h1>Creá una contraseña nueva</h1>
            <p className="pwflow-lede">Tiene que tener al menos 8 caracteres.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="pwflow-field">
                <label htmlFor="rp-password">Contraseña nueva</label>
                <input
                  id="rp-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  aria-invalid={tooShort}
                />
                {tooShort && <span className="pwflow-hint">Te faltan {8 - password.length} caracteres</span>}
              </div>

              <div className="pwflow-field">
                <label htmlFor="rp-confirm">Repetí la contraseña</label>
                <input
                  id="rp-confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  disabled={loading}
                  aria-invalid={mismatch}
                />
                {mismatch && <span className="pwflow-hint">Las contraseñas no coinciden</span>}
              </div>

              {error && <p className="pwflow-error" role="alert">{error}</p>}

              <button type="submit" className="pwflow-btn" disabled={!canSubmit}>
                {loading ? 'Guardando…' : 'Cambiar contraseña'}
              </button>
            </form>

            <Link className="pwflow-link" to="/login">Volver al ingreso</Link>
          </>
        )}
      </div>
    </div>
  )
}