'use client'
// ============================================================
// /mon-espace/profil — Prénom + situation
// ============================================================

import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'

interface ProfileData {
  email: string
  firstName: string
  profile: {
    isOwner?: boolean
    isTenant?: boolean
    isRetired?: boolean
    isEmployee?: boolean
    isJobSeeker?: boolean
    isDivorced?: boolean
  }
}

const SITUATIONS = [
  { key: 'isOwner', label: 'Propriétaire' },
  { key: 'isTenant', label: 'Locataire' },
  { key: 'isRetired', label: 'Retraité(e)' },
  { key: 'isEmployee', label: 'Salarié(e)' },
  { key: 'isJobSeeker', label: 'Demandeur d\'emploi' },
  { key: 'isDivorced', label: 'Divorcé(e)' },
] as const

export default function ProfilPage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [firstName, setFirstName] = useState('')
  const [profile, setProfile] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    track({ event: 'profil_viewed', brique: 'mon-espace' })
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/profile')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setFirstName(json.firstName || '')
        setProfile(json.profile || {})
      }
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, profile }),
      })
      if (res.ok) {
        setSaved(true)
        track({ event: 'profile_updated', brique: 'mon-espace' })
        setTimeout(() => setSaved(false), 3000)
      }
    } catch { /* silencieux */ }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-12 text-slate-muted">Chargement...</div>

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-2">Mon profil</h1>
      <p className="text-slate-muted text-sm mb-8">
        Complétez votre profil pour recevoir des recommandations personnalisées.
      </p>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6 max-w-lg">
        {/* Email (non modifiable) */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
          <div className="px-4 py-3 bg-slate-bg rounded-xl text-sm text-slate-muted">
            {data?.email || '—'}
          </div>
        </div>

        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-navy mb-1.5">Prénom</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Votre prénom"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-navy placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald transition-all text-sm"
          />
        </div>

        {/* Situation */}
        <div>
          <label className="block text-sm font-medium text-navy mb-3">Ma situation (plusieurs choix possibles)</label>
          <div className="grid grid-cols-2 gap-2">
            {SITUATIONS.map(s => (
              <label
                key={s.key}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                  profile[s.key]
                    ? 'border-emerald bg-emerald/5 text-navy font-medium'
                    : 'border-slate-200 text-slate-muted hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!profile[s.key]}
                  onChange={e => setProfile({ ...profile, [s.key]: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  profile[s.key] ? 'bg-emerald border-emerald' : 'border-slate-300'
                }`}>
                  {profile[s.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {s.label}
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="cta-primary !py-2.5 !px-6 !text-sm !rounded-lg disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {saved && <span className="text-emerald text-sm font-medium">✓ Profil mis à jour</span>}
        </div>
      </div>
    </div>
  )
}
