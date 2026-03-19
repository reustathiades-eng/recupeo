'use client'
// ============================================================
// /connexion — Page de connexion Magic Link
// ============================================================

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

function ConnexionContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    missing_params: 'Lien de connexion incomplet. Demandez un nouveau lien.',
    invalid_token: 'Lien expiré ou invalide. Demandez un nouveau lien.',
    session_expired: 'Votre session a expiré. Reconnectez-vous.',
    server_error: 'Erreur serveur. Réessayez.',
  }

  return (
    <div className="min-h-screen bg-slate-bg flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {/* Logo + titre */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-navy mb-2">
            Mon espace RÉCUPÉO
          </h1>
          <p className="text-slate-muted">
            Retrouvez vos diagnostics, suivez vos démarches, récupérez votre argent.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {/* Erreur éventuelle */}
          {error && errorMessages[error] && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-600 text-sm">{errorMessages[error]}</p>
            </div>
          )}

          <LoginForm />
        </div>

        {/* Avantages compte */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: '📊', label: 'Retrouvez tous vos diagnostics' },
            { icon: '📬', label: 'Suivez vos démarches' },
            { icon: '🎯', label: 'Recevez des recommandations' },
          ].map(item => (
            <div key={item.label} className="text-sm text-slate-muted">
              <span className="text-lg block mb-1">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-bg flex items-center justify-center">
        <div className="animate-pulse text-slate-muted">Chargement...</div>
      </div>
    }>
      <ConnexionContent />
    </Suspense>
  )
}
