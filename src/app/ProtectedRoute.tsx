// src/app/ProtectedRoute.tsx
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession } from '../auth/session'

type Props = {
  children: ReactNode
}

/**
 * Protege rotas que exigem sessão ativa.
 * Se não houver sessão, redireciona para /login.
 */
export default function ProtectedRoute({ children }: Props) {
  const session = getSession()

  if (!session || !session.token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
