'use client'

export function RetraitiaHero() {
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
            <span className="text-emerald/70">RETRAITIA</span>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
            <span className="text-emerald text-sm font-semibold uppercase tracking-wider">
              Audit pension de retraite
            </span>
          </div>

          {/* Titre */}
          <h1 className="font-heading text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Votre pension est-elle{' '}
            <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">
              correctement calculée ?
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-[18px] text-white/[0.65] leading-relaxed max-w-[560px] mb-10">
            1 pension sur 7 contient au moins une erreur, et les 3/4 sont au détriment du retraité.
            Vérifiez la vôtre en 3 minutes, c&apos;est gratuit.
          </p>

          {/* CTA */}
          <div className="flex gap-3.5 flex-wrap mb-14">
            <a href="#upload" className="cta-primary !text-[17px] !py-[18px] !px-9">
              Déposez vos documents → Diagnostic gratuit
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-8 flex-wrap">
            <div>
              <div className="font-heading text-[36px] font-extrabold text-emerald tracking-tight">1/7</div>
              <div className="text-[13px] text-white/[0.45] mt-1 max-w-[140px]">pension contient une erreur</div>
              <div className="text-[10px] text-white/[0.25] mt-0.5">Cour des Comptes 2023</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">~300€</div>
              <div className="text-[13px] text-white/[0.45] mt-1 max-w-[130px]">impact moyen par mois</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">3 min</div>
              <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">pour votre diagnostic gratuit</div>
            </div>
          </div>

          {/* Lien FAQ */}
          <div className="mt-8">
            <a href="#faq" className="text-white/40 text-sm hover:text-white/60 transition-colors">
              Questions fréquentes →
            </a>
          </div>

        </div>

        {/* Mock-up rapport (desktop only) */}
        <div className="hidden lg:block flex-shrink-0 w-[280px]">
          <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">R</span>
                </div>
                <div>
                  <div className="text-[8px] font-bold text-slate-text">Rapport d&apos;audit</div>
                  <div className="text-[6px] text-slate-muted">Pension de retraite</div>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-1.5 bg-slate-border/50 rounded-full w-full" />
                <div className="h-1.5 bg-slate-border/50 rounded-full w-4/5" />
                <div className="h-1.5 bg-slate-border/50 rounded-full w-3/5" />
              </div>
              <div className="bg-emerald/10 rounded-lg p-2.5 mb-3">
                <div className="text-[7px] text-slate-muted mb-0.5">Impact total</div>
                <div className="text-emerald font-heading font-extrabold text-lg leading-none">+54 000€</div>
                <div className="text-[6px] text-slate-muted">sur l&apos;espérance de vie</div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[7px]">
                  <span className="w-3 h-3 rounded-full bg-emerald/20 flex items-center justify-center text-[6px]">1</span>
                  <span className="text-slate-text flex-1 truncate">Majoration enfants non appliquée</span>
                  <span className="text-emerald font-bold">+120€/m</span>
                </div>
                <div className="flex items-center gap-1.5 text-[7px]">
                  <span className="w-3 h-3 rounded-full bg-amber-100 flex items-center justify-center text-[6px]">2</span>
                  <span className="text-slate-text flex-1 truncate">Service militaire non reporté</span>
                  <span className="text-emerald font-bold">+35€/m</span>
                </div>
                <div className="flex items-center gap-1.5 text-[7px]">
                  <span className="w-3 h-3 rounded-full bg-blue-50 flex items-center justify-center text-[6px]">3</span>
                  <span className="text-slate-text flex-1 truncate">Points Agirc-Arrco manquants</span>
                  <span className="text-emerald font-bold">+85€/m</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-[9px] text-white/50">Exemple de diagnostic</span>
            </div>
          </div>
        </div>

        </div>
      </div>
    </section>
  )
}
