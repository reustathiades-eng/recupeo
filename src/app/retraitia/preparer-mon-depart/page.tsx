import type { Metadata } from 'next'
import Link from 'next/link'
import { TrustBanner, LegalDisclaimer } from '@/components/shared/TrustBadges'

export const metadata: Metadata = {
  title: "Préparer sa retraite : vérifiez votre carrière avant de partir | RÉCUPÉO",
  description: "Corrigez les erreurs AVANT votre départ en retraite. Vérification de carrière, simulation multi-scénarios, rachat de trimestres. Test gratuit.",
  keywords: "préparer retraite, vérifier carrière retraite, rachat trimestres, simulation retraite, optimiser date départ retraite, EIG, estimation retraite",
  openGraph: {
    title: "Préparez votre retraite : corrigez AVANT de partir",
    description: "Vérifiez votre carrière, simulez votre date de départ optimale, évaluez le rachat de trimestres.",
    url: "https://recupeo.fr/retraitia/preparer-mon-depart",
    siteName: "RÉCUPÉO", locale: "fr_FR", type: "website",
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: { canonical: "https://recupeo.fr/retraitia/preparer-mon-depart" },
}

export default function PreparerMonDepartPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-[140px] pb-20" style={{ background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)' }}>
        <div className="max-w-[800px] mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-5 text-xs text-white/40">
            <Link href="/" className="hover:text-white/60">Accueil</Link>
            <span>/</span>
            <Link href="/retraitia" className="hover:text-white/60">RETRAITIA</Link>
            <span>/</span>
            <span className="text-emerald/70">Préparer mon départ</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 mb-7">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-dot" />
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Pré-retraités</span>
          </div>
          <h1 className="font-heading text-[clamp(30px,5vw,48px)] font-extrabold text-white leading-[1.1] mb-6">
            Corrigez <span className="bg-gradient-to-r from-blue-400 to-emerald bg-clip-text text-transparent">avant</span> votre départ
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-[580px] mx-auto mb-10">
            9 relevés de carrière sur 10 contiennent au moins 5 erreurs. Corrigez-les AVANT votre départ : c'est gratuit et ça change tout.
          </p>
          <Link href="/retraitia/test" className="cta-primary !py-[18px] !px-10 inline-block">
            Tester mon profil gratuitement →
          </Link>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="font-heading text-2xl font-bold text-slate-text text-center mb-12">Pourquoi vérifier avant de partir ?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🆓</div>
              <h3 className="font-heading font-bold text-slate-text mb-2">C'est gratuit</h3>
              <p className="text-slate-muted text-sm">Avant le départ, les corrections de carrière sont gratuites. Après, c'est une réclamation.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-heading font-bold text-slate-text mb-2">Impact à vie</h3>
              <p className="text-slate-muted text-sm">Chaque euro corrigé maintenant s'applique sur toute la durée de votre retraite.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-heading font-bold text-slate-text mb-2">Date optimale</h3>
              <p className="text-slate-muted text-sm">Quelques mois de décalage peuvent changer radicalement votre pension.</p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/retraitia/test" className="cta-primary !py-4 !px-8 inline-block">
              Commencer le test →
            </Link>
          </div>
        </div>
      </section>

      <TrustBanner />
      <LegalDisclaimer brique="retraitia" />
    </>
  )
}
