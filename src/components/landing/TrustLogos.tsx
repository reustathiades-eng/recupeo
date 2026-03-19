export function TrustLogos() {
  return (
    <section className="py-10 bg-slate-bg border-t border-b border-slate-border">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          <div className="flex items-center gap-2 text-slate-muted/60">
            <span className="text-lg">{'\uD83D\uDD12'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">SSL/TLS</span>
          </div>
          <div className="flex items-center gap-2 text-slate-muted/60">
            <span className="text-lg">{'\uD83C\uDDEB\uD83C\uDDF7'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">Hébergé OVH France</span>
          </div>
          <div className="flex items-center gap-2 text-slate-muted/60">
            <span className="text-lg">{'\uD83D\uDCB3'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">Paiement Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-slate-muted/60">
            <span className="text-lg">{'\uD83D\uDEE1\uFE0F'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">RGPD Conforme</span>
          </div>
          <div className="flex items-center gap-2 text-slate-muted/60">
            <span className="text-lg">{'\uD83E\uDD16'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">IA Anthropic</span>
          </div>
        </div>
      </div>
    </section>
  )
}
