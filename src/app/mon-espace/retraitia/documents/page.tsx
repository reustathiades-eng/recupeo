"use client"
import { useState, useCallback, useEffect } from 'react'
import { StatusCard } from '@/components/retraitia/espace/StatusCard'
import { ProgressBar } from '@/components/retraitia/espace/ProgressBar'
import { DocumentUploader } from '@/components/retraitia/espace/DocumentUploader'
import { DiagnosticAccesFC } from '@/components/retraitia/espace/DiagnosticAccesFC'
import { GuidesFranceConnect } from '@/components/retraitia/espace/GuidesFranceConnect'
import { useDossier } from '@/lib/retraitia/DossierContext'
import type { StatusState } from '@/components/retraitia/espace/StatusCard'

interface DocItem {
  type: string
  label: string
  source: string
  guide: string
  required: boolean
  status: string
  extractionSummary?: string
  extractionConfidence?: string
  uploadedAt?: string
}

const DOC_DEFAULTS: Record<string, { label: string; source: string; guide: string }> = {
  ris: {
    label: 'Releve Individuel de Situation (RIS)',
    source: 'info-retraite.fr',
    guide: "Connectez-vous sur info-retraite.fr avec FranceConnect. Menu \"Mes documents\" puis \"Telecharger mon RIS\".",
  },
  notification_cnav: {
    label: 'Notification de pension',
    source: 'lassuranceretraite.fr',
    guide: "Connectez-vous sur lassuranceretraite.fr. Menu \"Mon compte\" puis \"Mes documents\" puis \"Notification de retraite\".",
  },
  releve_agirc_arrco: {
    label: 'Releve de points Agirc-Arrco',
    source: 'agirc-arrco.fr',
    guide: "Connectez-vous sur agirc-arrco.fr. Menu \"Mon compte\" puis \"Mes releves\" puis \"Releve de points\".",
  },
  releve_mensualites: {
    label: 'Releve de mensualites',
    source: 'lassuranceretraite.fr',
    guide: "lassuranceretraite.fr > Mon compte > Mes paiements > Telecharger un releve de mensualites.",
  },
  avis_imposition: {
    label: "Avis d'imposition",
    source: 'impots.gouv.fr',
    guide: "impots.gouv.fr > Mon espace > Documents > Avis de situation declarative ou Avis d'imposition.",
  },
  attestation_fiscale: {
    label: 'Attestation fiscale retraite',
    source: 'info-retraite.fr',
    guide: "info-retraite.fr > Mes documents > Attestation fiscale.",
  },
  eig: {
    label: 'Estimation Indicative Globale (EIG)',
    source: 'info-retraite.fr',
    guide: "info-retraite.fr > Mes documents > EIG (disponible a partir de 55 ans).",
  },
}

function getState(doc: DocItem): StatusState {
  if (doc.status === 'extracted' || doc.status === 'uploaded') return 'done'
  if (doc.status === 'error') return 'todo'
  if (doc.status === 'optional_skip') return 'optional'
  return doc.required ? 'todo' : 'optional'
}

