import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Completá email y contraseña');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="30753237541-igvq50uek3hklqk5l0jin0sfdkd5cdne.apps.googleusercontent.com">
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

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              fetch('https://cheesecash-back-production.up.railway.app/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: credentialResponse.credential }),
              })
                .then((response) => response.json())
                .then((data) => {
                  localStorage.setItem('userToken', data.token);
                  // Redirigir al usuario a la página principal o a su perfil
                  navigate('/dashboard', { replace: true });
                })
                .catch((error) => {
                  console.error('Error:', error);
                });
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />

          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            ¿No tenés cuenta? <Link to="/register">Registrate</Link>
          </p>
        </form>
      </section>
    </GoogleOAuthProvider>
  );
}

export default Login;