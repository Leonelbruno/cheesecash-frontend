import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: '#9a927f', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 2 }}>
        Bienvenido de vuelta
      </p>
      <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 700, marginTop: 6, color: '#f6efdf' }}>
        Hola, {user?.fullName?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: '#9a927f', marginTop: 16 }}>
        Próximamente: balances, operaciones y más.
      </p>
    </div>
  )
}

export default Dashboard
