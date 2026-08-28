import { useState } from 'react'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Completá email y contraseña')
      return
    }

    setError('')
    // acá después conectamos con el back para autenticar
    console.log('Login con:', { email, password })
  }

  return (
    <section className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit">Entrar</button>
      </form>
    </section>
  )
}

export default Login