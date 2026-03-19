'use client'
import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'Comment savoir si ma pension est bien calculée ?',
    a: "Le meilleur moyen est de vérifier votre Relevé Individuel de Situation (RIS) sur info-retraite.fr. Ce document récapitule tous vos trimestres et salaires déclarés. Notre outil analyse ensuite ces données pour détecter les anomalies fréquentes : trimestres oubliés, majorations non appliquées, décote erronée, etc.",
  },
  {
    q: 'Quelles sont les erreurs les plus fréquentes sur les pensions ?',
    a: "D'après la Cour des Comptes, les erreurs les plus courantes sont : les trimestres cotisés non reportés (emplois saisonniers, CDD courts), le service militaire non comptabilisé, les périodes de chômage ou maladie oubliées, la majoration pour enfants non appliquée (+10% pour 3 enfants ou plus), et le minimum contributif non versé.",
  },
  {
    q: 'Où trouver mon relevé de carrière (RIS) ?',
    a: "Rendez-vous sur info-retraite.fr avec votre identité numérique (FranceConnect). Dans la rubrique 'Ma carrière', vous trouverez votre RIS détaillé avec tous vos trimestres et salaires année par année. Vous pouvez aussi le demander par courrier à votre CARSAT.",
  },
  {
    q: 'Le service militaire compte-t-il pour la retraite ?',
    a: "Oui ! Chaque période de 90 jours de service national donne droit à 1 trimestre assimilé. Un service de 12 mois = 4 trimestres. Mais ces trimestres ne sont pas toujours reportés automatiquement : il faut souvent en faire la demande avec votre état signalétique et des services (ESS).",
  },
  {
    q: 'Comment contester le montant de ma pension ?',
    a: "La procédure se fait en 4 étapes : 1) Vérifiez votre RIS sur info-retraite.fr. 2) Adressez une demande de révision à votre CARSAT par lettre recommandée. 3) Si refus, saisissez la Commission de Recours Amiable (CRA) sous 2 mois. 4) En dernier recours, saisissez le Médiateur de l'Assurance Retraite ou le tribunal judiciaire.",
  },
  {
    q: "Qu'est-ce que la majoration pour enfants ?",
    a: "Si vous avez élevé au moins 3 enfants, votre pension de base CNAV est majorée de 10%. L'Agirc-Arrco accorde aussi une majoration : +10% pour 3 enfants (plafonné). Cette majoration n'est pas toujours appliquée automatiquement et constitue l'une des erreurs les plus fréquentes.",
  },
  {
    q: 'Comment sont calculées les 25 meilleures années ?',
    a: "La pension de base CNAV est calculée sur le Salaire Annuel Moyen (SAM) de vos 25 meilleures années de revenus. Ces salaires sont revalorisés par des coefficients officiels avant le calcul. Si certains salaires sont manquants ou sous-déclarés sur votre relevé, votre SAM est minoré et votre pension aussi.",
  },
  {
    q: "Qu'est-ce que la décote ?",
    a: "Si vous partez en retraite sans avoir tous vos trimestres, une décote (réduction) est appliquée : -0,625% par trimestre manquant, soit -1,25% par an. La décote est plafonnée à 20 trimestres (soit -12,5%). Elle peut représenter plusieurs centaines d'euros par mois de manque à gagner.",
  },
  {
    q: 'Quel est le délai pour contester ma pension ?',
    a: "Vous pouvez demander une révision de votre pension à tout moment si vous découvrez une erreur de calcul ou un trimestre manquant. Il n'y a pas de prescription pour les erreurs matérielles de la caisse. En revanche, pour les rappels d'arrérages (versements passés), le délai est de 2 ans.",
  },
  {
    q: 'La pension de réversion est-elle automatique ?',
    a: "Non, la pension de réversion n'est jamais versée automatiquement. Il faut en faire la demande auprès de chaque caisse de retraite du conjoint décédé. Conditions : être ou avoir été marié(e), avoir au moins 55 ans, et des ressources inférieures au plafond. Le taux est de 54% de la pension de base du conjoint décédé.",
  },
]

export function RetraitiaFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-[680px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[clamp(24px,4vw,36px)] font-bold text-slate-text mb-3">
            Questions fréquentes
          </h2>
          <p className="text-slate-muted text-base">
            Tout savoir sur votre pension de retraite et vos droits
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-slate-bg rounded-xl border border-slate-border overflow-hidden transition-all">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-slate-text text-sm leading-relaxed">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-muted flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-slate-muted leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
