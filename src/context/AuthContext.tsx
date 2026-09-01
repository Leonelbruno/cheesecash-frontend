import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { AuthContext, type User } from './auth-context'

const TOKEN_KEY = 'cc_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Al montar: validar token existente con /api/users/me
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const me = await api.get<User>('/users/me')
        setUser(me)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
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

  async function loginWithGoogle(googleToken: string) {
    const { token, user } = await api.post<{ token: string; user: User }>(
      '/auth/google',
      { token: googleToken },
      { auth: false },
    )
    localStorage.setItem(TOKEN_KEY, token)
    setUser(user)
  }

  async function register(
    email: string,
    password: string,
    fullName: string,
  ) {
    await api.post<User>(
      '/auth/register',
      { email, password, fullName },
      { auth: false },
    )
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}