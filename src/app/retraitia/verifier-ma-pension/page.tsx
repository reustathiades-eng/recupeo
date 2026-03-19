import type { Metadata } from 'next'
import Link from 'next/link'
import { TrustBanner, TrustBadgesCompact, LegalDisclaimer } from '@/components/shared/TrustBadges'
import { ReviewSection } from '@/components/reviews/ReviewSection'
import { CrossSellBriques } from '@/components/shared/CrossSellBriques'

export const metadata: Metadata = {
  title: "Erreur pension retraite ? Vérifiez gratuitement en 30 secondes | RÉCUPÉO",
  description: "1 pension sur 7 contient une erreur. Trimestres manquants, majoration enfants non appliquée, points complémentaires oubliés… Testez votre pension gratuitement.",
  keywords: "erreur pension retraite, trimestres manquants, vérifier pension retraite, majoration enfants retraite, décote retraite, contester pension CARSAT, minimum contributif",
  openGraph: {
    title: "Votre pension de retraite est-elle correcte ? Vérification gratuite",
    description: "1 pension sur 7 contient une erreur au détriment du retraité. Vérifiez la vôtre en 30 secondes.",
    url: "https://recupeo.fr/retraitia/verifier-ma-pension",
    siteName: "RÉCUPÉO", locale: "fr_FR", type: "website",
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: { canonical: "https://recupeo.fr/retraitia/verifier-ma-pension" },
}

export default function VerifierMaPensionPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-[140px] pb-20" style={{ background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)' }}>
        <div className="absolute top-[-40%] right-[-20%] w-[80%] h-[120%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,214,143,0.07) 0%, transparent 65%)' }} />
        <div className="max-w-[800px] mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-5 text-xs text-white/40">
            <Link href="/" className="hover:text-white/60">Accueil</Link>
            <span>/</span>
            <Link href="/retraitia" className="hover:text-white/60">RETRAITIA</Link>
            <span>/</span>
            <span className="text-emerald/70">Vérifier ma pension</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 mb-7">
            <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
            <span className="text-emerald text-sm font-semibold uppercase tracking-wider">Retraités</span>
          </div>

          <h1 className="font-heading text-[clamp(30px,5vw,52px)] font-extrabold text-white leading-[1.1] mb-6">
            1 pension sur 7 contient{' '}
            <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">une erreur</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-[600px] mx-auto mb-10">
            Trimestres manquants, majoration enfants non appliquée, points complémentaires oubliés…
            Vérifiez votre pension gratuitement en 30 secondes.
          </p>
          <Link href="/retraitia/test" className="cta-primary !text-[17px] !py-[18px] !px-10 inline-block">
            Tester ma pension gratuitement →
          </Link>
          <p className="text-white/30 text-xs mt-4">Gratuit · 4 questions · Sans engagement</p>

          <div className="flex justify-center gap-8 mt-14 flex-wrap">
            <div className="text-center">
              <div className="font-heading text-3xl font-extrabold text-emerald">1/7</div>
              <div className="text-xs text-white/40 mt-1">pension contient<br/>une erreur</div>
            </div>
            <div className="w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="font-heading text-3xl font-extrabold text-white">75%</div>
              <div className="text-xs text-white/40 mt-1">des erreurs sont en<br/>défaveur du retraité</div>
            </div>
            <div className="w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="font-heading text-3xl font-extrabold text-white">~300€</div>
              <div className="text-xs text-white/40 mt-1">impact moyen<br/>par mois</div>
            </div>
          </div>
        </div>
      </section>

      {/* Les 6 niveaux d'audit */}
      <section className="py-20 bg-white">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="font-heading text-2xl font-bold text-slate-text text-center mb-4">
            6 niveaux de vérification
          </h2>
          <p className="text-slate-muted text-center mb-12 max-w-[600px] mx-auto">
            On ne laisse rien passer. Chaque aspect de votre retraite est vérifié.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📋', title: 'Retraite de base', desc: 'Trimestres, SAM, taux, proratisation, majorations, minimum contributif', anomalies: "18 types d'anomalies" },
              { icon: '📊', title: 'Complémentaire', desc: 'Points Agirc-Arrco, GMP, malus, fusion 2019, RAFP, Ircantec', anomalies: "9 types d'anomalies" },
              { icon: '💍', title: 'Réversion', desc: 'Pension de réversion base (54%) et complémentaire (60%)', anomalies: "3 types d'anomalies" },
              { icon: '🏠', title: 'Aides non réclamées', desc: "ASPA, CSS, APL, exonération taxe foncière, MaPrimeAdapt'", anomalies: '5 opportunités' },
              { icon: '💶', title: 'Optimisation fiscale', desc: "Demi-parts, crédit d'impôt emploi à domicile", anomalies: '4 opportunités' },
              { icon: '📉', title: 'CSG / CRDS', desc: 'Taux trop élevé, non rétabli après variation ponctuelle', anomalies: "2 types d'anomalies" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-heading font-bold text-slate-text text-[15px] mb-1">{item.title}</h3>
                <p className="text-slate-muted text-[13px] mb-2">{item.desc}</p>
                <span className="text-emerald text-xs font-semibold">{item.anomalies}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-emerald font-semibold text-lg mt-10">
            41 anomalies vérifiées au total
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="font-heading text-2xl font-bold text-slate-text text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Test gratuit en 30 secondes', desc: '4 questions pour évaluer votre niveau de risque. Résultat immédiat.' },
              { step: '2', title: 'Espace personnel sécurisé (9€)', desc: 'Guides pour récupérer vos documents sur FranceConnect. Upload sécurisé. Formulaire complémentaire.' },
              { step: '3', title: 'Diagnostic automatique', desc: 'Extraction de vos documents par IA. Moteur de calcul spécialisé. Détection de 41 types d\'anomalies.' },
              { step: '4', title: 'Rapport complet + actions (49€)', desc: 'Montant exact de chaque anomalie. Messages prêts à envoyer. Suivi des démarches. 1er courrier recommandé inclus.' },
            ].map(item => (
              <div key={item.step} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center text-[#060D1B] font-bold text-lg flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-text text-base mb-1">{item.title}</h3>
                  <p className="text-slate-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/retraitia/test" className="cta-primary !py-4 !px-10 inline-block">
              Commencer le test gratuit →
            </Link>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="font-heading text-2xl font-bold text-slate-text text-center mb-12">
            Tarifs transparents
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="text-emerald font-heading font-extrabold text-3xl mb-1">9€</div>
              <h3 className="font-heading font-bold text-slate-text mb-3">Pack Dossier</h3>
              <ul className="text-sm text-slate-muted space-y-2">
                <li>✓ Espace personnel sécurisé</li>
                <li>✓ Guides FranceConnect pas-à-pas</li>
                <li>✓ Upload + extraction automatique</li>
                <li>✓ Diagnostic personnalisé</li>
                <li>✓ Déduits du Pack Action</li>
              </ul>
            </div>
            <div className="border-2 border-emerald rounded-xl p-6 relative">
              <div className="absolute -top-3 right-4 bg-emerald text-[#060D1B] text-xs font-bold px-3 py-1 rounded-full">RECOMMANDÉ</div>
              <div className="text-emerald font-heading font-extrabold text-3xl mb-1">49€</div>
              <h3 className="font-heading font-bold text-slate-text mb-3">Pack Action</h3>
              <ul className="text-sm text-slate-muted space-y-2">
                <li>✓ Rapport détaillé (10 sections)</li>
                <li>✓ Montant exact par anomalie</li>
                <li>✓ Messages prêts à envoyer</li>
                <li>✓ 1er courrier recommandé inclus</li>
                <li>✓ Suivi complet des démarches</li>
              </ul>
              <p className="text-emerald text-xs font-semibold mt-3">40€ si vous avez déjà le Pack Dossier</p>
            </div>
          </div>
          <p className="text-center text-slate-muted text-sm mt-6">
            💡 Si l'impact est inférieur à 30€/mois, le rapport est offert.
          </p>
        </div>
      </section>

      <TrustBadgesCompact />
      <ReviewSection brique="retraitia" />
      <CrossSellBriques currentBrique="retraitia" />
      <TrustBanner />
      <LegalDisclaimer brique="retraitia" />
    </>
  )
}
