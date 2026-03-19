'use client'

interface CrossSellItem {
  brique: string
  label: string
  description: string
  impact?: string
  lien: string
  emoji: string
}

interface CrossSellCardProps {
  items: CrossSellItem[]
}

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'

const CROSS_SELL_MAP: Record<string, CrossSellItem> = {
  N4_EXONERATION_TF: {
    brique: 'MATAXE',
    label: 'Exonération taxe foncière',
    description: `Vérifiez si vous pouvez être exonéré de taxe foncière en tant que retraité.`,
    emoji: '🏠',
    lien: `${BASE_URL}/mataxe`,
  },
  N4_ASPA: {
    brique: 'MESDROITS',
    label: `Allocation de Solidarité (ASPA)`,
    description: `Vos revenus pourraient vous donner droit à un complément de pension.`,
    emoji: '🏥',
    lien: `${BASE_URL}/mesdroits`,
  },
  N4_CSS: {
    brique: 'MESDROITS',
    label: 'Complémentaire Santé Solidaire',
    description: 'Mutuelle gratuite ou à 1€/jour pour les revenus modestes.',
    emoji: '💊',
    lien: `${BASE_URL}/mesdroits`,
  },
  N5_CREDIT_IMPOT_EMPLOI_DOMICILE: {
    brique: 'MONIMPOT',
    label: `Crédit d'impôt emploi à domicile`,
    description: `Optimisez votre déclaration pour récupérer votre crédit d'impôt.`,
    emoji: '💶',
    lien: `${BASE_URL}/monimpot`,
  },
  N5_DEMI_PART_ANCIEN_COMBATTANT: {
    brique: 'MONIMPOT',
    label: 'Demi-part ancien combattant',
    description: `Vérifiez que votre demi-part fiscale est bien appliquée.`,
    emoji: '🎖️',
    lien: `${BASE_URL}/monimpot`,
  },
  N5_DEMI_PART_INVALIDITE: {
    brique: 'MONIMPOT',
    label: `Demi-part invalidité`,
    description: `L'invalidité 80%+ ouvre droit à une demi-part supplémentaire.`,
    emoji: '♿',
    lien: `${BASE_URL}/monimpot`,
  },
  N5_DEMI_PART_PARENT_ISOLE: {
    brique: 'MONIMPOT',
    label: 'Demi-part parent isolé',
    description: `Avoir élevé seul(e) un enfant 5+ ans = demi-part supplémentaire.`,
    emoji: '👨‍👧',
    lien: `${BASE_URL}/monimpot`,
  },
}

/**
 * Extrait les opportunités cross-sell depuis les anomalies détectées.
 */
export function getCrossSellItems(anomalyIds: string[]): CrossSellItem[] {
  const items: CrossSellItem[] = []
  const seen = new Set<string>()

  for (const id of anomalyIds) {
    const item = CROSS_SELL_MAP[id]
    if (item && !seen.has(item.brique + item.label)) {
      seen.add(item.brique + item.label)
      items.push(item)
    }
  }
  return items
}

/**
 * Encadré cross-sell dans l'espace client.
 */
export function CrossSellCard({ items }: CrossSellCardProps) {
  if (items.length === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
      <h3 className="text-sm font-bold text-blue-900 mb-2">
        Autres opportunités détectées
      </h3>
      <p className="text-xs text-blue-700 mb-3">
        Notre audit a identifié des économies possibles sur d'autres domaines.
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.lien}
            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
          >
            <span className="text-lg">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
              {item.impact && (
                <p className="text-xs font-medium text-emerald mt-1">{item.impact}</p>
              )}
            </div>
            <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full self-center">
              {item.brique}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
