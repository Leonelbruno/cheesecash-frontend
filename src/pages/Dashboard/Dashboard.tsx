import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Bienvenido, {user?.fullName} 👋</h1>
      <p>Tu billetera está lista. Próximamente: balances y operaciones.</p>
      <button onClick={logout} style={{ marginTop: '1rem' }}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default Dashboard
