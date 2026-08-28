import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

interface User {
  id: number
  email: string
  fullName: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'cc_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Al montar: validar token existente con /api/users/me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    api
      .get<User>('/users/me')
      .then((me) => setUser(me))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { token, user } = await api.post<{ token: string; user: User }>(
      '/auth/login',
      { email, password },
      { auth: false },
    )
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  async function register(email: string, password: string, fullName: string) {
    const { token, user } = await api.post<{ token: string; user: User }>(
      '/auth/register',
      { email, password, fullName },
      { auth: false },
    )
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
