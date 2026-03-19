'use client'

export function MonloyerHero() {
  return (
    <section
      className="relative overflow-hidden pt-[140px] pb-[80px] min-h-[70vh] flex items-center"
      style={{
        background: 'linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%)',
        backgroundImage: `linear-gradient(165deg, #060D1B 0%, #0B1426 40%, #0F2847 100%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
      }}
    >
      <div className="absolute top-[-40%] right-[-20%] w-[80%] h-[120%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(0,214,143,0.07) 0%, transparent 65%)' }} />
      <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-[80%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.05) 0%, transparent 60%)' }} />

      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10">
        <div className="flex items-center gap-12">
          <div className="flex-1 max-w-[640px]">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-5 text-xs text-white/40">
              <a href="/" className="hover:text-white/60 transition-colors">Accueil</a>
              <span>/</span>
              <span className="text-emerald/70">MONLOYER</span>
            </div>

            {/* Badge gratuit */}
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
              <span className="text-emerald text-sm font-semibold uppercase tracking-wider">
                100% gratuit
              </span>
            </div>

            {/* Titre */}
            <h1 className="font-heading text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Votre loyer est-il{' '}
              <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">
                trop cher ?
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-[18px] text-white/[0.65] leading-relaxed max-w-[560px] mb-10">
              30 à 37% des annonces ne respectent pas l&apos;encadrement des loyers.
              Vérifiez en 30 secondes si votre loyer dépasse le plafond légal et calculez le montant récupérable.
            </p>

            {/* CTA */}
            <div className="flex gap-3.5 flex-wrap mb-14">
              <a href="#formulaire" className="cta-primary !text-[17px] !py-[18px] !px-9">
                Vérifier mon loyer gratuitement
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 flex-wrap">
              <div>
                <div className="font-heading text-[36px] font-extrabold text-emerald tracking-tight">37%</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[140px]">des annonces hors plafond</div>
                <div className="text-[10px] text-white/[0.25] mt-0.5">OLAP 2024</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">~3 000&euro;</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[130px]">récupérables en moyenne</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">69</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">communes concernées</div>
                <div className="text-[10px] text-white/[0.25] mt-0.5">9 territoires en 2026</div>
              </div>
            </div>

            {/* Lien FAQ */}
            <div className="mt-8">
              <a href="#faq" className="text-white/40 text-sm hover:text-white/60 transition-colors">
                Questions fréquentes &rarr;
              </a>
            </div>

          </div>

          {/* Mock-up résultat (desktop only) */}
          <div className="hidden lg:block flex-shrink-0 w-[280px]">
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">L</span>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-text">Résultat vérification</div>
                    <div className="text-[6px] text-slate-muted">Encadrement des loyers</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 mb-3 border border-red-200">
                  <div className="text-[7px] text-red-500 font-semibold mb-0.5">&#9888; Dépassement détecté</div>
                  <div className="text-red-600 font-heading font-extrabold text-lg leading-none">+250&euro;/mois</div>
                  <div className="text-[6px] text-red-400 mt-0.5">au-dessus du plafond légal</div>
                </div>
                <div className="bg-emerald/10 rounded-lg p-2.5 mb-3">
                  <div className="text-[7px] text-slate-muted mb-0.5">Trop-perçu total récupérable</div>
                  <div className="text-emerald font-heading font-extrabold text-lg leading-none">8 250&euro;</div>
                  <div className="text-[6px] text-slate-muted">sur 33 mois (depuis le bail)</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[7px]">
                    <span className="text-slate-muted">Loyer actuel HC</span>
                    <span className="text-slate-text font-bold">1 200&euro;</span>
                  </div>
                  <div className="flex justify-between text-[7px]">
                    <span className="text-slate-muted">Plafond légal</span>
                    <span className="text-emerald font-bold">950&euro;</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-[9px] text-white/50">Exemple de résultat gratuit</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
