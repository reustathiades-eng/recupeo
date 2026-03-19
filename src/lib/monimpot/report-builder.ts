// ============================================================
// MONIMPÔT V3 — Assembleur rapport / guide / réclamation (Zero API)
// Remplace 3 appels Claude API par du JS pur
// ============================================================

import type { MonimpotFormData, Optimisation } from './types'
import type { MonimpotCalculations } from './calculations'
import type { AvisImpositionExtracted } from './extract-types'
import { OPTIMISATION_TEMPLATES, type TemplateContext } from './templates'
import { fmt } from '@/lib/format'

// ─── TYPES SORTIE ───

export interface BuiltReport {
  rapport: {
    synthese: string
    analyse_par_poste: Array<{
      poste: string
      situation_actuelle: string
      situation_optimisee: string
      economie: number
      case_a_modifier: string
      reference_cgi: string
    }>
    comparaison_annuelle: string | null
    impot_actuel: number
    impot_optimise: number
    economie_totale: number
    recommandations: string[]
    economie_3ans?: number
  }
}

export interface BuiltGuide {
  guide_correction_en_ligne: {
    introduction: string
    etapes: Array<{
      titre: string
      case_: string
      instructions: string[]
    }>
    rappel_delai: string
  }
}

export interface BuiltReclamation {
  objet: string
  corps: string
  pieces_jointes: string[]
}

// ─── CONSTRUIRE LE CONTEXTE ───

function buildContext(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  extraction?: AvisImpositionExtracted
): TemplateContext {
  return {
    situation: data.situation,
    age: data.age,
    nbParts: data.nbParts,
    revenuNetImposable: data.revenuNetImposable,
    impotPaye: data.impotPaye,
    calc,
    annee: extraction?.annee || new Date().getFullYear() - 1,
    numeroFiscal: extraction?.numeroFiscal,
    numeroAvis: extraction?.numeroAvis,
    adresseCentre: extraction?.adresseCentre,
  }
}

// ─── 1. ASSEMBLEUR RAPPORT COMPLET ───

export function buildReport(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  optimisations: Optimisation[],
  extraction?: AvisImpositionExtracted,
  multiAvis?: AvisImpositionExtracted[]
): BuiltReport {
  const ctx = buildContext(data, calc, extraction)

  // Synthèse adaptée
  const synthese = buildSynthese(data, calc, optimisations, extraction, multiAvis)

  // Analyse par poste
  const analyse_par_poste = optimisations.map(o => {
    const template = OPTIMISATION_TEMPLATES[o.type]
    if (!template) {
      return {
        poste: o.label,
        situation_actuelle: o.description,
        situation_optimisee: `Économie potentielle : ${fmt(o.economie)}€`,
        economie: o.economie,
        case_a_modifier: o.caseConcernee || 'N/A',
        reference_cgi: 'N/A',
      }
    }
    return {
      poste: o.label,
      situation_actuelle: template.rapport.situationActuelle(o, ctx),
      situation_optimisee: template.rapport.situationOptimisee(o, ctx),
      economie: o.economie,
      case_a_modifier: template.guide.caseAModifier,
      reference_cgi: template.rapport.referenceCGI,
    }
  })

  // Comparaison annuelle
  let comparaison_annuelle: string | null = null
  if (multiAvis && multiAvis.length >= 2) {
    const sorted = [...multiAvis].sort((a, b) => b.annee - a.annee)
    comparaison_annuelle = `Évolution sur ${sorted.length} années :\n` +
      sorted.map(a => `• ${a.annee} : impôt ${fmt(a.impotNet)}€, RFR ${fmt(a.rfr)}€`).join('\n')
    const casesPerduees = optimisations.filter(o => o.type === 'case_perdue')
    if (casesPerduees.length > 0) {
      comparaison_annuelle += `\n\n⚠️ ${casesPerduees.length} case(s) renseignée(s) les années précédentes mais absente(s) cette année.`
    }
  }

  // Recommandations
  const recommandations = buildRecommandations(data, optimisations, calc)

  // Économie = somme des optimisations individuelles, plafonnée par l'impôt payé
  const ecoFromOpts = optimisations.reduce((s, o) => s + o.economie, 0)
  const impotPaye = data.impotPaye ?? 0
  const economie_totale = Math.min(ecoFromOpts, impotPaye)
  const impot_optimise = Math.max(0, impotPaye - economie_totale)

  return {
    rapport: {
      synthese,
      analyse_par_poste,
      comparaison_annuelle,
      impot_actuel: impotPaye,
      impot_optimise,
      economie_totale,
      economie_3ans: economie_totale * 3,
      recommandations,
    },
  }
}

// ─── 2. ASSEMBLEUR GUIDE CORRECTION ───

