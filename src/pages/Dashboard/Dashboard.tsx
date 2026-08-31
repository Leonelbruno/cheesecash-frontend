import { useAuth } from '../../context/useAuth'
import './Dashboard.css'
import Sidebar from '../../components/layout/Sidebar/Sidebar'
import { ShoppingBag, ArrowUpFromLine, ArrowLeftRight, Calculator, Send, CircleDollarSign } from 'lucide-react'

const balances = [
  {
    symbol: 'AR',
    code: 'ARS',
    amount: '8.250,00',
    name: 'Peso Argentino',
    variation: '+1.2%',
    positive: true,
  },
  {
    symbol: 'US',
    code: 'USD',
    amount: '2.340,50',
    name: 'Dólar Estadounidense',
    variation: '+0.3%',
    positive: true,
  },
  {
    symbol: 'EU',
    code: 'EUR',
    amount: '1.860,75',
    name: 'Euro',
    variation: '-0.8%',
    positive: false,
  },
  {
    symbol: '₿',
    code: 'BTC',
    amount: '0.00412',
    name: 'Bitcoin',
    variation: '+3.5%',
    positive: true,
  },
]

const quickActions = [
  { label: 'Comprar', icon: ShoppingBag },
  { label: 'Vender', icon: ArrowUpFromLine },
  { label: 'Intercambiar', icon: ArrowLeftRight },
  { label: 'Conversor', icon: Calculator },
  { label: 'Transferir', icon: Send },
]

const transactions = [
  {
    id: 1,
    type: 'Compra',
    icon: CircleDollarSign,
    detail: 'ARS → USD · 26 ago 2026',
    result: '52.50 USD',
    amount: '50.000 ARS',
    className: 'purchase',
  },
  {
    id: 2,
    type: 'Intercambio',
    icon: ArrowLeftRight,
    detail: 'USD → EUR · 25 ago 2026',
    result: '92.40 EUR',
    amount: '100 USD',
    className: 'exchange',
  },
  {
    id: 3,
    type: 'Venta',
    icon: ArrowUpFromLine,
    detail: 'BTC → ARS · 24 ago 2026',
    result: '4.820 ARS',
    amount: '0.001 BTC',
    className: 'sale',
  },
]

function Dashboard() {
  const { user, logout } = useAuth()

  const userName = user?.full_name || 'Usuario'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="dashboard">

      <Sidebar userName={userName} onLogout={logout} />

      <div className="dashboard-mobile-bar">
        <button className="dashboard-menu-button">☰</button>

        <div className="dashboard-mobile-logo">
          <span>🧀</span>
          <strong>Cheese Cash</strong>
        </div>

        <div className="dashboard-avatar small">{initial}</div>
      </div>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p>Bienvenido de vuelta</p>
            <h1>Hola, {userName} 👋</h1>
          </div>

          <div className="dashboard-avatar desktop-avatar">{initial}</div>
        </header>

        <section className="total-balance-card">
          <div className="balance-decoration balance-decoration-top" />
          <div className="balance-decoration balance-decoration-bottom" />

          <p className="dashboard-section-label">
            Saldo total (USD equiv.)
          </p>

          <h2>$ 12.450,00</h2>

          <div className="balance-update">
            <span>+2.4% hoy</span>
            <small>Actualizado hace 2 min</small>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Mis monedas</h2>

          <div className="currency-grid">
            {balances.map((balance) => (
              <article className="currency-card" key={balance.code}>
                <div className="currency-card-header">
                  <div>
                    <strong>{balance.symbol}</strong>
                    <span>{balance.code}</span>
                  </div>

                  <span
                    className={
                      balance.positive
                        ? 'currency-positive'
                        : 'currency-negative'
                    }
                  >
                    {balance.variation}
                  </span>
                </div>

                <strong className="currency-amount">
                  {balance.amount}
                </strong>

                <small>{balance.name}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Accesos rápidos</h2>

          <div className="quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button className="quick-action" key={action.label}>
                  <Icon size={24} />
                  <strong>{action.label}</strong>
                </button>
              )
            })}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="transactions-heading">
            <h2 className="dashboard-section-title">
              Últimos movimientos
            </h2>

            <button>Ver todos</button>
          </div>

          <div className="transaction-list">
            {transactions.map((transaction) => {
  const Icon = transaction.icon

  return (
    <article
      className="transaction-card"
      key={transaction.id}
    >
      <div className="transaction-left">
        <div className="transaction-icon">
          <Icon size={18} />
        </div>

        <div>
          <span
            className={`transaction-type ${transaction.className}`}
          >
            {transaction.type}
          </span>

          <p>{transaction.detail}</p>
        </div>
      </div>

      <div className="transaction-values">
        <strong>{transaction.result}</strong>
        <span>{transaction.amount}</span>
      </div>
    </article>
  )
})}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
