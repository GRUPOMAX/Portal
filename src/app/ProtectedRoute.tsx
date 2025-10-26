// src/app/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { getSession } from '../auth/session'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const s = getSession()
  if (!s) return <Navigate to="/login" replace />
  return children
}
