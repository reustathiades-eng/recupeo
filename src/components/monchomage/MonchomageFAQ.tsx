'use client'
import { useState } from 'react'

const FAQS = [
  { q: 'Comment vérifier le calcul de mon allocation chômage ?', a: "Comparez le SJR (Salaire Journalier de Référence) indiqué sur votre notification avec vos bulletins de paie. Le SJR = salaire de référence / jours calendaires. Vérifiez que toutes les primes et 13ème mois sont inclus, et que les périodes de maladie sont correctement neutralisées." },
  { q: "Qu'est-ce que le SJR (Salaire Journalier de Référence) ?", a: "Le SJR est la base du calcul de votre allocation. Il correspond au total de vos rémunérations brutes sur la période de référence (24 ou 36 mois), divisé par le nombre de jours calendaires de cette période. C'est l'erreur la plus fréquente : un SJR mal calculé impacte directement votre allocation quotidienne." },
  { q: 'Les primes sont-elles prises en compte dans le calcul du chômage ?', a: "Oui. Les primes, 13ème mois, gratifications, heures supplémentaires et avantages en nature doivent être inclus dans le salaire de référence. En revanche, les indemnités de licenciement, de congés payés et les remboursements de frais professionnels sont exclus." },
  { q: 'Comment contester une notification de France Travail ?', a: "Adressez un courrier de réclamation à votre agence France Travail (par courrier ou via votre espace personnel) en joignant vos bulletins de paie et l'attestation employeur. Si pas de réponse sous 2 mois ou refus, saisissez le médiateur (mediateur@francetravail.fr). En dernier recours : tribunal judiciaire (pôle social)." },
  { q: 'Mon allocation chômage est-elle dégressive ?', a: "La dégressivité s'applique à partir du 7ème mois d'indemnisation pour les allocataires dont le SJR dépasse 159,68€/jour (environ 4 857€ brut/mois). Elle entraîne une réduction de 30% de l'allocation. Les personnes de 55 ans et plus en sont exemptées." },
  { q: 'Les arrêts maladie réduisent-ils mon allocation chômage ?', a: "Non, ils ne devraient pas. Les périodes de maladie, maternité ou accident du travail doivent être neutralisées dans le calcul du SJR : les jours sont retirés du dénominateur. Si France Travail ne les a pas neutralisées, votre SJR est artificiellement abaissé — c'est une erreur fréquente." },
  { q: "Quel est le montant minimum de l'ARE ?", a: "L'allocation minimale est de 32,13€ brut par jour (valeur au 01/07/2025). Le calcul de l'ARE retient le montant le plus favorable entre deux formules : 40,4% du SJR + 13,18€ (partie fixe), ou 57% du SJR. L'allocation est plafonnée à 75% du SJR." },
  { q: 'Comment saisir le médiateur de France Travail ?', a: "Si votre réclamation auprès de l'agence n'aboutit pas (refus ou non-réponse sous 2 mois), vous pouvez saisir gratuitement le médiateur par email : mediateur@francetravail.fr. Joignez un résumé de votre dossier, la copie de votre réclamation et les pièces justificatives." },
  { q: 'Quelles sont les erreurs fréquentes dans le calcul du chômage ?', a: "Les plus courantes : primes/13ème mois omis du salaire de référence, périodes de maladie non neutralisées, attestation employeur avec des salaires mal reportés, date de fin de contrat erronée, dégressivité appliquée à tort, et jours travaillés mal comptés pour la durée d'indemnisation." },
  { q: "Combien de temps ai-je pour contester mon allocation ?", a: "Le délai de prescription est de 2 ans en matière de sécurité sociale. Vous pouvez donc contester le calcul de votre ARE dans les 2 ans suivant la notification de vos droits." },
]

export function MonchomageFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="faq" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <h2 className="font-heading text-[clamp(22px,3.5vw,28px)] font-bold text-slate-text text-center mb-8">Questions fréquentes</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-border overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-5 py-4 text-left flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-text">{faq.q}</span>
                <span className={`text-slate-muted transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {open === i && <div className="px-5 pb-4"><p className="text-sm text-slate-muted leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
