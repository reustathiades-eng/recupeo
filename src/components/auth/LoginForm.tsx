'use client'
// ============================================================
// RÉCUPÉO — Formulaire de connexion Magic Link
// ============================================================

import { useState } from 'react'
import { track } from '@/lib/analytics'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()

      if (data.success) {
        setSent(true)
        track({ event: 'magic_link_requested', brique: 'auth' })
      } else {
        setError(data.error || 'Erreur. Réessayez.')
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-heading text-2xl font-bold text-navy mb-3">
          Vérifiez votre boîte email
        </h2>
        <p className="text-slate-muted text-base mb-2">
          Un lien de connexion a été envoyé à
        </p>
        <p className="font-semibold text-navy mb-6">{email}</p>
        <p className="text-sm text-slate-muted">
          Le lien est valable 15 minutes. Pensez à vérifier vos spams.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="mt-6 text-emerald text-sm font-medium hover:underline"
        >
          Utiliser un autre email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-navy mb-2">
          Votre adresse email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jean.dupont@email.fr"
          className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-navy placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all"
          autoComplete="email"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email}
        className="cta-primary w-full justify-center !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Envoi en cours...
          </span>
        ) : (
          'Recevoir mon lien de connexion →'
        )}
      </button>

      <p className="text-xs text-slate-muted text-center leading-relaxed">
        Pas de mot de passe nécessaire. Nous vous envoyons un lien sécurisé par email.
        <br />En continuant, vous acceptez nos{' '}
        <a href="/cgu" className="text-emerald hover:underline">CGU</a> et notre{' '}
        <a href="/confidentialite" className="text-emerald hover:underline">politique de confidentialité</a>.
      </p>
    </form>
  )
}
