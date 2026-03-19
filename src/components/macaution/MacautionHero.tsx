'use client'

export function MacautionHero() {
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
            {/* Badge */}
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
              <span className="text-emerald text-sm font-semibold uppercase tracking-wider">
                MACAUTION — Audit dépôt de garantie
              </span>
            </div>

            {/* Titre */}
            <h1 className="font-heading text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Déposez vos documents,{' '}
              <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">
                l&apos;IA détecte les retenues abusives.
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-[18px] text-white/[0.65] leading-relaxed max-w-[560px] mb-10">
              Bail, états des lieux, courrier du bailleur... Déposez vos documents et notre IA
              extrait les données, croise avec la loi et calcule ce qu&apos;on vous doit. Pré-diagnostic gratuit.
            </p>

            {/* CTA */}
            <div className="flex gap-3.5 flex-wrap mb-14">
              <a href="#upload" className="cta-primary !text-[17px] !py-[18px] !px-9">
                Déposer mes documents →
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 flex-wrap">
              <div>
                <div className="font-heading text-[36px] font-extrabold text-emerald tracking-tight">40%</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">des cautions font l&apos;objet de retenues abusives</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">~850&euro;</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">Montant moyen récupérable</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">30 sec</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">Pour déposer vos documents</div>
              </div>
            </div>
          </div>

          {/* Mock résultat (desktop only) */}
          <div className="hidden lg:block flex-shrink-0 w-[280px]">
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">C</span>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-slate-text">Pré-diagnostic caution</div>
                    <div className="text-[6px] text-slate-muted">Analyse IA terminée</div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 mb-3 border border-red-200">
                  <div className="text-[7px] text-red-500 font-semibold mb-0.5">&#9888; Retenue abusive détectée</div>
                  <div className="text-red-600 font-heading font-extrabold text-lg leading-none">652&euro;</div>
                  <div className="text-[6px] text-red-400 mt-0.5">récupérables sur votre caution</div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-[7px]">
                    <span className="text-slate-muted">Caution versée</span>
                    <span className="text-slate-text font-bold">900&euro;</span>
                  </div>
                  <div className="flex justify-between text-[7px]">
                    <span className="text-slate-muted">Retenues justifiées</span>
                    <span className="text-slate-text font-bold">248&euro;</span>
                  </div>
                  <div className="flex justify-between text-[7px]">
                    <span className="text-slate-muted">Vétusté non appliquée</span>
                    <span className="text-red-500 font-bold">-320&euro;</span>
                  </div>
                  <div className="flex justify-between text-[7px]">
                    <span className="text-slate-muted">Pénalité retard (2 mois)</span>
                    <span className="text-red-500 font-bold">-180&euro;</span>
                  </div>
                </div>
                <div className="bg-emerald/10 rounded-lg p-2 text-center">
                  <div className="text-[7px] text-emerald font-bold">3 anomalies détectées</div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-[9px] text-white/50">Exemple de pré-diagnostic</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
