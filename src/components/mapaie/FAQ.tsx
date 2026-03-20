'use client'
import { useState } from 'react'

const FAQS = [
  { q: "Mon bulletin de paie peut-il vraiment contenir des erreurs ?", a: "Oui, et c'est bien plus fréquent qu'on ne le croit. Une étude du ministère du Travail estime que 30 à 40% des bulletins de salaire contiennent au moins une irrégularité. Heures supplémentaires mal comptées, majoration absente, prime oubliée, cotisations incorrectes... L'employeur n'est pas toujours de mauvaise foi, mais ces erreurs vous coûtent de l'argent réel." },
  { q: "Combien de temps en arrière peut-on réclamer ?", a: "Vous disposez de 3 ans pour réclamer des rappels de salaire (article L3245-1 du Code du travail). Concrètement : si l'employeur vous a sous-payé des heures supplémentaires depuis 2022, vous pouvez réclamer jusqu'en 2025. Au-delà, la créance est prescrite. C'est pourquoi il faut agir vite dès que vous suspectez une anomalie." },
  { q: "Quelles sont les erreurs de paie les plus courantes ?", a: "Les plus fréquentes : heures supplémentaires non majorées ou non payées (25% pour les 8 premières, 50% au-delà), taux de majoration inférieur à ce que prévoit la convention collective, prime d'ancienneté non versée, minimum conventionnel non respecté, repos compensateur ignoré, indemnité de repas ou transport absente. Chaque anomalie peut représenter plusieurs centaines d'euros par mois." },
  { q: "Que faire si mon employeur refuse de corriger l'erreur ?", a: "En cas de refus, vous avez deux options. D'abord la mise en demeure : une lettre recommandée avec accusé de réception (LRAR) détaillant le préjudice chiffré donne 15 jours à l'employeur pour répondre. Si le refus persiste, vous pouvez saisir le Conseil de Prud'hommes (CPH) sans avocat obligatoire. Le juge peut condamner l'employeur à payer les rappels de salaire + dommages et intérêts + frais de procédure." },
  { q: "C'est quoi la convention collective et pourquoi c'est important ?", a: "La convention collective est un accord négocié entre syndicats et employeurs qui fixe des droits supplémentaires par rapport à la loi : salaire minimum par qualification, primes spécifiques, majorations renforcées... Votre employeur est obligé de l'appliquer. Si votre bulletin ne respecte pas votre convention collective (indiquée sur le bulletin), c'est une infraction qui ouvre droit à rappel de salaire." },
  { q: "Est-ce que réclamer peut me coûter mon emploi ?", a: "La loi interdit formellement le licenciement ou toute sanction en représailles à une réclamation salariale légitime. C'est un licenciement nul de plein droit (article L1132-1 du Code du travail). Si votre employeur réagit de cette façon, vous auriez une deuxième créance encore plus importante devant les Prud'hommes. Réclamer ce qu'on vous doit est un droit, pas une faute." },
  { q: "C'est quoi exactement le Conseil de Prud'hommes ?", a: "Le CPH est le tribunal spécialisé dans les litiges entre salariés et employeurs. Il est composé de juges élus — moitié salariés, moitié employeurs. La procédure commence par une audience de conciliation (gratuite, sans avocat obligatoire). En cas d'échec, l'affaire passe en jugement. Pour les rappels de salaire, la procédure dure en moyenne 12 à 18 mois. Le CPH peut condamner l'employeur à payer les sommes dues + intérêts légaux." },
  { q: "Puis-je faire une réclamation si je ne suis plus dans l'entreprise ?", a: "Oui, absolument. La prescription de 3 ans court à partir de la date à laquelle vous auriez dû percevoir les sommes, pas à partir de la fin de contrat. Un salarié qui a quitté l'entreprise en 2024 peut encore réclamer des rappels sur ses bulletins de 2021, 2022 et 2023. Le fait d'avoir signé un solde de tout compte ne vous prive pas de ce droit si vous avez dénoncé le reçu dans les 6 mois." },
  { q: "Récupéo peut-il m'aider si je suis encore en poste ?", a: "Oui, et c'est même le meilleur moment d'agir. Vous avez accès à tous vos bulletins, vous connaissez votre situation, et une rectification amiable est plus facile à obtenir. Notre analyse détecte les anomalies chiffrées et génère une lettre LRAR prête à envoyer. Beaucoup d'employeurs corrigent discrètement l'erreur sans que ça ne devienne conflictuel — c'est le meilleur scénario pour tout le monde." },
  { q: "Combien peut-on récupérer en moyenne ?", a: "Ça dépend du type d'anomalie et de l'ancienneté. Pour les heures supplémentaires non majorées : 500€ à 3 000€ sur 3 ans est courant. Pour un minimum conventionnel non respecté, les rappels peuvent dépasser 5 000€. Dans les cas les plus graves (longue durée, multiple anomalies), certains dossiers dépassent 10 000€. Le seul moyen de le savoir précisément, c'est d'analyser vos bulletins." },
]

export function MapaieFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-16 bg-slate-bg">
      <div className="max-w-[680px] mx-auto px-6">
        <h2 className="font-heading text-[clamp(22px,3.5vw,28px)] font-bold text-slate-text text-center mb-8">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-border overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-text">{faq.q}</span>
                <span className={`text-slate-muted transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-slate-muted leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const MAPAIE_FAQ_DATA = FAQS
