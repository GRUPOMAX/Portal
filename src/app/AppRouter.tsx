// src/router/AppRouter.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/Dashboard'
import ProtectedRoute from './ProtectedRoute'

// ENTRADAS DE MÓDULO
import ConfigRoutes from '../modules/config'
import RedesWifiRoutes from '../modules/redes-wifi'

// 👇 NOVO
import ImagesPage from '../pages/ImagensPage'

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/config/*"
          element={
            <ProtectedRoute>
              <ConfigRoutes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/redes-wifi/*"
          element={
            <ProtectedRoute>
              <RedesWifiRoutes />
            </ProtectedRoute>
          }
        />

        {/* 👇 ROTA DA IMAGESPAGE */}
        <Route
          path="/imagens"
          element={
            <ProtectedRoute>
              <ImagesPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </HashRouter>
  )
}
