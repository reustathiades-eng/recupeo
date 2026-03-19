'use client'

export function MonimpotHero() {
  return (
    <section className="relative pt-[100px] pb-16 bg-gradient-to-b from-navy via-navy/95 to-slate-bg overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-[680px]">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
            Campagne déclarative 2026 — Vérifiez maintenant
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
            Payez-vous
            <br />
            <span className="text-emerald">trop d&apos;impôts ?</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-[560px]">
            Uploadez votre avis d&apos;imposition — notre IA détecte les cases oubliées en 30 secondes. Frais réels, case T, dons, emploi à domicile... Récupérez jusqu&apos;à 3 ans de trop-payé.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <a href="#parcours-choix" className="cta-primary !py-3.5 !px-7 !text-base">
              Analyser mon avis d&apos;imposition →
            </a>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vérification gratuite · 30 secondes
            </div>
          </div>

          {/* Exemples concrets — cartes solides */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { case: 'Case T', desc: 'Parent isolé', eco: "jusqu'à 1 500€/an" },
              { case: 'Frais réels', desc: 'Longs trajets', eco: "jusqu'à 3 000€/an" },
              { case: 'Emploi domicile', desc: 'Crédit 50%', eco: "jusqu'à 6 000€/an" },
            ].map(ex => (
              <div key={ex.case} className="bg-emerald/10 border border-emerald/30 rounded-xl px-4 py-3">
                <p className="text-emerald text-sm font-bold">{ex.case}</p>
                <p className="text-white/60 text-xs">{ex.desc}</p>
                <p className="text-white text-xs font-semibold mt-1">{ex.eco}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
