import { createContext } from 'react'

export interface ApiUser {
  id: number
  email: string
  full_name: string
}

export interface User {
  id: number
  email: string
  fullName: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    fullName: string,
    birthDate: string,
  ) => Promise<void>
  logout: () => void
  /** Vuelve a pedir el perfil al servidor. Se usa al editar los datos. */
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)