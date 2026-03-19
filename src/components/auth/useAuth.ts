'use client'
// ============================================================
// RÉCUPÉO — Hook useAuth
// ============================================================
// Gère l'état d'authentification côté client.
// Appelle GET /api/auth/me au montage pour vérifier la session.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type { SessionUser, AuthState } from '@/lib/auth/types'

export function useAuth(): AuthState & {
  login: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
} {
  const [state, setState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setState({
        authenticated: data.authenticated || false,
        user: data.user || null,
        loading: false,
      })
    } catch {
      setState({ authenticated: false, user: null, loading: false })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      return { success: data.success, error: data.error }
    } catch {
      return { success: false, error: 'Erreur réseau.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Silencieux
    }
    setState({ authenticated: false, user: null, loading: false })
  }

  return { ...state, login, logout, refresh }
}
