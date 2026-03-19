'use client'
import { useState } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'action' | 'success' | 'warning'
  title: string
  message: string
  cta?: { label: string; href: string }
  dismissible: boolean
  createdAt: string
}

interface NotificationBannerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string; title: string }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💡', title: 'text-blue-800' },
  action: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚡', title: 'text-amber-800' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '✅', title: 'text-emerald-800' },
  warning: { bg: 'bg-red-50', border: 'border-red-200', icon: '⚠️', title: 'text-red-800' },
}

/**
 * Bannière de notification contextuelle en haut du tableau de bord.
 * Affiche la notification la plus récente non lue.
 */
export function NotificationBanner({ notifications, onDismiss }: NotificationBannerProps) {
  if (notifications.length === 0) return null

  // Afficher la plus récente
  const notif = notifications[0]
  const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 mb-4 relative`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.title}`}>{notif.title}</p>
          <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
          {notif.cta && (
            <a
              href={notif.cta.href}
              className="inline-block mt-2 text-xs font-semibold text-emerald-dark bg-white border border-emerald/20 px-3 py-1.5 rounded-lg hover:bg-emerald/5 transition-colors"
            >
              {notif.cta.label} →
            </a>
          )}
        </div>
        {notif.dismissible && (
          <button
            onClick={() => onDismiss(notif.id)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/50 text-slate-400 text-xs"
            aria-label="Fermer"
          >
            ✕
          </button>
        )}
      </div>
      {notifications.length > 1 && (
        <p className="text-xs text-slate-400 mt-2 text-right">
          +{notifications.length - 1} autre(s) notification(s)
        </p>
      )}
    </div>
  )
}

/**
 * Génère les notifications contextuelles pour un dossier.
 */
export function generateNotifications(dossier: any): Notification[] {
  const notifs: Notification[] = []
  const status = dossier.status as string
  const now = new Date()

  // Documents manquants
  const docs = (dossier.documents || []) as any[]
  const missingOblig = docs.filter((d: any) => d.obligatoire && d.status === 'missing')
  if (missingOblig.length > 0 && ['created', 'collecting'].includes(status)) {
    notifs.push({
      id: 'docs_missing',
      type: 'action',
      title: `${missingOblig.length} document(s) obligatoire(s) manquant(s)`,
      message: `Uploadez vos documents pour lancer le diagnostic.`,
      cta: { label: 'Uploader mes documents', href: '/mon-espace/retraitia/documents' },
      dismissible: false,
      createdAt: now.toISOString(),
    })
  }

  // Formulaire non rempli
  if (!dossier.formulaireComplet && ['created', 'collecting', 'documents_complete'].includes(status)) {
    notifs.push({
      id: 'form_incomplete',
      type: 'action',
      title: 'Formulaire à compléter',
      message: `Répondez aux questions complémentaires pour affiner le diagnostic.`,
      cta: { label: 'Compléter', href: '/mon-espace/retraitia/informations' },
      dismissible: false,
      createdAt: now.toISOString(),
    })
  }

  // Diagnostic prêt mais pas payé 49€
  if (status === 'diagnostic_ready' && !dossier.pack49Paid) {
    notifs.push({
      id: 'diag_ready',
      type: 'info',
      title: `Diagnostic prêt — ${dossier.nbAnomalies || 0} anomalie(s)`,
      message: `Débloquez votre rapport complet pour connaître le détail et les actions à mener.`,
      cta: { label: 'Voir le diagnostic', href: '/mon-espace/retraitia/diagnostic' },
      dismissible: true,
      createdAt: now.toISOString(),
    })
  }

  // Rapport prêt
  if (['report_paid', 'report_ready'].includes(status) && dossier.pack49Paid) {
    const demarches = (dossier.demarches || []) as any[]
    const pending = demarches.filter((d: any) => d.status === 'todo')
    if (pending.length > 0) {
      notifs.push({
        id: 'demarches_todo',
        type: 'action',
        title: `${pending.length} démarche(s) à effectuer`,
        message: `Des messages sont prêts à envoyer pour corriger vos anomalies.`,
        cta: { label: 'Voir les démarches', href: '/mon-espace/retraitia/demarches' },
        dismissible: true,
        createdAt: now.toISOString(),
      })
    }
  }

  // Délai dépassé sur une démarche
  const demarches = (dossier.demarches || []) as any[]
  for (const d of demarches) {
    if (d.status === 'waiting' && d.messageSentAt) {
      const sentDate = new Date(d.messageSentAt)
      const daysSince = Math.floor((now.getTime() - sentDate.getTime()) / (24 * 60 * 60 * 1000))
      if (daysSince >= 55) {
        notifs.push({
          id: `delay_${d.anomalyId}`,
          type: 'warning',
          title: `Délai bientôt dépassé — ${d.organisme || 'organisme'}`,
          message: `Votre demande du ${sentDate.toLocaleDateString('fr-FR')} arrive à échéance.`,
          cta: { label: 'Voir la démarche', href: `/mon-espace/retraitia/demarches/${d.anomalyId}` },
          dismissible: false,
          createdAt: now.toISOString(),
        })
        break // Une seule alerte délai à la fois
      }
    }
  }

  return notifs
}
