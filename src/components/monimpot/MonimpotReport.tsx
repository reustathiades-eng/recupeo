'use client'
import { fmt } from '@/lib/format'
import { useState } from 'react'
import { track } from '@/lib/analytics'

interface Props {
  report: any
  guide: any | null
  reclamation: any | null
  diagnosticId: string
  sensitiveData?: any
}

export function MonimpotReport({ report, guide, reclamation, diagnosticId, sensitiveData }: Props) {
  const [activeTab, setActiveTab] = useState<'report' | 'guide' | 'reclamation'>('report')
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // ─── Champs réclamation éditables ───
  const [reclaFields, setReclaFields] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    numeroFiscal: sensitiveData?.numeroFiscal || '',
    numeroAvis: sensitiveData?.numeroAvis || '',
    adresseCentre: sensitiveData?.adresseCentre || '',
  })

  // ─── Remplacer les placeholders dans le courrier en temps réel ───
  const getPersonalizedCorps = () => {
    if (!reclamation?.corps) return 'Réclamation non disponible'
    let text = reclamation.corps as string
    // Remplacer les placeholders serveur par les valeurs saisies
    text = text.replace(/\[Vos nom et prénom\]/g, reclaFields.nom || '[Vos nom et prénom]')
    text = text.replace(/\[NOM PRENOM\]/g, reclaFields.nom || '[NOM PRENOM]')
    text = text.replace(/\[Votre adresse\]/g, reclaFields.adresse || '[Votre adresse]')
    text = text.replace(/\[ADRESSE\]/g, reclaFields.adresse || '[ADRESSE]')
    text = text.replace(/\[VILLE\]/g, reclaFields.ville || '[VILLE]')
    text = text.replace(/\[VILLE\]/g, reclaFields.codePostal || reclaFields.ville ? `${reclaFields.codePostal || ''} ${reclaFields.ville || ''}`.trim() : '[VILLE]')
    text = text.replace(/A \[VILLE\], le/g, `A ${reclaFields.ville || '[VILLE]'}, le`)
    text = text.replace(/\[VILLE\]/g, reclaFields.codePostal && reclaFields.ville ? `${reclaFields.codePostal} ${reclaFields.ville}` : reclaFields.ville || '[VILLE]')
    // N° fiscal et avis (peuvent venir de l'extraction ou du formulaire)
    if (reclaFields.numeroFiscal) {
      text = text.replace(/\[VOTRE N° FISCAL[^\]]*\]/g, reclaFields.numeroFiscal)
    }
    if (reclaFields.numeroAvis) {
      text = text.replace(/\[N° AVIS\]/g, reclaFields.numeroAvis)
    }
    // Adresse centre des impôts
    if (reclaFields.adresseCentre) {
      text = text.replace(/\[ADRESSE DE VOTRE CENTRE DES IMPÔTS[^\]]*\]/g, reclaFields.adresseCentre)
    }
    return text
  }

  const handleDownloadPdf = async (type: 'report' | 'reclamation') => {
    setLoadingPdf(type)
    track({ event: 'pdf_downloaded', brique: 'monimpot', type })
    try {
      const res = await fetch('/api/monimpot/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosticId, type, sensitiveData: { ...sensitiveData, ...reclaFields } }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `RECUPEO-${type === 'report' ? 'rapport' : 'reclamation'}-monimpot.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors du téléchargement')
    } finally {
      setLoadingPdf(null)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // ─── Construire le message pour la messagerie impots.gouv.fr ───
  const buildMessageImpots = () => {
    if (!reclamation) return ''
    const annee = new Date().getFullYear() - 1
    const nf = reclaFields.numeroFiscal || '[N° FISCAL]'
    const na = reclaFields.numeroAvis || '[N° AVIS]'

    // Version courte pour la messagerie en ligne (2000 chars max environ)
    const optimisations = report?.analyse_par_poste?.map((p: any, i: number) =>
      `${i + 1}. ${p.poste} (case ${p.case_a_modifier || 'N/A'}) : économie estimée ${fmt(p.economie || 0)}€`
    ).join('\n') || ''

    return `Objet : Demande de correction — Déclaration revenus ${annee}

Madame, Monsieur,

N° fiscal : ${nf}
N° avis : ${na}

Je souhaite corriger ma déclaration de revenus ${annee}. Après vérification, je constate que les éléments suivants n'ont pas été pris en compte :

${optimisations}

Économie totale estimée : ${fmt(report?.economie_totale || 0)}€/an.

Je vous prie de bien vouloir procéder à la rectification de mon imposition. Je tiens à votre disposition les justificatifs nécessaires.

Cordialement,
${reclaFields.nom || '[Votre nom]'}${reclaFields.adresse ? '\n' + reclaFields.adresse : ''}${reclaFields.codePostal || reclaFields.ville ? '\n' + (reclaFields.codePostal || '') + ' ' + (reclaFields.ville || '') : ''}`
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 text-emerald text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-emerald rounded-full" />
            Rapport complet
          </div>
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text">
            Audit de votre déclaration de revenus
          </h2>
          <p className="text-sm text-slate-muted mt-2">
            Généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Bilan financier */}
        {(report?.impot_actuel !== undefined || report?.economie_totale !== undefined) && (
          <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-6 mb-8">
            <h3 className="font-heading font-bold text-slate-text text-base mb-4">💰 Bilan financier</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-muted">Impôt payé</div>
                <div className="font-bold text-slate-text">{fmt(report.impot_actuel || 0)}€</div>
              </div>
              <div>
                <div className="text-xs text-slate-muted">Impôt optimisé</div>
                <div className="font-bold text-emerald">{fmt(report.impot_optimise || 0)}€</div>
              </div>
              <div>
                <div className="text-xs text-slate-muted">Économie annuelle</div>
                <div className="font-bold text-emerald">{fmt(report.economie_totale || 0)}€</div>
              </div>
            </div>
            <div className="border-t border-emerald/20 pt-4 flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-slate-text">Économie potentielle sur 3 ans</span>
              <span className="font-heading text-[28px] font-extrabold text-emerald">
                {fmt((report.economie_totale || 0) * 3)}€
              </span>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon="📄" label="Rapport détaillé" />
          {guide && <TabButton active={activeTab === 'guide'} onClick={() => setActiveTab('guide')} icon="📋" label="Guide correction" />}
          {reclamation && <TabButton active={activeTab === 'reclamation'} onClick={() => setActiveTab('reclamation')} icon="✉️" label="Réclamation" />}
        </div>

        {/* ═══════════════════ TAB: RAPPORT ═══════════════════ */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {report?.synthese && (
              <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
                <h3 className="font-heading font-bold text-slate-text text-base mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald rounded-full flex-shrink-0" /> Synthèse
                </h3>
                <p className="text-sm text-slate-text leading-relaxed">{report.synthese}</p>
              </div>
            )}

            {report?.analyse_par_poste?.length > 0 && (
              <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
                <h3 className="font-heading font-bold text-slate-text text-base mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald rounded-full flex-shrink-0" /> Analyse poste par poste
                </h3>
                <div className="space-y-4">
                  {report.analyse_par_poste.map((poste: any, i: number) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-border/50 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-text text-sm">{poste.poste}</h4>
                          <p className="text-[10px] text-slate-muted">
                            Case {poste.case_a_modifier || 'N/A'} · {poste.reference_cgi || ''}
                          </p>
                        </div>
                        {poste.economie > 0 && (
                          <span className="shrink-0 px-3 py-1 bg-emerald/10 text-emerald text-sm font-bold rounded-lg">
                            +{fmt(poste.economie)}€
                          </span>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-muted">Actuel : </span><span className="text-slate-text">{poste.situation_actuelle}</span></div>
                        <div><span className="text-slate-muted">Optimisé : </span><span className="text-emerald-dark font-medium">{poste.situation_optimisee}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report?.comparaison_annuelle && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                <h3 className="font-heading font-bold text-amber-800 text-base mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-400 rounded-full flex-shrink-0" /> Comparaison multi-années
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">{report.comparaison_annuelle}</p>
              </div>
            )}

            {report?.recommandations?.length > 0 && (
              <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
                <h3 className="font-heading font-bold text-slate-text text-base mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-navy rounded-full flex-shrink-0" /> Recommandations
                </h3>
                <div className="space-y-2">
                  {report.recommandations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-text">
                      <span className="text-emerald mt-0.5">✓</span><span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-4">
              <button onClick={() => handleDownloadPdf('report')} disabled={loadingPdf === 'report'} className="cta-primary !text-sm">
                {loadingPdf === 'report' ? '⏳ Génération PDF...' : '📥 Télécharger le rapport PDF'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB: GUIDE CORRECTION ═══════════════════ */}
        {activeTab === 'guide' && guide && (
          <div className="space-y-6">
            {/* Introduction */}
            {guide?.guide_correction_en_ligne?.introduction && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-sm text-blue-800 leading-relaxed">{guide.guide_correction_en_ligne.introduction}</p>
              </div>
            )}

            {/* Étapes détaillées */}
            {guide?.guide_correction_en_ligne?.etapes?.length > 0 && (
              <div className="space-y-6">
                {guide.guide_correction_en_ligne.etapes.map((etape: any, i: number) => (
                  <div key={i} className="bg-slate-bg rounded-xl border border-slate-border p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="shrink-0 w-10 h-10 rounded-full bg-emerald text-white text-lg font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="font-heading font-bold text-navy text-base">{etape.titre}</h4>
                        {etape.case_ && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald/10 text-emerald text-xs font-semibold rounded-full">
                            Case {etape.case_}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sous-étapes détaillées */}
                    {etape.instructions && Array.isArray(etape.instructions) && etape.instructions.length > 0 && (
                      <div className="ml-14 space-y-3">
                        {etape.instructions.map((instruction: string, j: number) => (
                          <div key={j} className="flex items-start gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                              {String.fromCharCode(97 + j)}
                            </span>
                            <p className="text-sm text-slate-text leading-relaxed">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Rappel délai */}
            {guide?.guide_correction_en_ligne?.rappel_delai && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="text-sm text-amber-800 leading-relaxed">
                  ⏰ {guide.guide_correction_en_ligne.rappel_delai}
                </p>
              </div>
            )}

            {/* Calendrier */}
            {guide?.calendrier?.length > 0 && (
              <div className="bg-navy/[0.03] rounded-xl border border-navy/10 p-5">
                <h4 className="font-semibold text-slate-text text-sm mb-3">📅 Calendrier des actions</h4>
                <div className="space-y-2">
                  {guide.calendrier.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-text">{item.action}</span>
                      <span className="text-xs text-slate-muted bg-slate-bg px-2 py-1 rounded">{item.delai}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ TAB: RÉCLAMATION ═══════════════════ */}
        {activeTab === 'reclamation' && reclamation && (
          <div className="space-y-6">

            {/* ─── Formulaire informations personnelles ─── */}
            <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
              <h3 className="font-heading font-bold text-slate-text text-base mb-1 flex items-center gap-2">
                <span className="w-1 h-5 bg-navy rounded-full flex-shrink-0" /> Vos informations
              </h3>
              <p className="text-xs text-slate-muted mb-4">Renseignez ces champs pour personnaliser votre courrier et votre message.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-muted mb-1">Nom et prénom</label>
                  <input
                    type="text" value={reclaFields.nom}
                    onChange={e => setReclaFields(p => ({ ...p, nom: e.target.value }))}
                    placeholder="Jean Dupont"
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted mb-1">Adresse postale</label>
                  <input
                    type="text" value={reclaFields.adresse}
                    onChange={e => setReclaFields(p => ({ ...p, adresse: e.target.value }))}
                    placeholder="12 rue de la Paix"
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted mb-1">Code postal</label>
                  <input
                    type="text" value={reclaFields.codePostal}
                    onChange={e => setReclaFields(p => ({ ...p, codePostal: e.target.value }))}
                    placeholder="75001"
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted mb-1">Ville</label>
                  <input
                    type="text" value={reclaFields.ville}
                    onChange={e => setReclaFields(p => ({ ...p, ville: e.target.value }))}
                    placeholder="Paris"
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted mb-1">N° fiscal (13 chiffres)</label>
                  <input
                    type="text" value={reclaFields.numeroFiscal}
                    onChange={e => setReclaFields(p => ({ ...p, numeroFiscal: e.target.value }))}
                    placeholder="Voir votre avis d'imposition"
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-muted mb-1">N° d&apos;avis</label>
                  <input
                    type="text" value={reclaFields.numeroAvis}
                    onChange={e => setReclaFields(p => ({ ...p, numeroAvis: e.target.value }))}
                    placeholder="Voir votre avis d'imposition"
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-muted mb-1">Adresse de votre centre des impôts</label>
                  <input
                    type="text" value={reclaFields.adresseCentre}
                    onChange={e => setReclaFields(p => ({ ...p, adresseCentre: e.target.value }))}
                    placeholder="Service des impôts des particuliers de..."
                    className="w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:border-emerald focus:ring-1 focus:ring-emerald/30 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ─── Option 1 : Courrier recommandé ─── */}
            <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-slate-text text-base flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald rounded-full flex-shrink-0" />
                  Option 1 — Courrier recommandé
                </h3>
                <button onClick={() => handleCopy(getPersonalizedCorps(), 'courrier')} className="text-xs text-emerald hover:underline font-medium">
                  {copied === 'courrier' ? '✅ Copié !' : '📋 Copier'}
                </button>
              </div>
              <p className="text-xs text-slate-muted mb-3">
                Réclamation contentieuse formelle à envoyer en recommandé AR à votre centre des impôts.
              </p>

              <div className="bg-white rounded-lg p-5 border border-slate-border text-sm text-slate-text leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto">
                {getPersonalizedCorps()}
              </div>

              {reclamation.envoi && (
                <p className="text-xs text-amber-700 mt-3 p-2 bg-amber-50 rounded-lg">📮 {reclamation.envoi}</p>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => handleDownloadPdf('reclamation')} disabled={loadingPdf === 'reclamation'} className="cta-primary !text-sm">
                  {loadingPdf === 'reclamation' ? '⏳ PDF...' : '📥 Télécharger le courrier PDF'}
                </button>
              </div>
            </div>

            {/* ─── Option 2 : Messagerie impots.gouv.fr ─── */}
            <div className="bg-slate-bg rounded-xl border border-slate-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-slate-text text-base flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full flex-shrink-0" />
                  Option 2 — Message via impots.gouv.fr
                </h3>
                <button onClick={() => handleCopy(buildMessageImpots(), 'message')} className="text-xs text-blue-600 hover:underline font-medium">
                  {copied === 'message' ? '✅ Copié !' : '📋 Copier'}
                </button>
              </div>
              <p className="text-xs text-slate-muted mb-3">
                Version courte à coller dans la messagerie sécurisée de votre espace impots.gouv.fr.
                Plus rapide qu&apos;un courrier, même valeur juridique.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-3">
                <p className="text-xs text-blue-700 font-medium mb-2">Comment faire :</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Connectez-vous sur <strong>impots.gouv.fr</strong> → Espace particulier</li>
                  <li>Cliquez sur <strong>«&nbsp;Écrire&nbsp;»</strong> dans la messagerie sécurisée</li>
                  <li>Sélectionnez <strong>«&nbsp;Ma déclaration de revenus&nbsp;»</strong> comme motif</li>
                  <li>Collez le message ci-dessous et joignez vos justificatifs</li>
                </ol>
              </div>

              <div className="bg-white rounded-lg p-5 border border-blue-200 text-sm text-slate-text leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto">
                {buildMessageImpots()}
              </div>
            </div>

            {/* Pièces jointes */}
            {reclamation?.pieces_jointes?.length > 0 && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
                <h4 className="font-semibold text-amber-800 text-sm mb-3">📎 Pièces justificatives à joindre (courrier ou message)</h4>
                <div className="space-y-1.5">
                  {reclamation.pieces_jointes.map((pj: string, i: number) => (
                    <div key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span><span>{pj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-navy/[0.03] rounded-xl border border-navy/10">
          <p className="text-[10px] text-slate-muted text-center leading-relaxed">
            Ce rapport est un outil d&apos;aide à la vérification de votre déclaration de revenus. Il ne constitue pas un conseil fiscal personnalisé
            et ne se substitue pas à l&apos;avis d&apos;un expert-comptable ou d&apos;un avocat fiscaliste.
            Les calculs sont basés sur le barème progressif 2026 et les plafonds légaux en vigueur.
            RÉCUPÉO — recupeo.fr
          </p>
        </div>
      </div>
    </section>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-navy text-white' : 'bg-slate-bg text-slate-muted hover:bg-slate-border'
      }`}
    >
      {icon} {label}
    </button>
  )
}