export function buildCorrectionGuide(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  optimisations: Optimisation[],
  extraction?: AvisImpositionExtracted
): BuiltGuide {
  const ctx = buildContext(data, calc, extraction)
  const annee = extraction?.annee || new Date().getFullYear() - 1

  const etapes = optimisations
    .filter(o => OPTIMISATION_TEMPLATES[o.type])
    .map(o => {
      const t = OPTIMISATION_TEMPLATES[o.type]!
      return {
        titre: t.guide.titre,
        case_: t.guide.caseAModifier,
        instructions: t.guide.etapes(o, ctx),
      }
    })

  // Vérifier si la correction en ligne est encore ouverte
  const now = new Date()
  const moisCourant = now.getMonth() + 1
  const anneeCourante = now.getFullYear()
  const correctionOuverte = (anneeCourante === annee + 1 && moisCourant >= 8 && moisCourant <= 12) ||
    (anneeCourante === annee + 2 && moisCourant <= 3)

  const introduction = correctionOuverte
    ? `La correction en ligne de votre déclaration ${annee} est actuellement ouverte sur impots.gouv.fr. Vous pouvez modifier directement les cases concernées sans envoyer de courrier.`
    : `La période de correction en ligne pour la déclaration ${annee} est terminée. Vous devez déposer une réclamation contentieuse (voir modèle de lettre ci-dessous).`

  const rappel_delai = `Rappel : vous pouvez réclamer jusqu'au 31 décembre de la 2ème année suivant la mise en recouvrement (article R*196-1 du LPF). Pour les revenus ${annee}, la date limite est le 31 décembre ${annee + 3}.`

  return {
    guide_correction_en_ligne: {
      introduction,
      etapes,
      rappel_delai,
    },
  }
}

// ─── 3. ASSEMBLEUR RÉCLAMATION ───

export function buildReclamationLetter(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  optimisations: Optimisation[],
  sensitiveData?: { numeroFiscal?: string; numeroAvis?: string; adresseCentre?: string },
  extraction?: AvisImpositionExtracted
): BuiltReclamation {
  const ctx = buildContext(data, calc, extraction)
  const annee = ctx.annee

  const nf = sensitiveData?.numeroFiscal || extraction?.numeroFiscal || '[VOTRE N° FISCAL]'
  const na = sensitiveData?.numeroAvis || extraction?.numeroAvis || '[N° AVIS]'
  const adresse = sensitiveData?.adresseCentre || extraction?.adresseCentre || '[ADRESSE DE VOTRE CENTRE DES IMPÔTS]'

  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  // Collecter tous les articles juridiques
  const articlesSet = new Set<string>()
  articlesSet.add('Article R*196-1 du Livre des Procédures Fiscales')
  for (const o of optimisations) {
    const t = OPTIMISATION_TEMPLATES[o.type]
    if (t) t.reclamation.articlesJuridiques.forEach(a => articlesSet.add(a))
  }

  // Construire les argumentaires
  const argumentaires = optimisations.map((o, i) => {
    const t = OPTIMISATION_TEMPLATES[o.type]
    const arg = t
      ? t.reclamation.argumentaire(o, ctx)
      : `${o.description} Économie estimée : ${fmt(o.economie)}€.`
    return `${i + 1}. ${arg}`
  }).join('\n\n')

  const totalEco = optimisations.reduce((sum, o) => sum + o.economie, 0)

  const objet = `Réclamation contentieuse — Impôt sur le revenu ${annee} — Demande de dégrèvement`

  const corps = `${adresse}

[Vos nom et prénom]
[Votre adresse]
[VILLE]

N° fiscal : ${nf}
N° d'avis : ${na}

A [VILLE], le ${date}

Objet : ${objet}

Madame, Monsieur,

J'ai l'honneur de porter à votre connaissance une réclamation contentieuse relative à mon imposition sur les revenus de l'année ${annee}, en application de l'article R*196-1 du Livre des Procédures Fiscales.

Après analyse de mon avis d'imposition, je constate que plusieurs éléments n'ont pas été correctement pris en compte dans le calcul de mon impôt :

${argumentaires}

Au total, le dégrèvement demandé s'élève à ${fmt(totalEco)}€.

Références juridiques applicables :
${Array.from(articlesSet).map(a => `— ${a}`).join('\n')}

Je vous prie de bien vouloir procéder à la rectification de mon imposition et au remboursement du trop-perçu.

Je joins à la présente les pièces justificatives suivantes :
— Copie de mon avis d'imposition ${annee}
— Justificatifs des dépenses/situations mentionnées ci-dessus

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Signature]

P.J. : voir liste ci-dessus`

  const pieces_jointes = [
    `Avis d'imposition ${annee}`,
    ...optimisations.map(o => {
      switch (o.type) {
        case 'frais_reels': return 'Carte grise, attestation employeur distance, tickets péage'
        case 'dons_oublies': return 'Reçus fiscaux des associations'
        case 'emploi_domicile': return 'Attestation URSSAF / CESU'
        case 'garde_enfant': return 'Attestation de la crèche/assistante maternelle'
        case 'pension_alimentaire': return 'Jugement de divorce, relevés bancaires des virements'
        case 'ehpad': return "Attestation fiscale de l'EHPAD"
        case 'per_deduction': return "Attestation de l'organisme gestionnaire du PER"
        default: return `Justificatif ${o.label}`
      }
    }),
  ]

  return { objet, corps, pieces_jointes: [...new Set(pieces_jointes)] }
}

