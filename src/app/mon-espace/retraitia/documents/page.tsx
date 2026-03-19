'use client'
import { useState, useCallback } from 'react'
import { StatusCard } from '@/components/retraitia/espace/StatusCard'
import { ProgressBar } from '@/components/retraitia/espace/ProgressBar'
import { DocumentUploader } from '@/components/retraitia/espace/DocumentUploader'
import { DiagnosticAccesFC } from '@/components/retraitia/espace/DiagnosticAccesFC'
import { GuidesFranceConnect } from '@/components/retraitia/espace/GuidesFranceConnect'
import type { StatusState } from '@/components/retraitia/espace/StatusCard'

interface DocItem {
  type: string
  label: string
  source: string
  guide: string
  required: boolean
  status: 'missing' | 'uploaded' | 'extracted' | 'error' | 'optional_skip'
  extractionSummary?: string
  extractionConfidence?: string
  uploadedAt?: string
}

const INITIAL_DOCS: DocItem[] = [
  {
    type: 'ris',
    label: 'Relevé Individuel de Situation (RIS)',
    source: 'info-retraite.fr',
    guide: `Connectez-vous sur info-retraite.fr avec FranceConnect. Menu "Mes documents" puis "Télécharger mon RIS".`,
    required: true,
    status: 'missing',
  },
  {
    type: 'notification_cnav',
    label: 'Notification de pension',
    source: 'lassuranceretraite.fr',
    guide: `Connectez-vous sur lassuranceretraite.fr. Menu "Mon compte" puis "Mes documents" puis "Notification de retraite".`,
    required: true,
    status: 'missing',
  },
  {
    type: 'releve_agirc_arrco',
    label: 'Relevé de points Agirc-Arrco',
    source: 'agirc-arrco.fr',
    guide: `Connectez-vous sur agirc-arrco.fr. Menu "Mon compte" puis "Mes relevés" puis "Relevé de points".`,
    required: true,
    status: 'missing',
  },
  {
    type: 'releve_mensualites',
    label: 'Relevé de mensualités',
    source: 'lassuranceretraite.fr',
    guide: `lassuranceretraite.fr → Mon compte → Mes paiements → Télécharger un relevé de mensualités.`,
    required: false,
    status: 'missing',
  },
  {
    type: 'avis_imposition',
    label: `Avis d'imposition`,
    source: 'impots.gouv.fr',
    guide: `impots.gouv.fr → Mon espace → Documents → Avis de situation déclarative ou Avis d'imposition.`,
    required: false,
    status: 'missing',
  },
  {
    type: 'attestation_fiscale',
    label: 'Attestation fiscale retraite',
    source: 'info-retraite.fr',
    guide: `info-retraite.fr → Mes documents → Attestation fiscale.`,
    required: false,
    status: 'missing',
  },
]

