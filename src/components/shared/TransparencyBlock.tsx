interface TransparencyData {
  known: string[]
  unknown: string[]
}

interface TransparencyBlockProps {
  data: TransparencyData
  title?: string
}

export function TransparencyBlock({ data, title = 'Transparence sur notre analyse' }: TransparencyBlockProps) {
  return (
    <section className="py-16 bg-slate-bg border-t border-slate-border" id="transparence">
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-text text-center mb-4">
          {title}
        </h2>
        <p className="text-sm text-slate-muted text-center mb-10 max-w-[560px] mx-auto">
          Nous croyons que la transparence est un gage de confiance. Voici exactement ce que notre outil sait faire — et ses limites.
        </p>
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Ce que nous savons */}
          <div className="bg-white rounded-2xl border border-slate-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✅</span>
              <h3 className="font-heading text-base font-bold text-slate-text">Ce que nous vérifions</h3>
            </div>
            <ul className="space-y-3">
              {data.known.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-muted leading-relaxed">
                  <span className="text-emerald mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Ce que nous ne savons pas */}
          <div className="bg-white rounded-2xl border border-slate-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">❓</span>
              <h3 className="font-heading text-base font-bold text-slate-text">Ce que nous ne pouvons pas vérifier</h3>
            </div>
            <ul className="space-y-3">
              {data.unknown.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-muted leading-relaxed">
                  <span className="text-amber-500 mt-0.5 shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Configs par brique */
export const MACAUTION_TRANSPARENCY: TransparencyData = {
  known: [
    'Le montant de la caution versée et la durée du bail',
    'Les dégradations listées dans les états des lieux',
    'La grille de vétusté applicable (FNAIM)',
    'Les délais légaux de restitution (1 ou 2 mois)',
  ],
  unknown: [
    "L'état réel du logement (photos non analysées)",
    'Les accords verbaux entre locataire et bailleur',
    'Les travaux réalisés par le bailleur après le départ',
    'Les éventuels dégâts non mentionnés dans les états des lieux',
  ],
}

export const RETRAITIA_TRANSPARENCY: TransparencyData = {
  known: [
    'Les trimestres validés sur votre relevé de carrière',
    'Les salaires déclarés et le taux de liquidation',
    'Les droits ouverts auprès de la CNAV',
    'Les incohérences dans le calcul de votre pension',
  ],
  unknown: [
    "Les périodes travaillées à l'étranger (hors accords bilatéraux)",
    'Les régimes spéciaux non mentionnés sur le relevé',
    'Les éventuelles erreurs du relevé CNAV lui-même',
    'Les droits dérivés (réversion, majoration) non documentés',
  ],
}

export const MONLOYER_TRANSPARENCY: TransparencyData = {
  known: [
    'Le loyer de référence officiel de votre adresse',
    'La surface habitable et le nombre de pièces déclarés',
    'La zone géographique et les plafonds en vigueur',
    "L'éventuel dépassement par rapport au loyer de référence majoré",
  ],
  unknown: [
    'Les compléments de loyer justifiés (terrasse, vue exceptionnelle)',
    'Les spécificités de votre bail (meublé, colocation...)',
    'Les éventuels travaux réalisés justifiant un loyer supérieur',
    "L'historique des augmentations et des révisions du bail",
  ],
}

export const MAPENSION_TRANSPARENCY: TransparencyData = {
  known: [
    "L'indice INSEE officiel applicable à votre situation",
    'La formule légale de revalorisation (art. 208-211 du Code civil)',
    'Les arriérés calculés mois par mois sur 5 ans maximum',
    'La prescription quinquennale (art. 2224 du Code civil)',
  ],
  unknown: [
    'Les accords non-écrits entre parents modifiant la pension',
    'Les éventuelles décisions de justice postérieures au jugement initial',
    'Les paiements en espèces non traçables',
    'Les changements de situation non déclarés (revenus, charges)',
  ],
}

export const MABANQUE_TRANSPARENCY: TransparencyData = {
  known: [
    'Lecture automatique de votre relevé bancaire (OCR + IA)',
    'Les plafonds légaux des commissions d\'intervention (8€/op, 80€/mois)',
    'Les plafonds de rejets de prélèvement (20€) et de chèque (30€/50€)',
    'L\'éligibilité au statut de client fragile et les plafonds associés',
    'La prescription quinquennale (5 ans pour contester)',
    'La gratuité obligatoire des virements instantanés depuis 2025',
  ],
  unknown: [
    'Les accords spécifiques négociés avec votre conseiller bancaire',
    'Les frais liés à des produits ou services souscrits volontairement',
    'Le montant exact des chèques rejetés (pour appliquer le bon plafond)',
    'Les relevés de mois précédents si non uploadés',
  ],
}

export const MONCHOMAGE_TRANSPARENCY: TransparencyData = {
  known: [
    'Lecture automatique de votre notification France Travail (AJ, SJR, durée, dégressivité)',
    'Scan de vos bulletins de paie : salaire brut mois par mois, primes, arrêts maladie',
    'Analyse de l\'attestation employeur : salaires reportés, dates, type de rupture',
    'Détection de votre convention collective (IDCC) depuis vos bulletins de paie',
    'La formule officielle de calcul du SJR et de l\'allocation journalière',
    'Les seuils de dégressivité, durées max par âge, prescription 2 ans',
  ],
  unknown: [
    'Les périodes d\'activité non déclarées (travail au noir, auto-entreprise)',
    'Les accords d\'entreprise spécifiques modifiant les règles de votre convention',
    'Les éventuels recours déjà engagés auprès de France Travail',
  ],
}

export const MAPAIE_TRANSPARENCY: TransparencyData = {
  known: [
    'Lecture automatique de vos bulletins de paie (OCR + IA)',
    'Le SMIC mensuel brut en vigueur pour chaque période',
    'Les taux légaux de majoration des heures supplémentaires (25 % et 50 %)',
    'Les minima conventionnels des principales conventions collectives',
    'Les cotisations salariales et patronales légales',
    'La prescription des salaires sur 3 ans (art. L.3245-1 du Code du travail)',
  ],
  unknown: [
    'Les accords d\'entreprise non publiés modifiant les minima ou la durée du travail',
    'Les heures supplémentaires non déclarées sur vos bulletins',
    'Les avantages en nature non mentionnés dans vos documents',
    'Les bulletins que vous n\'avez pas uploadés',
  ],
}