// ─── HELPERS INTERNES ───

function buildSynthese(
  data: MonimpotFormData,
  calc: MonimpotCalculations,
  optimisations: Optimisation[],
  extraction?: AvisImpositionExtracted,
  multiAvis?: AvisImpositionExtracted[]
): string {
  // Économie = somme des optimisations (pas du barème, qui peut être incohérent)
  const ecoSynth = Math.min(
    optimisations.reduce((s, o) => s + o.economie, 0),
    data.impotPaye ?? 0
  )
  const eco = ecoSynth
  const nbOpts = optimisations.length

  if (nbOpts === 0 || eco === 0) {
    return `Bonne nouvelle : votre déclaration de revenus semble bien optimisée. Notre analyse n'a pas détecté d'économie significative. Continuez à vérifier chaque année que toutes les cases pertinentes sont renseignées.`
  }

  const source = extraction
    ? `Après analyse de votre avis d'imposition ${extraction.annee}`
    : 'Après analyse de vos informations déclaratives'

  const multiNote = multiAvis && multiAvis.length >= 2
    ? ` Nous avons également comparé vos ${multiAvis.length} dernières déclarations pour détecter d'éventuels oublis.`
    : ''

  const principalesOpts = optimisations.slice(0, 3).map(o => o.label).join(', ')

  if (eco < 100) {
    return `${source}, nous avons identifié ${nbOpts} piste(s) d'optimisation pour un gain estimé de ${fmt(eco)}€ par an.${multiNote} Les optimisations portent principalement sur : ${principalesOpts}. Bien que le montant soit modeste, chaque euro compte.`
  }

  if (eco < 500) {
    return `${source}, nous avons identifié ${nbOpts} optimisation(s) fiscale(s) permettant de réduire votre impôt d'environ ${fmt(eco)}€ par an.${multiNote} Les principales pistes sont : ${principalesOpts}. Nous vous recommandons de corriger votre déclaration ou de déposer une réclamation.`
  }

  return `${source}, notre audit révèle ${nbOpts} optimisation(s) majeure(s) pour une économie estimée de ${fmt(eco)}€ par an, soit ${fmt(calc.economie3ans)}€ sur 3 ans.${multiNote} Les leviers identifiés sont : ${principalesOpts}. Nous vous recommandons vivement d'agir rapidement pour récupérer ce trop-versé.`
}

function buildRecommandations(
  data: MonimpotFormData,
  optimisations: Optimisation[],
  calc: MonimpotCalculations
): string[] {
  const recs: string[] = []

  // Recommandation principale
  if (calc.economieAnnuelle > 0) {
    const now = new Date()
    const annee = now.getFullYear() - 1
    const correctionPossible = now.getMonth() + 1 >= 8 && now.getMonth() + 1 <= 12
    if (correctionPossible) {
      recs.push(`Corrigez votre déclaration ${annee} en ligne sur impots.gouv.fr dès maintenant (la correction est ouverte jusqu'en décembre).`)
    } else {
      recs.push(`Déposez une réclamation contentieuse auprès de votre centre des impôts (le modèle de lettre est fourni ci-dessus).`)
    }
  }

  // Recommandations par type
  const hasTypeHaute = optimisations.some(o => o.priorite === 'haute')
  if (hasTypeHaute) {
    recs.push('Traitez en priorité les optimisations marquées "haute priorité" — elles représentent le plus gros gain.')
  }

  // Conseils généraux
  if (data.age >= 60) {
    recs.push('Vérifiez chaque année que l\'abattement seniors est correctement appliqué sur votre avis.')
  }

  if (data.enfantsMineurs > 0) {
    recs.push('Pensez à déclarer les frais de garde et de scolarité chaque année (collège 61€, lycée 153€, supérieur 183€ par enfant).')
  }

  recs.push('Conservez tous vos justificatifs pendant 3 ans minimum (délai de contrôle fiscal).')
  recs.push('L\'année prochaine, utilisez RÉCUPÉO dès réception de votre avis pour ne rien oublier.')

  return recs
}
