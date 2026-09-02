import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { AuthContext, type AuthContextType } from '../context/auth-context'

const noop = async () => {}

function makeCtx(over: Partial<AuthContextType>): AuthContextType {
  return {
    user: null,
    loading: false,
    login: noop,
    loginWithGoogle: noop,
    register: noop,
    logout: () => {},
    ...over,
  }
}

function renderAt(path: string, ctx: AuthContextType) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<p>contenido privado</p>} />
          </Route>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<p>pantalla de login</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const usuario = { id: 1, email: 'gonza@test.com', fullName: 'Gonzalo' }

describe('ProtectedRoute', () => {
  it('manda al login cuando no hay sesión', () => {
    renderAt('/dashboard', makeCtx({ user: null }))

    expect(screen.getByText('pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('deja pasar cuando hay sesión', () => {
    renderAt('/dashboard', makeCtx({ user: usuario }))

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('no redirige mientras la sesión está cargando', () => {
    renderAt('/dashboard', makeCtx({ user: null, loading: true }))

    expect(screen.queryByText('pantalla de login')).not.toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  it('muestra el login cuando no hay sesión', () => {
    renderAt('/login', makeCtx({ user: null }))

    expect(screen.getByText('pantalla de login')).toBeInTheDocument()
  })

  it('manda al dashboard si el usuario ya está logueado', () => {
    renderAt('/login', makeCtx({ user: usuario }))

    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })
})