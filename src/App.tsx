import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import Layout from './components/Layout/Layout'
import AuthPage from './pages/Auth/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import ChatBot from './components/ChatBot/ChatBot'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Route>

        {/* Rutas protegidas — todas dentro del Layout con sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/operar"     element={<Dashboard />} />
            <Route path="/historial"  element={<Dashboard />} />
            <Route path="/conversor"  element={<Dashboard />} />
            <Route path="/transferir" element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Chatbot flotante en todas las pantallas */}
      <ChatBot />
    </AuthProvider>
  )
}

export default App
