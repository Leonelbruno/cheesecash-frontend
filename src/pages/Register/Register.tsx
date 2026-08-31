import { useState } from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import BrandPanel, { CheeseCoin } from '../../components/BrandPanel/BrandPanel'
import './Register.css'

function Register() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password) {
      setError('Completá todos los campos')
      return
    }

    try {
      setError('')
      setLoading(true)
      await register(email, password, fullName)
      navigate('/login', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GoogleOAuthProvider clientId="30753237541-igvq50uek3hklqk5l0jin0sfdkd5cdne.apps.googleusercontent.com">
      <div className="stage">
        <BrandPanel />

        <main className="form-panel">
          <div className="card">
            <div className="mobile-logo">
              <CheeseCoin className="mark" />
              <div className="rule" />
              <span className="wordmark">Cheese Cash</span>
            </div>

            <div className="card-top">
              <h2>Creá tu cuenta</h2>
              <Link to="/login">¿Necesitás ayuda?</Link>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="fullName">Nombre completo</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Como en tu documento"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Correo</label>
                <input
                  id="email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="submit" disabled={loading}>
                <span className="label">
                  <CheeseCoin className="coin" />
                  {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
                </span>
              </button>
            </form>

            <div className="divider">o continuá con</div>
            <div className="social-row">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (!credentialResponse.credential) return
                  loginWithGoogle(credentialResponse.credential)
                    .then(() => navigate('/dashboard', { replace: true }))
                    .catch((err) => setError((err as Error).message))
                }}
                onError={() => {
                  setError('No se pudo registrar con Google')
                }}
              />
            </div>

            <p className="foot-note">
              ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  )
}

export default Register