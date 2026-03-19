export function Marquee() {
  return (
    <section className="bg-navy py-5 overflow-hidden"><div className="flex gap-12 animate-marquee">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-12 whitespace-nowrap">
          <span className="font-heading text-[15px] font-bold text-emerald uppercase tracking-widest">Uploadez</span><span className="text-white/20">◆</span>
          <span className="font-heading text-[15px] font-bold text-white/50 uppercase tracking-widest">Vérifiez</span><span className="text-white/20">◆</span>
          <span className="font-heading text-[15px] font-bold text-emerald uppercase tracking-widest">Récupérez</span><span className="text-white/20">◆</span>
        </div>
      ))}
    </div></section>
  )
}
