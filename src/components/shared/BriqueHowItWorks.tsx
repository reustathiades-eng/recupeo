interface Step {
  num: string
  icon: string
  title: string
  desc: string
}

interface BriqueHowItWorksProps {
  steps: Step[]
  title?: string
}

export function BriqueHowItWorks({ steps, title = 'Comment ça marche' }: BriqueHowItWorksProps) {
  return (
    <section className="py-16 bg-white border-t border-slate-border" id="comment-ca-marche">
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-text text-center mb-12">
          {title}
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald/10 flex items-center justify-center text-2xl mx-auto mb-4">
                {step.icon}
              </div>
              <div className="text-xs font-bold text-emerald uppercase tracking-wider mb-2">
                Étape {step.num}
              </div>
              <h3 className="font-heading text-base font-bold text-slate-text mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Configs par brique — importables directement */
export const MACAUTION_STEPS: Step[] = [
  { num: '1', icon: '📄', title: 'Uploadez votre état des lieux', desc: "Déposez vos documents (bail, états des lieux, courriers). Notre IA les analyse en quelques secondes." },
  { num: '2', icon: '🤖', title: "L'IA compare avec les grilles de vétusté", desc: "Chaque retenue est vérifiée : vétusté, délais légaux, justificatifs du bailleur." },
  { num: '3', icon: '💰', title: 'Récupérez le montant + courrier', desc: "Montant exact à récupérer, courrier de mise en demeure prêt à envoyer." },
]

export const RETRAITIA_STEPS: Step[] = [
  { num: '1', icon: '📄', title: 'Uploadez votre relevé de carrière', desc: "Déposez votre relevé CNAV ou tout document retraite. Notre IA extrait chaque trimestre." },
  { num: '2', icon: '🤖', title: 'L\'IA vérifie chaque trimestre', desc: "Trimestres manquants, salaires sous-évalués, taux de liquidation : tout est contrôlé." },
  { num: '3', icon: '💰', title: 'Rapport d\'anomalies + courriers', desc: "Liste des erreurs détectées, estimation du gain et courriers de réclamation." },
]

export const MONLOYER_STEPS: Step[] = [
  { num: '1', icon: '📍', title: 'Entrez votre adresse et votre loyer', desc: "Adresse, surface, nombre de pièces et loyer actuel. Vérification en temps réel." },
  { num: '2', icon: '🤖', title: "On vérifie l'encadrement", desc: "Comparaison immédiate avec le loyer de référence officiel de votre zone." },
  { num: '3', icon: '💰', title: 'Résultat + courrier si dépassement', desc: "Montant du trop-perçu mensuel et courrier de mise en conformité prêt à envoyer." },
]

export const MATAXE_STEPS: Step[] = [
  { num: '1', icon: '📄', title: 'Uploadez votre 6675-M ou remplissez le formulaire', desc: "Déposez votre fiche de calcul 6675-M ou entrez manuellement vos données fiscales." },
  { num: '2', icon: '🤖', title: "L'IA compare avec les barèmes réels", desc: "Taux communaux, valeur locative, abattements : chaque ligne est vérifiée." },
  { num: '3', icon: '💰', title: 'Rapport d\'anomalies + réclamation', desc: "Anomalies détectées avec score de fiabilité et courrier de réclamation gracieuse." },
]

export const MAPENSION_STEPS: Step[] = [
  { num: '1', icon: '📝', title: 'Entrez le montant initial et la date', desc: "Montant fixé par le juge, date du jugement et indice de référence." },
  { num: '2', icon: '🤖', title: "Calcul avec l'indice INSEE officiel", desc: "Application de la formule légale de revalorisation, mois par mois." },
  { num: '3', icon: '💰', title: 'Résultat gratuit + arriérés + courrier', desc: "Nouveau montant, arriérés sur 5 ans et courrier de réclamation." },
]

export const MABANQUE_STEPS: Step[] = [
  { num: '1', icon: '📄', title: 'Uploadez votre relevé bancaire', desc: "Déposez votre relevé (PDF ou photo). Notre IA scanne et identifie automatiquement tous les frais." },
  { num: '2', icon: '🤖', title: "L'IA vérifie les plafonds légaux", desc: "Chaque frais est comparé aux plafonds du Code monétaire et financier. Détection instantanée des abus." },
  { num: '3', icon: '💰', title: 'Réclamation + médiateur', desc: "Montant récupérable, courrier de réclamation et saisine du médiateur bancaire prêts à envoyer." },
]

export const MONCHOMAGE_STEPS: Step[] = [
  { num: '1', icon: '📄', title: 'Uploadez vos documents', desc: "Notification France Travail, attestation employeur ou bulletins de paie. Notre IA extrait tout automatiquement." },
  { num: '2', icon: '🤖', title: "L'IA recalcule votre ARE", desc: "SJR théorique, allocation journalière (2 formules), dégressivité : tout est vérifié et comparé." },
  { num: '3', icon: '💰', title: 'Contestation France Travail', desc: "Écart estimé, courrier de réclamation et saisine du médiateur prêts à envoyer." },
]

export const MAPAIE_STEPS: Step[] = [
  { num: '1', icon: '📄', title: 'Uploadez vos bulletins de paie', desc: "Déposez jusqu'à 12 bulletins (PDF ou photo). Notre IA extrait toutes les données automatiquement." },
  { num: '2', icon: '🤖', title: "L'IA détecte les erreurs", desc: "SMIC, majorations heures sup, minima conventionnels, primes obligatoires : chaque ligne est vérifiée." },
  { num: '3', icon: '💰', title: 'Réclamation employeur + CPH', desc: "Rappels calculés sur 3 ans, LRAR employeur et saisine prud'hommes prêts à envoyer." },
]
