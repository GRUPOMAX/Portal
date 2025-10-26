import { Routes, Route, Navigate } from 'react-router-dom'
import CouponDashboard from './pages/CouponDashboard'

export default function CuponsRoutes() {
  return (
    <Routes>
      <Route index element={<CouponDashboard />} />
      {/* dá pra expandir depois: /novo, /:id, /importar, etc. */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
