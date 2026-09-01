import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import './Wallet.css'

interface Balance {
  id: number
  wallet_id: number
  currency: string
  amount: string
}

const CURRENCY_LABELS: Record<string, string> = {
  ARS: 'Pesos argentinos',
  USD: 'Dólares',
  EUR: 'Euros',
  BTC: 'Bitcoin',
}

function formatAmount(currency: string, amount: string) {
  const value = Number(amount)
  if (currency === 'BTC') return value.toFixed(8)
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Wallet() {
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Balance[]>('/wallet/balances')
      .then((data) => setBalances(data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="wallet">
      <div className="wallet-header">
        <h1>Tu billetera</h1>
        <p className="wallet-subtitle">Saldos por moneda</p>
      </div>

      {loading && <p className="wallet-status">Cargando saldos...</p>}
      {error && <p className="wallet-status wallet-error">{error}</p>}

      {!loading && !error && (
        <div className="wallet-grid">
          {balances.map((b) => (
            <div key={b.id} className="wallet-card">
              <span className="wallet-currency">{b.currency}</span>
              <span className="wallet-amount">{formatAmount(b.currency, b.amount)}</span>
              <span className="wallet-label">{CURRENCY_LABELS[b.currency] ?? b.currency}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Wallet