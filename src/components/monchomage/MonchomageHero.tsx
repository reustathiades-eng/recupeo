'use client'

export function MonchomageHero() {
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
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-2 h-2 bg-emerald rounded-full animate-pulse-dot" />
              <span className="text-emerald text-sm font-semibold uppercase tracking-wider">MONCHÔMAGE — Vérification allocation ARE</span>
            </div>

            <h1 className="font-heading text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Scannez votre notification.{' '}
              <span className="bg-gradient-to-r from-emerald to-emerald-light bg-clip-text text-transparent">Vérifiez votre ARE.</span>
            </h1>

            <p className="text-[18px] text-white/[0.65] leading-relaxed max-w-[560px] mb-10">
              Uploadez votre notification France Travail et vos bulletins de paie — notre IA recalcule votre allocation et détecte les erreurs. Des écarts de 5 à 50€/jour sont fréquents.
            </p>

            <div className="flex gap-3.5 flex-wrap mb-14">
              <a href="#upload" className="cta-primary !text-[17px] !py-[18px] !px-9">Scanner mes documents →</a>
            </div>

            <div className="flex gap-8 flex-wrap">
              <div>
                <div className="font-heading text-[36px] font-extrabold text-emerald tracking-tight">5-50€</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[140px]">d&apos;erreur par jour fréquemment constatés</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">2 ans</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">pour contester votre notification</div>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <div className="font-heading text-[36px] font-extrabold text-white tracking-tight">Gratuit</div>
                <div className="text-[13px] text-white/[0.45] mt-1 max-w-[120px]">Pré-diagnostic instantané</div>
              </div>
            </div>
          </div>

          {/* Mock (desktop) */}
          <div className="hidden lg:block flex-shrink-0 w-[280px]">
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-5 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald flex items-center justify-center"><span className="text-white text-[8px] font-bold">C</span></div>
                  <div><div className="text-[8px] font-bold text-slate-text">Scan notification ARE</div><div className="text-[6px] text-slate-muted">3 documents analys&eacute;s</div></div>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 mb-3 border border-red-200">
                  <div className="text-[7px] text-red-500 font-semibold mb-0.5">2 anomalies d&eacute;tect&eacute;es</div>
                  <div className="text-red-600 font-heading font-extrabold text-lg leading-none">+8,50&euro;/jour</div>
                  <div className="text-[6px] text-red-400 mt-0.5">soit ~5 100&euro; sur 20 mois</div>
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-start gap-1.5"><span className="text-[8px] mt-0.5">🔴</span><span className="text-[7px] text-slate-text">SJR sous-estim&eacute; (primes omises)</span></div>
                  <div className="flex items-start gap-1.5"><span className="text-[8px] mt-0.5">🟠</span><span className="text-[7px] text-slate-text">Arr&ecirc;t maladie non neutralis&eacute;</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-bg rounded-lg p-2 text-center"><div className="text-[6px] text-slate-muted">AJ notifi&eacute;e</div><div className="text-[10px] font-bold text-slate-text">38,50&euro;</div></div>
                  <div className="bg-emerald/10 rounded-lg p-2 text-center"><div className="text-[6px] text-emerald">AJ th&eacute;orique</div><div className="text-[10px] font-bold text-emerald">47,00&euro;</div></div>
                </div>
                <div className="bg-emerald/10 rounded-lg p-2 text-center"><div className="text-[7px] text-emerald font-bold">Courrier France Travail inclus</div></div>
              </div>
              <div className="mt-3 text-center"><span className="text-[9px] text-white/50">Exemple de diagnostic automatique</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