function getState(doc: DocItem): StatusState {
  if (doc.status === 'extracted' || doc.status === 'uploaded') return 'done'
  if (doc.status === 'error') return 'todo'
  if (doc.status === 'optional_skip') return 'optional'
  return doc.required ? 'todo' : 'optional'
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS)
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null)
  const [uploaderOpen, setUploaderOpen] = useState<string | null>(null)
  const [fcVerified, setFcVerified] = useState(false) // TODO: charger depuis dossier

  // TODO: charger l'état réel depuis le dossier via API
  const dossierId = '' // sera injecté par le layout / contexte

  const docsDone = docs.filter(d => d.status === 'extracted' || d.status === 'uploaded').length
  const docsRequired = docs.filter(d => d.required)
  const requiredDone = docsRequired.filter(d => d.status === 'extracted' || d.status === 'uploaded').length

  const precisionAudit = Math.round(40 + (docsDone / docs.length) * 60)

  const handleUploadSuccess = useCallback((docType: string, result: { summary?: string; confidence?: string }) => {
    setDocs(prev => prev.map(d =>
      d.type === docType
        ? {
            ...d,
            status: 'extracted' as const,
            extractionSummary: result.summary || 'Document extrait',
            extractionConfidence: result.confidence,
            uploadedAt: new Date().toLocaleDateString('fr-FR'),
          }
        : d
    ))
    setUploaderOpen(null)
  }, [])

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-900 mb-1">
        Documents
      </h1>
      <p className="text-sm text-slate-500 mb-4">
        Uploadez vos documents retraite. Chaque document ajouté affine votre diagnostic.
      </p>

      <ProgressBar
        current={docsDone}
        total={docs.length}
        label="Documents collectés"
        sublabel={requiredDone < docsRequired.length
          ? `${docsRequired.length - requiredDone} document${docsRequired.length - requiredDone > 1 ? 's' : ''} obligatoire${docsRequired.length - requiredDone > 1 ? 's' : ''} manquant${docsRequired.length - requiredDone > 1 ? 's' : ''}`
          : 'Tous les documents obligatoires sont uploadés'
        }
      />

      {/* Diagnostic accès FranceConnect */}
      {!fcVerified && (
        <div className="mb-6" id="franceconnect">
          <DiagnosticAccesFC
            onComplete={() => setFcVerified(true)}
          />
        </div>
      )}

      {/* Section obligatoires */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Obligatoires
        </h2>
        <div className="space-y-3">
          {docs.filter(d => d.required).map(doc => (
            <DocCard
              key={doc.type}
              doc={doc}
              expandedGuide={expandedGuide}
              expandedDetail={expandedDetail}
              onToggleGuide={(t) => setExpandedGuide(expandedGuide === t ? null : t)}
              onToggleDetail={(t) => setExpandedDetail(expandedDetail === t ? null : t)}
              onUpload={(t) => setUploaderOpen(t)}
              onReplace={(t) => setUploaderOpen(t)}
            />
          ))}
        </div>
      </div>

      {/* Section optionnels */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Optionnels — améliorent la précision
        </h2>
        <div className="space-y-3">
          {docs.filter(d => !d.required).map(doc => (
            <DocCard
              key={doc.type}
              doc={doc}
              expandedGuide={expandedGuide}
              expandedDetail={expandedDetail}
              onToggleGuide={(t) => setExpandedGuide(expandedGuide === t ? null : t)}
              onToggleDetail={(t) => setExpandedDetail(expandedDetail === t ? null : t)}
              onUpload={(t) => setUploaderOpen(t)}
              onReplace={(t) => setUploaderOpen(t)}
            />
          ))}
        </div>
      </div>

      {/* Précision de l'audit */}
      <div className="bg-slate-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-slate-500">🔍 Précision de l'audit</span>
          <span className="text-sm font-bold text-slate-700">{precisionAudit}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald rounded-full transition-all duration-500"
            style={{ width: `${precisionAudit}%` }}
          />
        </div>
        {docsDone < docs.length && (
          <p className="text-xs text-slate-400 mt-1">
            Uploadez plus de documents pour améliorer la précision
          </p>
        )}
      </div>

      {/* Guides FranceConnect par site */}
      <div className="mb-6" id="guides">
        <GuidesFranceConnect />
      </div>

      {/* Message si doc introuvable */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-medium text-amber-800 mb-1">
          Vous ne trouvez pas un document ?
        </p>
        <p className="text-xs text-amber-700">
          Pas de panique. Envoyez un message en ligne à votre caisse pour demander une copie.
          On vous fournira un message pré-rédigé dans la section Démarches.
        </p>
      </div>

      {/* Modal DocumentUploader */}
      {uploaderOpen && (
        <DocumentUploader
          documentType={uploaderOpen}
          documentLabel={docs.find(d => d.type === uploaderOpen)?.label || uploaderOpen}
          dossierId={dossierId}
          onSuccess={(result) => handleUploadSuccess(uploaderOpen, result)}
          onError={(err) => console.error('[DocumentUploader]', err)}
          onClose={() => setUploaderOpen(null)}
        />
      )}
    </div>
  )
}

// ─── Sous-composant carte document ───

function DocCard({
  doc,
  expandedGuide,
  expandedDetail,
  onToggleGuide,
  onToggleDetail,
  onUpload,
  onReplace,
}: {
  doc: DocItem
  expandedGuide: string | null
  expandedDetail: string | null
  onToggleGuide: (type: string) => void
  onToggleDetail: (type: string) => void
  onUpload: (type: string) => void
  onReplace: (type: string) => void
}) {
  const isDone = doc.status === 'extracted' || doc.status === 'uploaded'

  return (
    <StatusCard
      state={getState(doc)}
      title={doc.label}
      subtitle={isDone
        ? doc.extractionSummary || `Uploadé le ${doc.uploadedAt || '—'}`
        : `Source : ${doc.source}`
      }
      required={doc.required && doc.status === 'missing'}
    >
      {/* Guide déplié */}
      {expandedGuide === doc.type && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2 text-sm text-blue-800">
          <p className="font-medium mb-1">📖 Comment trouver ce document :</p>
          <p>{doc.guide}</p>
        </div>
      )}

      {/* Détail extraction déplié */}
      {expandedDetail === doc.type && isDone && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2">
          <p className="text-xs text-emerald-700">
            {doc.extractionSummary}
          </p>
          {doc.extractionConfidence && (
            <p className="text-xs text-emerald-600 mt-1">
              Confiance extraction : {doc.extractionConfidence}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">Uploadé le {doc.uploadedAt || '—'}</p>
        </div>
      )}

      {/* Actions — document manquant */}
      {!isDone && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => onToggleGuide(doc.type)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {expandedGuide === doc.type ? 'Fermer le guide' : '📖 Guide'}
          </button>
          <button
            onClick={() => onUpload(doc.type)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors"
          >
            📤 Uploader
          </button>
        </div>
      )}

      {/* Actions — document uploadé */}
      {isDone && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => onToggleDetail(doc.type)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {expandedDetail === doc.type ? '▲ Réduire' : '▼ Détail'}
          </button>
          <button
            onClick={() => onReplace(doc.type)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            🔄 Remplacer
          </button>
        </div>
      )}
    </StatusCard>
  )
}
