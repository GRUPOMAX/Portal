// src/auth/session.ts
const KEY = 'session@login'

export type Session = {
  id: string | number
  email: string
  createdAt: number
}

export function createSession(id: string | number, email: string) {
  const s: Session = { id, email, createdAt: Date.now() }
  localStorage.setItem(KEY, JSON.stringify(s))
  return s
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(KEY)
}