export default function DocumentsPage() {
  const { dossier, loading, refetch } = useDossier()
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)
  const [expandedDetail, setExpandedDetail] = useState<string | null>(null)
  const [uploaderOpen, setUploaderOpen] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-sm text-slate-muted">Aucun dossier. Veuillez d'abord souscrire au Pack Dossier.</p>
      </div>
    )
  }

  // Construire la liste de docs depuis le dossier
  const rawDocs = (dossier.documents as any[]) || []
  const docs: DocItem[] = rawDocs.map((d: any) => ({
    type: d.type,
    label: DOC_DEFAULTS[d.type]?.label || d.label || d.type,
    source: DOC_DEFAULTS[d.type]?.source || d.source || '',
    guide: DOC_DEFAULTS[d.type]?.guide || d.guide || '',
    required: d.obligatoire ?? d.required ?? false,
    status: d.status || 'missing',
    extractionSummary: d.extractionSummary,
    extractionConfidence: d.extractionConfidence,
    uploadedAt: d.uploadedAt,
  }))

  const docsDone = docs.filter(d => d.status === 'extracted' || d.status === 'uploaded').length
  const docsRequired = docs.filter(d => d.required)
  const requiredDone = docsRequired.filter(d => d.status === 'extracted' || d.status === 'uploaded').length
  const precisionAudit = Math.round(40 + (docsDone / Math.max(docs.length, 1)) * 60)

  const handleUploadSuccess = useCallback(async (_docType: string, _result: any) => {
    setUploaderOpen(null)
    await refetch()
  }, [refetch])

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-slate-900 mb-1">Documents</h1>
      <p className="text-sm text-slate-500 mb-4">
        Uploadez vos documents retraite. Chaque document ajoute affine votre diagnostic.
      </p>

      <ProgressBar
        current={docsDone}
        total={docs.length}
        label="Documents collectes"
        sublabel={requiredDone < docsRequired.length
          ? `${docsRequired.length - requiredDone} document${docsRequired.length - requiredDone > 1 ? 's' : ''} obligatoire${docsRequired.length - requiredDone > 1 ? 's' : ''} manquant${docsRequired.length - requiredDone > 1 ? 's' : ''}`
          : 'Tous les documents obligatoires sont uploades'
        }
      />

      {!dossier.franceConnectVerified && (
        <div className="mb-6" id="franceconnect">
          <DiagnosticAccesFC onComplete={() => refetch()} />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Obligatoires</h2>
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

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Optionnels</h2>
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

      <div className="bg-slate-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-slate-500">Precision de l'audit</span>
          <span className="text-sm font-bold text-slate-700">{precisionAudit}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald rounded-full transition-all duration-500" style={{ width: `${precisionAudit}%` }} />
        </div>
      </div>

      <div className="mb-6" id="guides">
        <GuidesFranceConnect />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-medium text-amber-800 mb-1">Vous ne trouvez pas un document ?</p>
        <p className="text-xs text-amber-700">
          Pas de panique. Envoyez un message en ligne a votre caisse pour demander une copie.
        </p>
      </div>

      {uploaderOpen && (
        <DocumentUploader
          documentType={uploaderOpen}
          documentLabel={docs.find(d => d.type === uploaderOpen)?.label || uploaderOpen}
          dossierId={String(dossier.id)}
          onSuccess={(result) => handleUploadSuccess(uploaderOpen, result)}
          onError={(err) => console.error('[DocumentUploader]', err)}
          onClose={() => setUploaderOpen(null)}
        />
      )}
    </div>
  )
}

function DocCard({
  doc, expandedGuide, expandedDetail, onToggleGuide, onToggleDetail, onUpload, onReplace,
}: {
  doc: DocItem; expandedGuide: string | null; expandedDetail: string | null;
  onToggleGuide: (type: string) => void; onToggleDetail: (type: string) => void;
  onUpload: (type: string) => void; onReplace: (type: string) => void;
}) {
  const isDone = doc.status === 'extracted' || doc.status === 'uploaded'

  return (
    <StatusCard
      state={getState(doc)}
      title={doc.label}
      subtitle={isDone
        ? doc.extractionSummary || `Uploade le ${doc.uploadedAt || '\u2014'}`
        : `Source : ${doc.source}`
      }
      required={doc.required && doc.status === 'missing'}
    >
      {expandedGuide === doc.type && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2 text-sm text-blue-800">
          <p className="font-medium mb-1">Comment trouver ce document :</p>
          <p>{doc.guide}</p>
        </div>
      )}

      {expandedDetail === doc.type && isDone && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2">
          <p className="text-xs text-emerald-700">{doc.extractionSummary}</p>
          {doc.extractionConfidence && (
            <p className="text-xs text-emerald-600 mt-1">Confiance extraction : {doc.extractionConfidence}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">Uploade le {doc.uploadedAt || '\u2014'}</p>
        </div>
      )}

      {!isDone && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => onToggleGuide(doc.type)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
            {expandedGuide === doc.type ? 'Fermer le guide' : 'Guide'}
          </button>
          <button onClick={() => onUpload(doc.type)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors">
            Uploader
          </button>
        </div>
      )}

      {isDone && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => onToggleDetail(doc.type)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
            {expandedDetail === doc.type ? 'Reduire' : 'Detail'}
          </button>
          <button onClick={() => onReplace(doc.type)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
            Remplacer
          </button>
        </div>
      )}
    </StatusCard>
  )
}
