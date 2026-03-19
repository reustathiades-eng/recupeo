'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProgressBar } from '@/components/retraitia/espace/ProgressBar'
import { StatusCard } from '@/components/retraitia/espace/StatusCard'
import type { StatusState } from '@/components/retraitia/espace/StatusCard'
import Link from 'next/link'

// Types simplifiés pour le tableau de bord
interface DossierSummary {
  id: string
  status: string
  parcours: string
  clientName?: string
  formulaireComplet: boolean
  franceConnectVerified: boolean
  documents: Array<{ type: string; status: string; obligatoire: boolean }>
  nbAnomalies: number
  scoreGlobal?: string
  impactMensuelMin?: number
  impactMensuelMax?: number
  pack49Paid: boolean
}

const DOC_LABELS: Record<string, string> = {
  ris: 'Relevé Individuel de Situation (RIS)',
  notification_cnav: 'Notification de pension CNAV/CARSAT',
  releve_agirc_arrco: 'Relevé de points Agirc-Arrco',
  releve_mensualites: 'Relevé de mensualités',
  avis_imposition: 'Avis d\'imposition',
  attestation_fiscale: 'Attestation fiscale',
  eig: 'Estimation Indicative Globale (EIG)',
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
  const [dossier, setDossier] = useState<DossierSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: fetch dossier from API
    // For now, show empty state or mock
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  // Pas de dossier — état initial post-paiement ou erreur
  if (!dossier) {
    return (
      <div>
        {paymentSuccess && (
          <div className="bg-emerald/10 border border-emerald/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-medium text-slate-text">Paiement confirmé !</p>
              <p className="text-sm text-slate-muted">Votre espace RETRAITIA est en cours de configuration. Rechargez la page dans quelques instants.</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="font-heading text-xl font-bold text-slate-text mb-2">
            Votre dossier RETRAITIA
          </h2>
          <p className="text-slate-muted text-sm mb-6 max-w-md mx-auto">
            Bienvenue dans votre espace. Commencez par connecter vos comptes retraite
            via FranceConnect puis uploadez vos documents.
          </p>

          {/* Phase 1: Accès FranceConnect */}
          <div className="max-w-lg mx-auto text-left space-y-3 mb-8">
            <StatusCard
              state="todo"
              title="Connecter FranceConnect"
              subtitle="Ameli, impots.gouv.fr ou La Poste"
              timeEstimate="2 min"
              required
              actions={[
                { label: 'Voir le guide', onClick: () => {}, variant: 'primary' },
              ]}
            />

            <h3 className="font-medium text-slate-text text-sm pt-4 pb-1">📎 Documents à collecter</h3>

            {[
              { type: 'ris', req: true },
              { type: 'notification_cnav', req: true },
              { type: 'releve_agirc_arrco', req: true },
              { type: 'releve_mensualites', req: false },
              { type: 'avis_imposition', req: false },
            ].map(doc => (
              <StatusCard
                key={doc.type}
                state={doc.req ? 'todo' : 'optional'}
                title={DOC_LABELS[doc.type] || doc.type}
                required={doc.req}
                actions={[
                  { label: 'Guide', onClick: () => {} },
                  { label: 'Uploader', onClick: () => {}, variant: 'primary' },
                ]}
              />
            ))}

            <h3 className="font-medium text-slate-text text-sm pt-4 pb-1">📝 Formulaire complémentaire</h3>

            <StatusCard
              state="todo"
              title="Remplir le formulaire"
              subtitle="3 blocs · 16 questions · 5 minutes"
              timeEstimate="5 min"
              required
              onClick={() => window.location.href = '/mon-espace/retraitia/informations'}
            />
          </div>

          <Link
            href="/mon-espace/retraitia/documents"
            className="cta-primary !py-3 !px-8 inline-block"
          >
            Commencer la collecte →
          </Link>
        </div>
      </div>
    )
  }

  // Dossier existant — affichage dynamique selon le statut
  const docs = dossier.documents || []
  const docsRequired = docs.filter(d => d.obligatoire)
  const docsDone = docs.filter(d => d.status === 'extracted' || d.status === 'uploaded').length
  const totalItems = docs.length + 1 + 1 // docs + formulaire + franceconnect
  const doneItems = docsDone + (dossier.formulaireComplet ? 1 : 0) + (dossier.franceConnectVerified ? 1 : 0)

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-text mb-1">
        {dossier.clientName || 'Votre dossier RETRAITIA'}
      </h1>

      <ProgressBar
        current={doneItems}
        total={totalItems}
        label="Progression"
        sublabel="Objectif : tout passer au vert"
      />

      {/* Sections condensées */}
      <div className="space-y-3">
        {/* Accès */}
        <StatusCard
          state={dossier.franceConnectVerified ? 'done' : 'todo'}
          title="FranceConnect"
          subtitle={dossier.franceConnectVerified ? 'Connecté' : 'Non connecté'}
          required={!dossier.franceConnectVerified}
        />

        {/* Documents */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-text text-sm">📎 Documents ({docsDone}/{docs.length})</h3>
            <Link href="/mon-espace/retraitia/documents" className="text-xs text-emerald font-medium hover:underline">
              Gérer →
            </Link>
          </div>
          <div className="space-y-2">
            {docs.map(doc => (
              <StatusCard
                key={doc.type}
                state={docState(doc.status)}
                title={DOC_LABELS[doc.type] || doc.type}
                required={doc.obligatoire && doc.status === 'missing'}
              />
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <StatusCard
          state={dossier.formulaireComplet ? 'done' : 'todo'}
          title="Formulaire complémentaire"
          subtitle={dossier.formulaireComplet ? 'Complété' : '3 blocs · 16 questions'}
          required={!dossier.formulaireComplet}
          onClick={() => window.location.href = '/mon-espace/retraitia/informations'}
        />

        {/* Diagnostic */}
        {dossier.status === 'diagnostic_ready' && dossier.nbAnomalies > 0 && (
          <div className="bg-white border-2 border-emerald rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔍</span>
              <h3 className="font-heading font-bold text-slate-text">Diagnostic prêt</h3>
            </div>
            <p className="text-sm text-slate-muted mb-3">
              {dossier.nbAnomalies} anomalies détectées · Score {dossier.scoreGlobal}
            </p>
            <Link
              href="/mon-espace/retraitia/diagnostic"
              className="cta-primary !py-2.5 !px-6 !text-sm inline-block"
            >
              Voir mon diagnostic →
            </Link>
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
