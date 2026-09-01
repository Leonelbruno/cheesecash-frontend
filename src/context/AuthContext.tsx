import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { AuthContext, type User, type ApiUser } from './auth-context'

const TOKEN_KEY = 'cc_token'

function mapUser(u: ApiUser): User {
  return { id: u.id, email: u.email, fullName: u.full_name }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const me = await api.get<ApiUser>('/users/me')
        setUser(mapUser(me))
      } catch {
        localStorage.removeItem(TOKEN_KEY)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  async function login(email: string, password: string) {
    const { token, user } = await api.post<{ token: string; user: ApiUser }>(
      '/auth/login',
      { email, password },
      { auth: false },
    )
    localStorage.setItem(TOKEN_KEY, token)
    setUser(mapUser(user))
  }

  async function loginWithGoogle(googleToken: string) {
    const { token, user } = await api.post<{ token: string; user: ApiUser }>(
      '/auth/google',
      { idToken: googleToken },
      { auth: false },
    )
    localStorage.setItem(TOKEN_KEY, token)
    setUser(mapUser(user))
  }

  async function register(
    email: string,
    password: string,
    fullName: string,
    birthDate: string,
  ) {
    await api.post<ApiUser>(
      '/auth/register',
      { email, password, fullName, birthDate },
      { auth: false },
    )
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}