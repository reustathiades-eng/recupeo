'use client'
// ============================================================
// /avis — Page publique avis + formulaire (si token)
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewStars } from '@/components/reviews/ReviewStars'
import { BRIQUE_LABELS, BRIQUE_NAMES, REVIEWS_PER_PAGE } from '@/lib/reviews/constants'
import { fmt } from '@/lib/format'
import { track } from '@/lib/analytics'
import { ReviewJsonLd } from '@/components/reviews/ReviewJsonLd'

interface Review {
  id: string; note: number; commentaire?: string; prenom: string
  ville?: string; brique: string; montantRecupere?: number
  isVerified?: boolean; publishedAt?: string
}

interface Stats {
  averageNote: number; totalReviews: number; totalRecovered: number
  averageRecovered: number; recoveryRate: number
  distribution: Record<number, number>
}

// ─── Formulaire d'avis ───
function ReviewForm({ token, prefillNote, prefillBrique }: { token: string; prefillNote?: number; prefillBrique?: string }) {
  const [note, setNote] = useState(prefillNote || 0)
  const [commentaire, setCommentaire] = useState('')
  const [prenom, setPrenom] = useState('')
  const [ville, setVille] = useState('')
  const [montant, setMontant] = useState('')
  const [hasRecovered, setHasRecovered] = useState<string>('pending')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!note || !prenom.trim() || !consent) {
      setError('Veuillez remplir les champs obligatoires.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, note, commentaire: commentaire.trim(),
          prenom: prenom.trim(), ville: ville.trim(),
          montantRecupere: montant ? Number(montant) : undefined,
          hasRecovered, consentPublication: consent,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        track({ event: 'review_submitted', brique: prefillBrique || 'unknown' })
        if (montant) track({ event: 'review_montant_declared', brique: prefillBrique || 'unknown' })
      } else {
        setError(data.error || 'Erreur lors de la soumission.')
      }
    } catch { setError('Erreur réseau.') }
    finally { setLoading(false) }
  }

  if (submitted) {
    return (
      <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="font-heading text-xl font-bold text-navy mb-2">Merci pour votre avis !</h2>
        <p className="text-sm text-slate-muted">Votre retour nous aide à améliorer notre service et guide d'autres utilisateurs.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-lg mx-auto mb-12">
      <h2 className="font-heading text-xl font-bold text-navy mb-1">Donnez votre avis</h2>
      {prefillBrique && (
        <p className="text-sm text-slate-muted mb-6">Service : {BRIQUE_NAMES[prefillBrique] || prefillBrique}</p>
      )}

      <div className="space-y-5">
        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Votre note *</label>
          <ReviewStars note={note} size="lg" interactive onChange={setNote} />
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Commentaire (optionnel)</label>
          <textarea
            value={commentaire} onChange={e => setCommentaire(e.target.value)}
            placeholder="Décrivez votre expérience..."
            maxLength={500} rows={3}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-navy placeholder:text-slate-muted/50 focus:outline-none focus:ring-2 focus:ring-emerald/30"
          />
          <p className="text-[10px] text-slate-muted text-right">{commentaire.length}/500</p>
        </div>

        {/* Récupération */}
        <div>
          <label className="block text-sm font-medium text-navy mb-2">Avez-vous récupéré de l'argent ?</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'yes', label: 'Oui' },
              { value: 'pending', label: 'En attente' },
              { value: 'not_yet', label: 'Pas encore fait' },
              { value: 'no_anomaly', label: 'Pas d\'anomalie' },
            ].map(opt => (
              <button
                key={opt.value} type="button"
                onClick={() => setHasRecovered(opt.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  hasRecovered === opt.value
                    ? 'border-emerald bg-emerald/5 text-navy'
                    : 'border-slate-200 text-slate-muted hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Montant si oui */}
        {hasRecovered === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Combien avez-vous récupéré (€) ?</label>
            <input
              type="number" value={montant} onChange={e => setMontant(e.target.value)}
              placeholder="ex: 450" min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-emerald/30"
            />
          </div>
        )}

        {/* Prénom + Ville */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Prénom *</label>
            <input
              type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
              placeholder="Jean" maxLength={50}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-emerald/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Ville (optionnel)</label>
            <input
              type="text" value={ville} onChange={e => setVille(e.target.value)}
              placeholder="Lyon" maxLength={50}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-navy focus:outline-none focus:ring-2 focus:ring-emerald/30"
            />
          </div>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-emerald" />
          <span className="text-xs text-slate-muted leading-relaxed">
            J'autorise RÉCUPÉO à publier mon prénom, ma ville et mon commentaire sur le site. *
          </span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit} disabled={loading || !note || !prenom.trim() || !consent}
          className="cta-primary w-full justify-center !py-3.5 disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Publier mon avis →'}
        </button>
      </div>
    </div>
  )
}

// ─── Contenu principal ───
function AvisContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const prefillNote = searchParams.get('note') ? parseInt(searchParams.get('note')!) : undefined
  const prefillBrique = searchParams.get('brique') || undefined
  const filterBrique = searchParams.get('brique') || ''

  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews/stats').then(r => r.ok ? r.json() : null).then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterBrique) params.set('brique', filterBrique)
    params.set('page', String(page))
    fetch(`/api/reviews/list?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setReviews(data.reviews)
          setTotalPages(data.totalPages)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filterBrique, page])

  return (
    <div className="min-h-screen bg-slate-bg pt-24 pb-16">
      <ReviewJsonLd />
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-3">
            Avis clients RÉCUPÉO
          </h1>
          <p className="text-slate-muted text-base max-w-xl mx-auto">
            Des avis vérifiés de clients qui ont récupéré leur argent grâce à nos outils.
          </p>
        </div>

        {/* Stats globales */}
        {stats && stats.totalReviews > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-xl border border-slate-100 p-5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-heading text-2xl font-bold text-navy">{stats.averageNote}/5</span>
              </div>
              <p className="text-xs text-slate-muted">Note moyenne</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5 text-center">
              <p className="font-heading text-2xl font-bold text-navy">{stats.totalReviews}</p>
              <p className="text-xs text-slate-muted">Avis vérifiés</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5 text-center">
              <p className="font-heading text-2xl font-bold text-emerald">{fmt(stats.totalRecovered)} €</p>
              <p className="text-xs text-slate-muted">Total récupéré</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5 text-center">
              <p className="font-heading text-2xl font-bold text-navy">{stats.recoveryRate}%</p>
              <p className="text-xs text-slate-muted">Taux de récupération</p>
            </div>
          </div>
        )}

        {/* Formulaire si token */}
        {token && (
          <ReviewForm token={token} prefillNote={prefillNote} prefillBrique={prefillBrique} />
        )}

        {/* Filtre par brique */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Link
            href="/avis"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all no-underline ${
              !filterBrique ? 'border-emerald bg-emerald/10 text-navy' : 'border-slate-200 text-slate-muted hover:border-slate-300'
            }`}
          >
            Toutes
          </Link>
          {Object.entries(BRIQUE_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/avis?brique=${key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all no-underline ${
                filterBrique === key ? 'border-emerald bg-emerald/10 text-navy' : 'border-slate-200 text-slate-muted hover:border-slate-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Liste des avis */}
        {loading ? (
          <div className="text-center py-12 text-slate-muted">Chargement...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-muted">Aucun avis pour le moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {reviews.map(r => <ReviewCard key={r.id} {...r} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      p === page ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-muted hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AvisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-bg flex items-center justify-center"><p className="text-slate-muted">Chargement...</p></div>}>
      <AvisContent />
    </Suspense>
  )
}
