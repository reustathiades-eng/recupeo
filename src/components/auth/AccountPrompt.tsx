'use client'
// ============================================================
// RÉCUPÉO — Prompt création de compte post-achat
// ============================================================
// Affiché après le rapport — propose de créer un espace
// pour retrouver le rapport et suivre la démarche.
// Masqué si déjà connecté.
// ============================================================

import { useState } from 'react'
import { useAuth } from './useAuth'
import { track } from '@/lib/analytics'

interface AccountPromptProps {
  email?: string   // Email pré-rempli (depuis le diagnostic)
  brique: string
}

export function AccountPrompt({ email: prefillEmail, brique }: AccountPromptProps) {
  const { authenticated, loading: authLoading } = useAuth()
  const [email, setEmail] = useState(prefillEmail || '')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Ne pas afficher si déjà connecté ou en cours de vérif
  if (authLoading || authenticated || dismissed) return null

  const handleSubmit = async () => {
    if (!email || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        track({ event: 'account_created', brique })
      }
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  if (sent) {
    return (
      <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-3">✅</div>
        <h3 className="font-heading text-lg font-bold text-navy mb-2">
          Lien envoyé !
        </h3>
        <p className="text-sm text-slate-muted">
          Vérifiez votre boîte email pour accéder à votre espace RÉCUPÉO et retrouver ce rapport à tout moment.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-navy/[0.03] to-emerald/[0.05] border border-slate-200 rounded-2xl p-6 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-muted/50 hover:text-slate-muted text-lg leading-none"
        aria-label="Fermer"
      >
        ×
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🔒</span>
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-base font-bold text-navy mb-1">
            Créez votre espace pour retrouver ce rapport
          </h3>
          <p className="text-sm text-slate-muted mb-4">
            Accédez à vos diagnostics, suivez vos démarches et recevez des alertes personnalisées. Pas de mot de passe, juste votre email.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-navy placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="px-5 py-2.5 bg-emerald text-navy text-sm font-bold rounded-xl hover:bg-emerald/90 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? '...' : 'Créer mon espace →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
