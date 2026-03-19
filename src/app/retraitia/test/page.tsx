'use client'
import { useState, useCallback } from 'react'
import { fmt } from '@/lib/format'
import { trackEvent } from '@/lib/analytics'

// ─────────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────────

type Step = 'status' | 'birthYear' | 'children' | 'career' | 'email' | 'result'

interface FlashState {
  status: string
  birthYear: number
  childrenCount: number
  careerType: string
  email: string
}

interface FlashApiResult {
  success: boolean
  flashId: string
  riskLevel: string
  riskScore: number
  headline: string
  subline: string
  factors: Array<{ id: string; label: string; text: string }>
}

// ─────────────────────────────────────────────
// Labels
// ─────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'retired', label: 'Je suis déjà à la retraite', icon: '🏖️' },
  { value: 'pre_retired', label: 'Je prépare ma retraite', icon: '📋' },
  { value: 'surviving', label: 'Mon conjoint est décédé', icon: '🕊️' },
]

const CAREER_OPTIONS = [
  { value: 'simple_prive', label: 'Salarié du privé', icon: '🏢' },
  { value: 'simple_public', label: 'Fonctionnaire', icon: '🏛️' },
  { value: 'independant', label: 'Indépendant', icon: '💼' },
  { value: 'mixte', label: 'Carrière mixte', icon: '🔀' },
  { value: 'agricole', label: 'Agriculteur', icon: '🌾' },
  { value: 'liberal', label: 'Profession libérale', icon: '⚕️' },
]

