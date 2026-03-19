'use client'
// ============================================================
// /mon-espace/mes-documents — Documents générés
// ============================================================

import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'

interface Document {
  id: string
  brique: string
  type: 'rapport' | 'courriers'
  createdAt: string
  url?: string
}

const BRIQUE_LABELS: Record<string, string> = {
  macaution: 'MACAUTION', monloyer: 'MONLOYER', retraitia: 'RETRAITIA',
  mataxe: 'MATAXE', mapension: 'MAPENSION', mabanque: 'MABANQUE', monchomage: 'MONCHOMAGE',
}

export default function MesDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    track({ event: 'mes_documents_viewed', brique: 'mon-espace' })
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/auth/diagnostics')
      if (res.ok) {
        const json = await res.json()
        const docs: Document[] = []
        for (const d of json.diagnostics || []) {
          if (d.paid && d.generatedPdfUrl) {
            docs.push({ id: `${d.id}-pdf`, brique: d.brique, type: 'rapport', createdAt: d.createdAt, url: d.generatedPdfUrl })
          }
          if (d.paid && d.generatedLettersUrl) {
            docs.push({ id: `${d.id}-letters`, brique: d.brique, type: 'courriers', createdAt: d.createdAt, url: d.generatedLettersUrl })
          }
        }
        setDocuments(docs)
      }
    } catch { /* silencieux */ }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy mb-2">Mes documents</h1>
      <p className="text-slate-muted text-sm mb-6">Rapports PDF et courriers générés. Conservation : 2 ans.</p>

      {loading ? (
        <div className="text-center py-12 text-slate-muted">Chargement...</div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-slate-muted mb-2">Aucun document pour le moment.</p>
          <p className="text-sm text-slate-muted">Vos rapports et courriers apparaîtront ici après un achat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.type === 'rapport' ? 'bg-blue-50' : 'bg-emerald/10'}`}>
                  <span className="text-lg">{doc.type === 'rapport' ? '📊' : '✉️'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy">
                    {doc.type === 'rapport' ? 'Rapport complet' : 'Courriers de réclamation'} — {BRIQUE_LABELS[doc.brique] || doc.brique}
                  </p>
                  <p className="text-xs text-slate-muted">
                    {new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {doc.url && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald text-sm font-medium hover:underline whitespace-nowrap"
                  onClick={() => track({ event: 'document_downloaded', brique: doc.brique })}
                >
                  Télécharger →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
