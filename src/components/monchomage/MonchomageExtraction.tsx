'use client'
import type { MonchomageExtractionResult } from '@/lib/monchomage/extract-types'
import { fmt } from '@/lib/format'

interface Props {
  extraction: MonchomageExtractionResult
  onContinue: () => void
  onRestart: () => void
}

const DOC_LABELS: Record<string, { icon: string; label: string }> = {
  notification_droits: { icon: '📋', label: 'Notification de droits' },
  attestation_employeur: { icon: '📄', label: 'Attestation employeur' },
  bulletin_paie: { icon: '💰', label: 'Bulletin de paie' },
  autre: { icon: '📎', label: 'Autre document' },
}

export function MonchomageExtraction({ extraction, onContinue, onRestart }: Props) {
  const { documents, notification, emploi, bulletins, warnings } = extraction
  const hasNotif = notification.ajBrute !== null
  const hasBulletins = bulletins.count > 0

  return (
    <section id="extraction" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔍</div>
          <h2 className="font-heading text-[clamp(22px,3.5vw,32px)] font-bold text-slate-text mb-2">
            {documents.length} document{documents.length > 1 ? 's' : ''} analysé{documents.length > 1 ? 's' : ''}
          </h2>
        </div>

        {/* Documents identifiés */}
        <div className="space-y-2 mb-6">
          {documents.map((doc, i) => {
            const info = DOC_LABELS[doc.type] || DOC_LABELS.autre
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-border p-4 flex items-center gap-3">
                <span className="text-xl">{info.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-text">{info.label}</div>
                  <div className="text-xs text-slate-muted">{doc.summary || doc.fileName}</div>
                </div>
                <span className={`w-2 h-2 rounded-full ${doc.confidence === 'high' ? 'bg-emerald' : doc.confidence === 'medium' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              </div>
            )
          })}
        </div>

        {/* Données notification */}
        {hasNotif && (
          <div className="bg-white rounded-2xl border border-slate-border p-6 mb-6">
            <h3 className="font-heading font-bold text-sm text-slate-text mb-4 flex items-center gap-2">
              <span>📋</span> Données de la notification
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              {notification.ajBrute && (
                <div><p className="text-xs text-slate-muted mb-1">AJ brute</p><p className="text-lg font-bold text-slate-text">{fmt(notification.ajBrute)}€</p></div>
              )}
              {notification.sjr && (
                <div><p className="text-xs text-slate-muted mb-1">SJR</p><p className="text-lg font-bold text-slate-text">{fmt(notification.sjr)}€</p></div>
              )}
              {notification.dureeIndemnisation && (
                <div><p className="text-xs text-slate-muted mb-1">Durée</p><p className="text-lg font-bold text-slate-text">{notification.dureeIndemnisation}j</p></div>
              )}
            </div>
          </div>
        )}

        {/* Données emploi */}
        {emploi.salaireBrutMoyen && (
          <div className="bg-white rounded-2xl border border-slate-border p-6 mb-6">
            <h3 className="font-heading font-bold text-sm text-slate-text mb-4 flex items-center gap-2">
              <span>💼</span> Données emploi
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {emploi.salaireBrutMoyen && <div><span className="text-slate-muted">Salaire brut moyen :</span> <strong>{fmt(emploi.salaireBrutMoyen)}€</strong></div>}
              {emploi.primesDetectees && <div><span className="text-slate-muted">Primes détectées :</span> <strong>{fmt(emploi.primesDetectees)}€</strong></div>}
              {emploi.dateFinContrat && <div><span className="text-slate-muted">Fin de contrat :</span> <strong>{emploi.dateFinContrat}</strong></div>}
              {emploi.typeRupture && <div><span className="text-slate-muted">Type de rupture :</span> <strong>{emploi.typeRupture}</strong></div>}
            </div>
          </div>
        )}

        {/* Bulletins */}
        {hasBulletins && (
          <div className="bg-white rounded-2xl border border-slate-border p-6 mb-6">
            <h3 className="font-heading font-bold text-sm text-slate-text mb-4 flex items-center gap-2">
              <span>💰</span> {bulletins.count} bulletin{bulletins.count > 1 ? 's' : ''} de paie
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div><span className="text-slate-muted">Total brut :</span> <strong>{fmt(bulletins.totalBrut)}€</strong></div>
              {bulletins.arretsMaladie && <div><span className="text-slate-muted">Arrêts maladie :</span> <strong>{bulletins.arretsMaladie}j</strong></div>}
              {bulletins.conventionCollective && <div className="col-span-2"><span className="text-slate-muted">Convention collective :</span> <strong>{bulletins.conventionCollective}</strong></div>}
            </div>
            {bulletins.primesIdentifiees.length > 0 && (
              <div className="text-xs text-slate-muted">
                Primes : {bulletins.primesIdentifiees.map(p => `${p.label} (${fmt(p.montant)}€)`).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
            {warnings.map((w, i) => <p key={i} className="text-xs text-yellow-800">{w}</p>)}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onContinue} className="cta-primary flex-1 justify-center">Lancer le diagnostic avec ces données →</button>
        </div>
        <div className="text-center mt-4">
          <button onClick={onRestart} className="text-sm text-slate-muted hover:text-slate-text underline transition-colors">Scanner d&apos;autres documents</button>
        </div>
      </div>
    </section>
  )
}
