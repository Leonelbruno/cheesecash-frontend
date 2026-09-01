import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { api } from '../../services/api'
import './Dashboard.css'
import {
  ShoppingBag,
  ArrowUpFromLine,
  ArrowLeftRight,
  CircleDollarSign,
} from 'lucide-react'

interface ApiBalance {
  id: number
  wallet_id: number
  currency: string
  amount: string
}

interface ApiTransaction {
  id: number
  type: string
  from_currency: string
  to_currency: string
  from_amount: string
  to_amount: string
  created_at: string
}

const CURRENCY_ORDER = ['ARS', 'USD', 'EUR', 'BTC']

const CURRENCY_META: Record<string, { symbol: string; name: string }> = {
  ARS: { symbol: 'AR', name: 'Peso Argentino' },
  USD: { symbol: 'US', name: 'Dólar Estadounidense' },
  EUR: { symbol: 'EU', name: 'Euro' },
  BTC: { symbol: '₿', name: 'Bitcoin' },
}

const TX_META: Record<string, { label: string; className: string; icon: typeof CircleDollarSign }> = {
  buy: { label: 'Compra', className: 'purchase', icon: CircleDollarSign },
  sell: { label: 'Venta', className: 'sale', icon: ArrowUpFromLine },
  exchange: { label: 'Intercambio', className: 'exchange', icon: ArrowLeftRight },
}

const quickActions = [
  { label: 'Comprar', icon: ShoppingBag },
  { label: 'Vender', icon: ArrowUpFromLine },
  { label: 'Intercambiar', icon: ArrowLeftRight },
]

function formatAmount(currency: string, amount: string) {
  const value = Number(amount)
  if (Number.isNaN(value)) return amount
  if (currency === 'BTC') return value.toFixed(8)
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function sortBalances(list: ApiBalance[]) {
  return [...list].sort(
    (a, b) =>
      CURRENCY_ORDER.indexOf(a.currency) - CURRENCY_ORDER.indexOf(b.currency),
  )
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [balances, setBalances] = useState<ApiBalance[]>([])
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [balancesError, setBalancesError] = useState('')
  const [transactionsError, setTransactionsError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiBalance[]>('/wallet/balances')
      .then((data) => {
        if (!cancelled) setBalances(sortBalances(data))
      })
      .catch((err) => {
        if (!cancelled) setBalancesError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoadingBalances(false)
      })

    api
      .get<ApiTransaction[]>('/transactions')
      .then((data) => {
        if (!cancelled) setTransactions(data.slice(0, 3))
      })
      .catch((err) => {
        if (!cancelled) setTransactionsError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoadingTransactions(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const userName = user?.fullName || 'Usuario'
  const initial = userName.charAt(0).toUpperCase()

  const usdBalance = balances.find((b) => b.currency === 'USD')

  return (
    <div className="dashboard">
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

          <p className="dashboard-section-label">Saldo en dólares</p>

          <h2>
            {loadingBalances
              ? '—'
              : usdBalance
                ? `$ ${formatAmount('USD', usdBalance.amount)}`
                : '$ 0,00'}
          </h2>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Mis monedas</h2>

          {loadingBalances && <p>Cargando saldos…</p>}

          {!loadingBalances && balancesError && <p>{balancesError}</p>}

          {!loadingBalances && !balancesError && (
            <div className="currency-grid">
              {balances.map((balance) => {
                const meta = CURRENCY_META[balance.currency]

                return (
                  <article className="currency-card" key={balance.currency}>
                    <div className="currency-card-header">
                      <div>
                        <strong>{meta?.symbol ?? balance.currency}</strong>
                        <span>{balance.currency}</span>
                      </div>
                    </div>

                    <strong className="currency-amount">
                      {formatAmount(balance.currency, balance.amount)}
                    </strong>

                    <small>{meta?.name ?? balance.currency}</small>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Accesos rápidos</h2>

          <div className="quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  className="quick-action"
                  key={action.label}
                  onClick={() => navigate('/operar')}
                >
                  <Icon size={24} />
                  <strong>{action.label}</strong>
                </button>
              )
            })}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="transactions-heading">
            <h2 className="dashboard-section-title">Últimos movimientos</h2>

            <button onClick={() => navigate('/historial')}>Ver todos</button>
          </div>

          {loadingTransactions && <p>Cargando movimientos…</p>}

          {!loadingTransactions && transactionsError && (
            <p>{transactionsError}</p>
          )}

          {!loadingTransactions && !transactionsError && transactions.length === 0 && (
            <p>Todavía no tenés movimientos</p>
          )}

          {!loadingTransactions && !transactionsError && transactions.length > 0 && (
            <div className="transaction-list">
              {transactions.map((transaction) => {
                const meta = TX_META[transaction.type]
                const Icon = meta?.icon ?? CircleDollarSign

                return (
                  <article className="transaction-card" key={transaction.id}>
                    <div className="transaction-left">
                      <div className="transaction-icon">
                        <Icon size={18} />
                      </div>

                      <div>
                        <span
                          className={`transaction-type ${meta?.className ?? ''}`}
                        >
                          {meta?.label ?? transaction.type}
                        </span>

                        <p>
                          {transaction.from_currency} → {transaction.to_currency} ·{' '}
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="transaction-values">
                      <strong>
                        {formatAmount(
                          transaction.to_currency,
                          transaction.to_amount,
                        )}{' '}
                        {transaction.to_currency}
                      </strong>
                      <span>
                        {formatAmount(
                          transaction.from_currency,
                          transaction.from_amount,
                        )}{' '}
                        {transaction.from_currency}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard