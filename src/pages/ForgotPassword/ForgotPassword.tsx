import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import CheeseCashLogo from '../../components/CheeseCashLogo/CheeseCashLogo'
import './PasswordFlow.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailOk || loading) return

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/forgot-password', { email: email.trim() }, { auth: false })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pwflow">
      <div className="pwflow-card">
        <CheeseCashLogo withName size={36} />

        {sent ? (
          <>
            <div className="pwflow-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
            </div>

            <h1>Revisá tu correo</h1>
            <p className="pwflow-lede">
              Si ese email tiene una cuenta en Cheese Cash, le enviamos un enlace
              para crear una contraseña nueva. Puede tardar un par de minutos.
            </p>

            <Link className="pwflow-btn" to="/login">Volver al ingreso</Link>
          </>
        ) : (
          <>
            <h1>¿Olvidaste tu contraseña?</h1>
            <p className="pwflow-lede">
              Escribí el correo con el que te registraste y te mandamos un enlace
              para crear una nueva.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="pwflow-field">
                <label htmlFor="fp-email">Correo</label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <p className="pwflow-error" role="alert">{error}</p>}

              <button type="submit" className="pwflow-btn" disabled={!emailOk || loading}>
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>

            <Link className="pwflow-link" to="/login">Volver al ingreso</Link>
          </>
        )}
      </div>
    </div>
  )
}