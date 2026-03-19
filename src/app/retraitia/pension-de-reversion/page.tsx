import type { Metadata } from 'next'
import Link from 'next/link'
import { TrustBanner, LegalDisclaimer } from '@/components/shared/TrustBadges'

export const metadata: Metadata = {
  title: "Pension de réversion : vérifiez vos droits | RÉCUPÉO",
  description: "Après le décès de votre conjoint, vous avez droit à une pension de réversion (54% à 60%). Vérifiez vos droits et faites votre demande.",
  keywords: "pension de réversion, réversion retraite, demande réversion, réversion Agirc-Arrco, réversion conjoint décédé, conditions réversion",
  openGraph: {
    title: "Pension de réversion : faites valoir vos droits",
    description: "Vérifiez votre éligibilité à la pension de réversion et lancez vos demandes auprès de chaque régime.",
    url: "https://recupeo.fr/retraitia/pension-de-reversion",
    siteName: "RÉCUPÉO", locale: "fr_FR", type: "website",
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO' }],
  },
  alternates: { canonical: "https://recupeo.fr/retraitia/pension-de-reversion" },
}

export default function PensionReversionPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-[140px] pb-20" style={{ background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)' }}>
        <div className="max-w-[800px] mx-auto px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-5 text-xs text-white/40">
            <Link href="/" className="hover:text-white/60">Accueil</Link>
            <span>/</span>
            <Link href="/retraitia" className="hover:text-white/60">RETRAITIA</Link>
            <span>/</span>
            <span className="text-emerald/70">Pension de réversion</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 mb-7">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse-dot" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Réversion</span>
          </div>
          <h1 className="font-heading text-[clamp(30px,5vw,48px)] font-extrabold text-white leading-[1.1] mb-6">
            Faites valoir vos droits à la{' '}
            <span className="bg-gradient-to-r from-purple-400 to-emerald bg-clip-text text-transparent">pension de réversion</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-[600px] mx-auto mb-10">
            Après le décès de votre conjoint, vous avez droit à une partie de sa pension. Nous vérifions vos droits auprès de chaque régime.
          </p>
          <Link href="/retraitia/test" className="cta-primary !py-[18px] !px-10 inline-block">
            Vérifier mes droits →
          </Link>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="font-heading text-2xl font-bold text-slate-text text-center mb-12">Pension de réversion par régime</h2>
          <div className="space-y-4">
            {[
              { regime: 'Régime général (CNAV)', taux: '54%', condition: 'Revenus < 24 589€/an', age: '55 ans minimum' },
              { regime: 'Agirc-Arrco', taux: '60%', condition: 'Pas de condition de ressources', age: '55 ans minimum, non remarié' },
              { regime: 'Fonction publique', taux: '50%', condition: 'Pas de condition de ressources', age: "Pas d'âge minimum" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-slate-text mb-1">{item.regime}</h3>
                  <p className="text-slate-muted text-sm">{item.condition} · {item.age}</p>
                </div>
                <div className="text-emerald font-heading font-extrabold text-2xl">{item.taux}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-muted text-sm text-center mt-8 max-w-[500px] mx-auto">
            La réversion complémentaire (Agirc-Arrco, 60%) est très souvent oubliée. RÉCUPÉO vérifie chaque régime du défunt.
          </p>
          <div className="text-center mt-10">
            <Link href="/retraitia/test" className="cta-primary !py-4 !px-8 inline-block">
              Vérifier mes droits →
            </Link>
          </div>
        </div>
      </section>

      <TrustBanner />
      <LegalDisclaimer brique="retraitia" />
    </>
  )
}
