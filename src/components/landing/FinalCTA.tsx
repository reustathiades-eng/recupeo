export function FinalCTA() {
  return (
    <section id="diagnostic" className="relative overflow-hidden text-center" style={{ background: 'linear-gradient(165deg, #060D1B, #0B1426)', padding: '100px 24px' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(0,214,143,0.06),transparent_70%)]" />
      <div className="max-w-[640px] mx-auto relative">
        <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-extrabold text-white tracking-tight leading-[1.15]">Combien vous doit-on<br /><span className="text-emerald">sans que vous le sachiez&nbsp;?</span></h2>
        <p className="text-lg text-white/60 mt-5 leading-relaxed">Premier diagnostic gratuit. Résultat en 30 secondes.<br />Aucune carte bancaire requise.</p>
        <a href="#" className="cta-primary !text-lg !py-5 !px-11 mt-9 inline-flex">Lancer mon diagnostic gratuit →</a>
      </div>
    </section>
  )
}
