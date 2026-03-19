"use client"
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProgressBar } from '@/components/retraitia/espace/ProgressBar'
import { StatusCard } from '@/components/retraitia/espace/StatusCard'
import type { StatusState } from '@/components/retraitia/espace/StatusCard'
import { useDossier } from '@/lib/retraitia/DossierContext'
import Link from 'next/link'

const DOC_LABELS: Record<string, string> = {
  ris: 'Releve Individuel de Situation (RIS)',
  notification_cnav: 'Notification de pension CNAV/CARSAT',
  releve_agirc_arrco: 'Releve de points Agirc-Arrco',
  releve_mensualites: 'Releve de mensualites',
  avis_imposition: "Avis d'imposition",
  attestation_fiscale: 'Attestation fiscale',
  eig: 'Estimation Indicative Globale (EIG)',
  notification_fp: 'Notification de pension FP',
  notification_msa: 'Notification MSA',
  notification_sre: 'Titre de pension SRE',
  notification_cnracl: 'Notification CNRACL',
  paiements_agirc_arrco: 'Paiements Agirc-Arrco',
  releve_cnavpl: 'Releve CNAVPL',
}

function docState(status: string): StatusState {
  if (status === 'extracted' || status === 'uploaded') return 'done'
  if (status === 'extracting' || status === 'uploading') return 'waiting'
  if (status === 'optional_skip') return 'optional'
  return 'todo'
}

function RetraitiaDashboardInner() {
  const params = useSearchParams()
  const paymentSuccess = params.get('payment') === 'success'
  const { dossier, loading, error } = useDossier()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div>
        {paymentSuccess && (
          <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-xl">{String.fromCodePoint(0x1F389)}</span>
            <div>
              <p className="font-medium text-slate-text">Paiement confirme !</p>
              <p className="text-sm text-slate-muted">Votre espace RETRAITIA est en cours de configuration. Rechargez la page dans quelques instants.</p>
            </div>
          </div>
        )}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">{String.fromCodePoint(0x1F4CB)}</div>
          <h2 className="font-heading text-xl font-bold text-slate-text mb-2">Aucun dossier RETRAITIA</h2>
          <p className="text-slate-muted text-sm mb-6 max-w-md mx-auto">
            {"Votre dossier sera cree automatiquement apres le paiement du Pack Dossier (9\u20AC)."}
          </p>
          <Link href="/retraitia/test" className="cta-primary !py-3 !px-8 inline-block">
            Faire le test gratuit {String.fromCodePoint(0x2192)}
          </Link>
        </div>
      </div>
    )
  }

  const docs = (dossier.documents as Array<{ type: string; status: string; obligatoire: boolean }>) || []
  const docsDone = docs.filter(d => d.status === 'extracted' || d.status === 'uploaded').length
  const totalItems = docs.length + 1 + 1
  const doneItems = docsDone + (dossier.formulaireComplet ? 1 : 0) + (dossier.franceConnectVerified ? 1 : 0)
  const hasDocsMissing = docs.some(d => d.obligatoire && d.status !== 'extracted' && d.status !== 'uploaded')
  const canRunDiag = !hasDocsMissing && dossier.formulaireComplet

  return (
    <div>
      {paymentSuccess && (
        <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-xl">{String.fromCodePoint(0x1F389)}</span>
          <div>
            <p className="font-medium text-slate-text">Paiement confirme !</p>
            <p className="text-sm text-slate-muted">Votre espace RETRAITIA est pret.</p>
          </div>
        </div>
      )}

      <h1 className="font-heading text-xl font-bold text-slate-text mb-1">
        {dossier.clientName || 'Votre dossier RETRAITIA'}
      </h1>
      <p className="text-xs text-slate-muted mb-4">
        Parcours : {dossier.parcours === 'retraite' ? 'Retraite actuel' : dossier.parcours === 'preretraite' ? 'Pre-retraite' : 'Reversion'}
        {' \u00B7 '}Statut : {dossier.status.replace(/_/g, ' ')}
      </p>

      <ProgressBar
        current={doneItems}
        total={totalItems}
        label="Progression"
        sublabel="Objectif : tout passer au vert"
      />

      <div className="space-y-3">
        <StatusCard
          state={dossier.franceConnectVerified ? 'done' : 'todo'}
          title="FranceConnect"
          subtitle={dossier.franceConnectVerified ? 'Connecte' : 'Non connecte'}
          required={!dossier.franceConnectVerified}
          onClick={() => window.location.href = '/mon-espace/retraitia/documents#franceconnect'}
        />

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-text text-sm">{String.fromCodePoint(0x1F4CE)} Documents ({docsDone}/{docs.length})</h3>
            <Link href="/mon-espace/retraitia/documents" className="text-xs text-emerald font-medium hover:underline">
              Gerer {String.fromCodePoint(0x2192)}
            </Link>
          </div>
          <div className="space-y-2">
            {docs.map((doc: any) => (
              <StatusCard
                key={doc.type}
                state={docState(doc.status)}
                title={DOC_LABELS[doc.type] || doc.type}
                required={doc.obligatoire && doc.status !== 'extracted' && doc.status !== 'uploaded'}
              />
            ))}
          </div>
        </div>

        <StatusCard
          state={dossier.formulaireComplet ? 'done' : 'todo'}
          title="Formulaire complementaire"
          subtitle={dossier.formulaireComplet ? 'Complete' : '3 blocs \u00B7 16 questions'}
          required={!dossier.formulaireComplet}
          onClick={() => window.location.href = '/mon-espace/retraitia/informations'}
        />

        {dossier.diagnostic && dossier.nbAnomalies > 0 && (
          <div className="bg-white border-2 border-emerald rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{String.fromCodePoint(0x1F50D)}</span>
              <h3 className="font-heading font-bold text-slate-text">Diagnostic pret</h3>
            </div>
            <p className="text-sm text-slate-muted mb-3">
              {dossier.nbAnomalies} anomalie{dossier.nbAnomalies > 1 ? 's' : ''} detectee{dossier.nbAnomalies > 1 ? 's' : ''}
              {dossier.scoreGlobal ? ` \u00B7 Score ${dossier.scoreGlobal}` : ''}
            </p>
            <Link href="/mon-espace/retraitia/diagnostic" className="cta-primary !py-2.5 !px-6 !text-sm inline-block">
              Voir mon diagnostic {String.fromCodePoint(0x2192)}
            </Link>
          </div>
        )}

        {!dossier.diagnostic && canRunDiag && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              {String.fromCodePoint(0x23F3)} Vos documents et formulaire sont complets. Le diagnostic va se generer automatiquement.
            </p>
          </div>
        )}

        {dossier.pack49Paid && dossier.demarches && (dossier.demarches as any[]).length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-text text-sm">{String.fromCodePoint(0x1F4E8)} Demarches</h3>
              <Link href="/mon-espace/retraitia/demarches" className="text-xs text-emerald font-medium hover:underline">
                Voir tout {String.fromCodePoint(0x2192)}
              </Link>
            </div>
            <p className="text-xs text-slate-muted">
              {(dossier.demarches as any[]).filter((d: any) => d.statut === 'corrige').length}/{(dossier.demarches as any[]).length} resolues
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RetraitiaDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    }>
      <RetraitiaDashboardInner />
    </Suspense>
  )
}
