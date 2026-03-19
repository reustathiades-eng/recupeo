'use client'

interface MataxeTransparencyProps {
  whatWeKnow: string[]
  whatWeDontKnow: string[]
}

export function MataxeTransparency({ whatWeKnow, whatWeDontKnow }: MataxeTransparencyProps) {
  return (
    <div className="bg-navy/[0.02] rounded-2xl border border-slate-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">🔍</span>
        <h3 className="font-heading font-bold text-slate-text text-base">En toute transparence</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ce qu'on sait */}
        <div>
          <div className="text-xs font-semibold text-emerald uppercase tracking-wider mb-3">Ce que nous savons</div>
          <ul className="space-y-2">
            {whatWeKnow.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-text">
                <span className="text-emerald mt-0.5 flex-shrink-0">✅</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ce qu'on ne sait pas */}
        {whatWeDontKnow.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">Ce que nous ne savons pas</div>
            <ul className="space-y-2">
              {whatWeDontKnow.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-muted">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">❓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-muted mt-3 italic">
              → Le formulaire 6675-M contient toutes ces réponses.
            </p>
          </div>
        )}

        {whatWeDontKnow.length === 0 && (
          <div className="flex items-center justify-center p-4 bg-emerald/5 rounded-xl">
            <p className="text-sm text-emerald font-medium text-center">
              ✨ Toutes les données clés sont disponibles pour un diagnostic précis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
