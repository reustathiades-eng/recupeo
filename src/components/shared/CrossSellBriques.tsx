'use client'
import { track } from '@/lib/analytics'

interface CrossSellItem {
  href: string
  name: string
  label: string
  desc: string
  enjeu: string
  icon: string
  tag: string
}

const ALL_BRIQUES: CrossSellItem[] = [
  { href: '/mataxe', name: 'MATAXE', label: 'Taxe foncière', desc: '40% des avis contiennent une erreur. Vérifiez gratuitement.', enjeu: '200–2 000€/an', icon: '🏠', tag: 'Pré-diag gratuit' },
  { href: '/monloyer', name: 'MONLOYER', label: 'Encadrement des loyers', desc: '37% des loyers dépassent le plafond légal.', enjeu: '~3 000€', icon: '🔑', tag: '100% gratuit' },
  { href: '/retraitia', name: 'RETRAITIA', label: 'Pension de retraite', desc: '1 pension sur 7 contient une erreur de calcul.', enjeu: '10 000–50 000€', icon: '👴', tag: 'Pré-diag gratuit' },
  { href: '/macaution', name: 'MACAUTION', label: 'Dépôt de garantie', desc: '50% des dépôts ne sont pas restitués dans les délais.', enjeu: '500–2 000€', icon: '🏦', tag: 'Diagnostic gratuit' },
  { href: '/mapension', name: 'MAPENSION', label: 'Pension alimentaire', desc: 'Revalorisation oubliée = arriérés récupérables sur 5 ans.', enjeu: '900–1 200€', icon: '⚖️', tag: 'Calcul gratuit' },
  { href: '/mabanque', name: 'MABANQUE', label: 'Frais bancaires', desc: '17% des banques en infraction. Vérifiez vos plafonds.', enjeu: '200–960€/an', icon: '💳', tag: 'Pré-diag gratuit' },
  { href: '/monimpot', name: 'MONIMPÔT', label: 'Déclaration revenus', desc: '69% des foyers oublient des réductions. Audit gratuit.', enjeu: '500–6 000€', icon: '📋', tag: 'Pré-diag gratuit' },
  { href: '/monimpot', name: 'MONIMPOT', label: 'Declaration revenus', desc: '69% des foyers oublient des reductions. Audit gratuit.', enjeu: '500-6 000\u20ac', icon: '\U0001f4cb', tag: 'Pre-diag gratuit' },
  { href: '/monchomage', name: 'MONCHÔMAGE', label: 'Allocation chômage', desc: "Erreurs de 5 à 50€/jour fréquentes. Vérifiez votre ARE.", enjeu: '500–3 000€', icon: '📋', tag: 'Pré-diag gratuit' },
  { href: '/mapaie', name: 'MAPAIE', label: 'Bulletins de paie', desc: '33% des salariés ont subi une erreur de paie. Vérifiez les vôtres.', enjeu: '1 800–7 200€', icon: '💼', tag: 'Pré-diag gratuit' },
]

interface CrossSellBriquesProps {
  /** La brique courante (à exclure de la liste) */
  currentBrique: 'mataxe' | 'monloyer' | 'retraitia' | 'macaution' | 'mapension' | 'mabanque' | 'monchomage' | 'monimpot' | 'mapaie'
  /** Nombre max de briques à afficher (défaut 3) */
  max?: number
  /** Titre personnalisé */
  title?: string
}

export function CrossSellBriques({ currentBrique, max = 3, title }: CrossSellBriquesProps) {
  const briques = ALL_BRIQUES.filter(b => b.href !== `/${currentBrique}`).slice(0, max)

  return (
    <section className="py-12 bg-slate-bg">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-8">
          <h3 className="font-heading text-[clamp(18px,3vw,24px)] font-bold text-slate-text mb-2">
            {title || 'Récupérez aussi sur d\'autres postes'}
          </h3>
          <p className="text-sm text-slate-muted">
            Les Français laissent chaque année des milliards d&apos;euros sur la table. Vérifiez gratuitement.
          </p>
        </div>

        <div className={`grid gap-4 ${briques.length === 3 ? 'sm:grid-cols-3' : briques.length === 2 ? 'sm:grid-cols-2' : ''}`}>
          {briques.map((b) => (
            <a
              key={b.href}
              href={b.href}
              onClick={() => track({ event: 'cross_sell_clicked', brique: currentBrique, target: b.name })}
              className="bg-white rounded-xl border border-slate-border p-5 hover:border-emerald/40 hover:shadow-md transition-all group no-underline"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-heading font-bold text-slate-text text-sm group-hover:text-emerald transition-colors">{b.name}</div>
                  <div className="text-[10px] text-slate-muted">{b.label}</div>
                </div>
                <span className="ml-auto text-[9px] font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {b.tag}
                </span>
              </div>
              <p className="text-xs text-slate-muted leading-relaxed mb-3">{b.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-text">Enjeu : {b.enjeu}</span>
                <span className="text-xs text-emerald font-medium group-hover:translate-x-1 transition-transform">Vérifier →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
