import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import Layout from './components/Layout/Layout'
import AuthPage from './pages/Auth/AuthPage'
import Dashboard from './pages/Dashboard/Dashboard'
import Operar from './pages/Operar/Operar'
import Historial from './pages/Historial/Historial'
import Conversor from './pages/Conversor/Conversor'
import Transferir from './pages/Transferir/Transferir'
import ChatBot from './components/ChatBot/ChatBot'
import Landing from './pages/Landing/Landing'
import ConfirmTransaction from './pages/ConfirmTransaction/ConfirmTransaction'
import ConfirmTransfer from './pages/ConfirmTransfer/ConfirmTransfer'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/confirm-transaction" element={<ConfirmTransaction />} />
        <Route path="/confirm-transfer" element={<ConfirmTransfer />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chatbot flotante */}
      <ChatBot />
    </AuthProvider>
  )
}

export default App