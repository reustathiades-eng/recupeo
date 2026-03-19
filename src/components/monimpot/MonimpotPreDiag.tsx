'use client'
import { fmt } from '@/lib/format'
import { getFourchette } from '@/lib/monimpot/utils'
import type { MonimpotPreDiagResponse, SuggestionFuture } from '@/lib/monimpot/types'

interface Props {
  result: MonimpotPreDiagResponse
}

// ─── Score de déclaration /100 ───
function computeScore(result: MonimpotPreDiagResponse): number {
  if (!result.hasOptimisations || result.totalOptimisations === 0) return 100
  let penalty = 0
  for (const opt of result.optimisations) {
    if (opt.priorite === 'haute') penalty += 18
    else if (opt.priorite === 'moyenne') penalty += 12
    else penalty += 6
  }
  return Math.max(10, Math.min(100, 100 - penalty))
}

function getScoreColor(score: number) {
  if (score >= 90) return { bg: 'bg-emerald/10', text: 'text-emerald', ring: 'ring-emerald/30', label: 'Excellent' }
  if (score >= 75) return { bg: 'bg-emerald/10', text: 'text-emerald', ring: 'ring-emerald/30', label: 'Bon' }
  if (score >= 55) return { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200', label: 'Marge d\u2019optimisation' }
  if (score >= 35) return { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-200', label: 'Optimisable' }
  return { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200', label: 'Fortement optimisable' }
}

function getHeadline(result: MonimpotPreDiagResponse, score: number) {
  if (!result.hasOptimisations) return {
    icon: '✅', title: 'Votre déclaration semble optimisée', tone: 'positive' as const,
  }
  if (result.economieAnnuelle === 0 && result.impotActuel === 0) return {
    icon: '💡',
    title: 'Vous ne payez pas d\u2019impôt cette année',
    subtitle: 'Nous avons détecté des pistes qui pourront servir si votre situation change.',
    tone: 'info' as const,
  }
  const n = result.totalOptimisations
  const s = n > 1 ? 's' : ''
  if (score >= 75) return {
    icon: '👍',
    title: 'Déclaration globalement bien remplie',
    subtitle: `Nous avons toutefois détecté ${n} piste${s} d\u2019optimisation.`,
    tone: 'mild' as const,
  }
  if (score >= 50) return {
    icon: '🔍',
    title: `${n} piste${s} d\u2019optimisation détectée${s}`,
    subtitle: 'Votre déclaration peut être améliorée.',
    tone: 'standard' as const,
  }
  return {
    icon: '🚨',
    title: `${n} optimisation${s} détectée${s}`,
    subtitle: 'Votre déclaration présente un potentiel d\u2019économie significatif.',
    tone: 'urgent' as const,
  }
}

export function MonimpotPreDiag({ result }: Props) {
  const score = computeScore(result)
  const headline = getHeadline(result, score)
  const scoreColor = getScoreColor(score)
  const fourchette = getFourchette(result.economieAnnuelle)

  return (
    <section className="py-12 bg-white" id="resultat">
      <div className="max-w-[640px] mx-auto px-6">

        {/* ═══ Header ═══ */}
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">{headline.icon}</div>
          <h2 className="font-heading text-2xl font-bold text-navy mb-2">{headline.title}</h2>
          {headline.subtitle && (
            <p className="text-slate-muted text-sm">{headline.subtitle}</p>
          )}
        </div>

        {/* ═══ Score /100 + fourchette (CAS AVEC OPTIMISATIONS) ═══ */}
        {result.hasOptimisations && (
          <div className={`${scoreColor.bg} rounded-2xl p-6 mb-6 ring-1 ${scoreColor.ring}`}>
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <svg width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="38" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200" />
                  <circle cx="44" cy="44" r="38" fill="none" stroke="currentColor" strokeWidth="6"
                    className={scoreColor.text} strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 238.76} 238.76`}
                    transform="rotate(-90 44 44)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-heading text-2xl font-bold ${scoreColor.text}`}>{score}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-navy text-lg">Score de votre déclaration</p>
                <p className={`text-sm font-semibold ${scoreColor.text} mb-1`}>{scoreColor.label}</p>
                {result.economieAnnuelle > 0 && (
                  <p className="text-sm text-slate-muted">
                    Économie potentielle estimée : <strong className={scoreColor.text}>{fourchette}/an</strong>
                  </p>
                )}
                <p className="text-xs text-slate-muted mt-1">
                  {result.totalOptimisations} optimisation{result.totalOptimisations > 1 ? 's' : ''} identifiée{result.totalOptimisations > 1 ? 's' : ''} par notre IA
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Récap profil ═══ */}
        {result.profil && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-center">
              <div>
                <p className="text-slate-400 text-xs">Situation</p>
                <p className="font-semibold text-navy">{
                  result.profil.situation === 'celibataire' ? 'Célibataire' :
                  result.profil.situation === 'marie_pacse' ? 'Couple' :
                  result.profil.situation === 'divorce_separe' ? 'Divorcé(e)' : 'Veuf/ve'
                }</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Parts</p>
                <p className="font-semibold text-navy">{result.profil.nbParts}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Revenus</p>
                <p className="font-semibold text-navy">{fmt(result.profil.revenuNetImposable)} €</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">TMI</p>
                <p className="font-semibold text-navy">{result.profil.tmi}%</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CTA vers paywall (CAS AVEC OPTIMISATIONS + ECO > 0) ═══ */}
        {result.hasOptimisations && result.economieAnnuelle > 0 && (
          <div className="text-center mb-6">
            <a
              href="#paywall"
              className="cta-primary inline-flex items-center gap-2 !py-3.5 text-base"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('paywall')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Découvrir mes optimisations →
            </a>
            <p className="text-xs text-slate-muted mt-3">
              Audit complet à partir de 19 € · Économie estimée : {fourchette}/an
            </p>
          </div>
        )}

        {/* ═══ CAS SANS OPTIMISATION : suggestions goodwill ═══ */}
        {!result.hasOptimisations && (
          <>
            <div className="bg-emerald/5 rounded-xl p-6 text-center mb-6">
              <p className="text-sm text-slate-text">
                Nous n&apos;avons pas détecté d&apos;optimisation sur votre déclaration actuelle.
                Votre déclaration semble bien remplie — bravo !
              </p>
            </div>

            {result.suggestions && result.suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading text-lg font-bold text-navy text-center mb-2">
                  Pistes pour optimiser l&apos;année prochaine
                </h3>
                <p className="text-center text-xs text-slate-400 mb-4">
                  Actions personnalisées selon votre profil (TMI {result.profil?.tmi || 0}%).
                </p>
                <div className="space-y-2 mb-4">
                  {result.suggestions.map((sug: SuggestionFuture) => (
                    <div key={sug.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:border-emerald-300 transition-colors">
                      <span className="text-xl flex-shrink-0">{sug.icone}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm">{sug.titre}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{sug.description}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                        sug.difficulte === 'facile' ? 'bg-emerald-100 text-emerald-700' :
                        sug.difficulte === 'moyen' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sug.difficulte === 'facile' ? 'Simple' : sug.difficulte === 'moyen' ? 'Moyen' : 'Avancé'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center space-y-3">
                  <a href="/connexion" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald hover:text-emerald/80 transition-colors">
                    Créer mon compte pour un rappel personnalisé →
                  </a>
                  <p className="text-xs text-slate-muted">
                    Vérifiez aussi :
                    <a href="/mataxe" className="text-emerald font-semibold hover:underline ml-1">taxe foncière</a>,
                    <a href="/mabanque" className="text-emerald font-semibold hover:underline ml-1">frais bancaires</a>,
                    <a href="/retraitia" className="text-emerald font-semibold hover:underline ml-1">retraite</a>.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-[10px] text-slate-muted text-center mt-6">
          Économie estimée sous réserve de l&apos;exactitude de vos réponses. RÉCUPÉO n&apos;est pas un cabinet comptable.
        </p>
      </div>
    </section>
  )
}
