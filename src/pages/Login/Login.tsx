import { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import './Login.css';
import logo from '../../assets/logo.png'

function Login() {
const { login, loginWithGoogle } = useAuth();
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
        <img src={logo} alt="Cheese Cash" className="login-logo" />
        <p className="login-subtitle">Tu billetera digital multimoneda</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Iniciar sesión</h1>

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
            <span className="btn-text">{loading ? 'Entrando...' : 'Entrar'}</span>
            <span className="btn-fill"></span>
          </button>

          <GoogleLogin
  onSuccess={(credentialResponse) => {
    if (!credentialResponse.credential) return;
    loginWithGoogle(credentialResponse.credential)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => setError((err as Error).message));
  }}
  onError={() => {
    setError('No se pudo iniciar sesión con Google');
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
