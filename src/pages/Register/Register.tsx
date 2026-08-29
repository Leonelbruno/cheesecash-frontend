import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import './Register.css'

function Register() {
  const { register } = useAuth()
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
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="register">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>

        <div className="input-group">
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <span className="highlight"></span>
          <span className="bar"></span>
          <label htmlFor="fullName">Nombre completo</label>
        </div>

        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="highlight"></span>
          <span className="bar"></span>
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="highlight"></span>
          <span className="bar"></span>
          <label htmlFor="password">Contraseña</label>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="btn" disabled={loading}>
          <span className="btn-text">{loading ? 'Creando cuenta...' : 'Registrarse'}</span>
          <span className="btn-fill"></span>
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </section>
  )
}

export default Register