const RISK_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  TRES_ELEVE: { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' },
  ELEVE: { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' },
  MODERE: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500' },
  FAIBLE: { bg: 'bg-emerald/10', text: 'text-emerald', bar: 'bg-emerald' },
}

const RISK_LABELS: Record<string, string> = {
  TRES_ELEVE: 'TRÈS ÉLEVÉ',
  ELEVE: 'ÉLEVÉ',
  MODERE: 'MODÉRÉ',
  FAIBLE: 'FAIBLE',
}

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────

export default function FlashTestPage() {
  const [step, setStep] = useState<Step>('status')
  const [data, setData] = useState<FlashState>({
    status: '', birthYear: 1960, childrenCount: 0, careerType: '', email: '',
  })
  const [result, setResult] = useState<FlashApiResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // UTM params from URL
  const getUtm = useCallback(() => {
    if (typeof window === 'undefined') return {}
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      ref: params.get('ref') || undefined,
    }
  }, [])

  const goNext = (nextStep: Step) => {
    setStep(nextStep)
    setError('')
  }

  // ─── Submit flash ───
  const submitFlash = async () => {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('Veuillez saisir un email valide.')
      return
    }
    setLoading(true)
    setError('')
    trackEvent('retraitia_flash_email', { riskLevel: '' })

    try {
      const res = await fetch('/api/retraitia/flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...getUtm() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur')
      setResult(json)
      setStep('result')
      trackEvent('retraitia_flash_complete', {
        riskLevel: json.riskLevel,
        riskScore: json.riskScore,
        factors: json.factors?.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Share ───
  const shareUrl = 'https://recupeo.fr/retraitia/test'
  const shareText = `J'ai testé ma pension de retraite avec RÉCUPÉO. 1 pension sur 7 contient une erreur selon la Cour des Comptes. Testez la vôtre gratuitement →`

  const share = (channel: string) => {
    trackEvent('retraitia_flash_share', { channel })
    if (channel === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
    else if (channel === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
    else if (channel === 'email') window.open(`mailto:?subject=${encodeURIComponent('Test pension de retraite gratuit')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`)
    else if (channel === 'link') navigator.clipboard?.writeText(shareUrl)
  }

  const stepNumber = { status: 1, birthYear: 2, children: 3, career: 4, email: 5, result: 6 }[step]
  const totalSteps = 4
  const progress = step === 'result' ? 100 : step === 'email' ? 95 : Math.min(90, ((stepNumber - 1) / totalSteps) * 90)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060D1B] to-[#0B1426] flex flex-col">
      {/* Header minimal */}
      <header className="py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <a href="/" className="text-white font-heading font-extrabold text-lg tracking-tight">
            RÉCUPÉO
          </a>
          <span className="text-emerald/70 text-xs font-semibold uppercase tracking-wider">
            RETRAITIA
          </span>
        </div>
      </header>

      {/* Barre de progression */}
      {step !== 'result' && (
        <div className="max-w-lg mx-auto w-full px-6 mb-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {step !== 'email' && (
            <p className="text-white/30 text-xs mt-2 text-right">
              {stepNumber}/{totalSteps}
            </p>
          )}
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-lg">

          {/* ──── STEP: Statut ──── */}
          {step === 'status' && (
            <div className="animate-fadeIn">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white text-center mb-3">
                Votre pension contient-elle une erreur ?
              </h1>
              <p className="text-white/50 text-center text-sm mb-10">
                Test gratuit en 30 secondes · Sans engagement
              </p>
              <p className="text-white/70 text-base font-medium mb-5 text-center">
                Quelle est votre situation ?
              </p>
              <div className="space-y-3">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setData(d => ({ ...d, status: opt.value })); goNext('birthYear'); trackEvent('retraitia_flash_start', { status: opt.value }) }}
                    className="w-full flex items-center gap-4 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-emerald/30 rounded-xl px-5 py-4 text-left transition-all"
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-white font-medium text-[15px]">{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-white/25 text-xs text-center mt-8">
                1 pension sur 7 contient une erreur — Cour des Comptes, 2023
              </p>
            </div>
          )}

          {/* ──── STEP: Année de naissance ──── */}
          {step === 'birthYear' && (
            <div className="animate-fadeIn">
              <p className="text-white/70 text-base font-medium mb-6 text-center">
                {data.status === 'surviving' ? 'Votre année de naissance ?' : 'Année de naissance du retraité ?'}
              </p>
              <div className="flex justify-center mb-8">
                <input
                  type="number"
                  value={data.birthYear}
                  onChange={e => setData(d => ({ ...d, birthYear: parseInt(e.target.value) || 1960 }))}
                  min={1930} max={1980}
                  className="bg-white/[0.08] border border-white/20 rounded-xl text-white text-center text-3xl font-heading font-extrabold py-4 px-8 w-40 focus:outline-none focus:border-emerald/50"
                />
              </div>
              <input
                type="range"
                min={1935} max={1975}
                value={data.birthYear}
                onChange={e => setData(d => ({ ...d, birthYear: parseInt(e.target.value) }))}
                className="w-full accent-emerald mb-2"
              />
              <div className="flex justify-between text-white/30 text-xs mb-10">
                <span>1935</span><span>1975</span>
              </div>
              <button
                onClick={() => goNext('children')}
                disabled={data.birthYear < 1930 || data.birthYear > 1980}
                className="w-full cta-primary !py-4"
              >
                Continuer
              </button>
              <button onClick={() => goNext('status')} className="w-full text-white/30 text-sm mt-4 hover:text-white/50">
                ← Retour
              </button>
            </div>
          )}

          {/* ──── STEP: Enfants ──── */}
          {step === 'children' && (
            <div className="animate-fadeIn">
              <p className="text-white/70 text-base font-medium mb-6 text-center">
                Combien d'enfants ont été élevés ?
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-10">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setData(d => ({ ...d, childrenCount: n }))}
                    className={`w-14 h-14 rounded-xl text-lg font-bold transition-all ${
                      data.childrenCount === n
                        ? 'bg-emerald text-[#060D1B] scale-110 shadow-lg shadow-emerald/30'
                        : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.12] border border-white/10'
                    }`}
                  >
                    {n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
              <button onClick={() => goNext('career')} className="w-full cta-primary !py-4">
                Continuer
              </button>
              <button onClick={() => goNext('birthYear')} className="w-full text-white/30 text-sm mt-4 hover:text-white/50">
                ← Retour
              </button>
            </div>
          )}

          {/* ──── STEP: Carrière ──── */}
          {step === 'career' && (
            <div className="animate-fadeIn">
              <p className="text-white/70 text-base font-medium mb-6 text-center">
                Quel secteur d'activité principal ?
              </p>
              <div className="space-y-2.5">
                {CAREER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setData(d => ({ ...d, careerType: opt.value })); goNext('email') }}
                    className="w-full flex items-center gap-3.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-emerald/30 rounded-xl px-5 py-3.5 text-left transition-all"
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-white font-medium text-[15px]">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => goNext('children')} className="w-full text-white/30 text-sm mt-5 hover:text-white/50">
                ← Retour
              </button>
            </div>
          )}

          {/* ──── STEP: Email ──── */}
          {step === 'email' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <p className="text-white/50 text-sm mb-3">Votre analyse est prête.</p>
                <div className="inline-block bg-white/[0.06] border border-white/10 rounded-xl px-6 py-3">
                  <p className="text-white/40 text-xs mb-1">Risque détecté</p>
                  <div className="h-2 bg-white/10 rounded-full w-48 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald via-amber-400 to-red-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
              <p className="text-white/70 text-base font-medium mb-4 text-center">
                Où souhaitez-vous recevoir votre résultat ?
              </p>
              <div className="space-y-3 mb-6">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={data.email}
                  onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && submitFlash()}
                  className="w-full bg-white/[0.08] border border-white/20 rounded-xl text-white text-center text-lg py-4 px-6 placeholder:text-white/20 focus:outline-none focus:border-emerald/50"
                  autoFocus
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              </div>
              <button
                onClick={submitFlash}
                disabled={loading}
                className="w-full cta-primary !py-4 !text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#060D1B]/30 border-t-[#060D1B] rounded-full animate-spin" />
                    Analyse en cours...
                  </span>
                ) : (
                  '📩 Recevoir mon résultat'
                )}
              </button>
              <p className="text-white/20 text-xs text-center mt-4">
                Vos données sont protégées. Pas de spam, pas d'abonnement.
              </p>
              <button onClick={() => goNext('career')} className="w-full text-white/30 text-sm mt-4 hover:text-white/50">
                ← Retour
              </button>
            </div>
          )}

          {/* ──── STEP: Résultat ──── */}
          {step === 'result' && result && (() => {
            const colors = RISK_COLORS[result.riskLevel] || RISK_COLORS.MODERE
            const riskLabel = RISK_LABELS[result.riskLevel] || result.riskLevel

            return (
              <div className="animate-fadeIn">
                {/* Score */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                  <div className="bg-[#060D1B] px-6 py-5 text-center">
                    <p className="text-white/40 text-xs mb-1 uppercase tracking-wider">Niveau de risque</p>
                    <p className={`text-3xl font-heading font-extrabold ${colors.text === 'text-emerald' ? 'text-emerald' : colors.text.replace('text-', 'text-')}`}
                       style={{ color: colors.text === 'text-emerald' ? '#00D68F' : undefined }}
                    >
                      {riskLabel}
                    </p>
                    <div className="h-2 bg-white/10 rounded-full mt-3 max-w-[200px] mx-auto overflow-hidden">
                      <div className={`h-full ${colors.bar} rounded-full transition-all duration-1000`} style={{ width: `${result.riskScore}%` }} />
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-slate-text font-medium text-[15px] mb-1">{result.headline}</p>
                    <p className="text-slate-muted text-sm mb-5">{result.subline}</p>

                    {/* Facteurs */}
                    {result.factors.length > 0 && (
                      <div className="space-y-3 mb-6">
                        {result.factors.map(f => (
                          <div key={f.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <p className="font-semibold text-slate-text text-sm mb-1">{f.label}</p>
                            <p className="text-slate-muted text-[13px] leading-relaxed">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="bg-[#060D1B] rounded-xl p-4 mb-6">
                      <p className="text-white/50 text-xs mb-2">📊 En France :</p>
                      <div className="space-y-1 text-white/70 text-[13px]">
                        <p>• 1 pension sur 7 contient une erreur (Cour des Comptes)</p>
                        <p>• 75% des erreurs sont en défaveur des retraités</p>
                        <p>• Manque à gagner moyen : ~300€/mois</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                      <a
                        href={`/retraitia?flash=${result.flashId}`}
                        onClick={() => trackEvent('retraitia_flash_to_9', { riskLevel: result.riskLevel })}
                        className="cta-primary !py-4 !text-base !inline-block w-full"
                      >
                        🔓 Vérifier ma pension — 9€
                      </a>
                      <p className="text-slate-muted text-xs mt-2.5">
                        ✓ Espace personnel · ✓ Guides documents · ✓ Diagnostic personnalisé · ✓ 9€ déduits si vous poursuivez
                      </p>
                    </div>
                  </div>
                </div>

                {/* Partage */}
                <div className="bg-white/[0.06] border border-white/10 rounded-xl p-5 text-center">
                  <p className="text-white/50 text-sm mb-3">📤 Partagez ce test avec vos proches</p>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => share('facebook')} className="bg-[#1877F2] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Facebook</button>
                    <button onClick={() => share('whatsapp')} className="bg-[#25D366] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">WhatsApp</button>
                    <button onClick={() => share('email')} className="bg-white/10 text-white/70 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">Email</button>
                    <button onClick={() => share('link')} className="bg-white/10 text-white/70 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">🔗</button>
                  </div>
                </div>
              </div>
            )
          })()}

        </div>
      </main>

      {/* Footer minimal */}
      <footer className="py-4 px-6 text-center">
        <p className="text-white/15 text-xs">
          RÉCUPÉO · <a href="/mentions-legales" className="hover:text-white/30">Mentions légales</a> · <a href="/confidentialite" className="hover:text-white/30">Confidentialité</a>
        </p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  )
}
