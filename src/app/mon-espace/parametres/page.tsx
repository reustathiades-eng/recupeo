'use client'
// ============================================================
// /mon-espace/parametres — Notifications + RGPD
// ============================================================

import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'

interface NotifSettings {
  reminders: boolean
  newBriques: boolean
  annualAlerts: boolean
  newsletter: boolean
}

export default function ParametresPage() {
  const [notifs, setNotifs] = useState<NotifSettings>({
    reminders: true, newBriques: true, annualAlerts: true, newsletter: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/auth/profile')
      if (res.ok) {
        const json = await res.json()
        if (json.notifications) setNotifs(json.notifications)
      }
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  async function saveNotifs() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: notifs }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch { /* silencieux */ }
    finally { setSaving(false) }
  }

  async function exportData() {
    setExporting(true)
    try {
      const res = await fetch('/api/auth/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `recupeo-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        track({ event: 'rgpd_export', brique: 'mon-espace' })
      }
    } catch { /* silencieux */ }
    finally { setExporting(false) }
  }

  async function requestDeletion() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible après 30 jours.')) return
    try {
      const res = await fetch('/api/auth/delete', { method: 'POST' })
      if (res.ok) {
        alert('Demande de suppression enregistrée. Votre compte sera supprimé dans 30 jours. Un email de confirmation vous a été envoyé.')
        track({ event: 'account_deletion_requested', brique: 'mon-espace' })
      }
    } catch { /* silencieux */ }
  }

  if (loading) return <div className="text-center py-12 text-slate-muted">Chargement...</div>

  const notifItems = [
    { key: 'reminders' as const, label: 'Rappels démarches', desc: 'Rappels pour suivre vos réclamations en cours' },
    { key: 'newBriques' as const, label: 'Nouvelles briques', desc: 'Soyez informé des nouveaux services RÉCUPÉO' },
    { key: 'annualAlerts' as const, label: 'Alertes annuelles', desc: 'Rappels saisonniers (taxe foncière en sept., loyer en janv.)' },
    { key: 'newsletter' as const, label: 'Newsletter', desc: 'Conseils et actualités juridiques' },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-8">Paramètres</h1>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6 max-w-lg">
        <h2 className="font-heading text-lg font-bold text-navy mb-4">Notifications email</h2>
        <div className="space-y-4">
          {notifItems.map(item => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5">
                <button
                  onClick={() => setNotifs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${notifs[item.key] ? 'bg-emerald' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-1 transition-transform ${notifs[item.key] ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{item.label}</p>
                <p className="text-xs text-slate-muted">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={saveNotifs} disabled={saving} className="cta-primary !py-2.5 !px-6 !text-sm !rounded-lg disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {saved && <span className="text-emerald text-sm font-medium">✓ Enregistré</span>}
        </div>
      </div>

      {/* RGPD */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 max-w-lg">
        <h2 className="font-heading text-lg font-bold text-navy mb-4">Données personnelles</h2>

        <div className="space-y-4">
          {/* Export */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-navy">Exporter mes données</p>
              <p className="text-xs text-slate-muted">Téléchargez toutes vos données au format JSON (RGPD).</p>
            </div>
            <button
              onClick={exportData}
              disabled={exporting}
              className="px-4 py-2 border border-slate-200 text-sm font-medium text-navy rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {exporting ? 'Export...' : 'Exporter'}
            </button>
          </div>

          <div className="border-t border-slate-100" />

          {/* Suppression */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-red-600">Supprimer mon compte</p>
                <p className="text-xs text-slate-muted">Vos données seront supprimées sous 30 jours. Conservation documents : 2 ans max.</p>
              </div>
              <button
                onClick={() => setShowDelete(!showDelete)}
                className="px-4 py-2 border border-red-200 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                Supprimer
              </button>
            </div>
            {showDelete && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 mb-3">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées après 30 jours.
                </p>
                <button
                  onClick={requestDeletion}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmer la suppression
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
