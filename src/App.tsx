import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import Layout from './components/layout/Layout'
import AuthPage from './pages/Auth/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import Operar from './pages/Operar/Operar'
import Historial from './pages/Historial/Historial'
import Conversor from './pages/Conversor/Conversor'
import Transferir from './pages/Transferir/Transferir'
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

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/operar" element={<Operar />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/conversor" element={<Conversor />} />
            <Route path="/transferir" element={<Transferir />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Chatbot flotante */}
      <ChatBot />
    </AuthProvider>
  )
}

export default App