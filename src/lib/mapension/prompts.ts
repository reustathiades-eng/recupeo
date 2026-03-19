// ============================================================
// MAPENSION — Prompts Claude (courriers de réclamation)
// ============================================================
import type { MapensionFormData, MapensionCalculations } from './types'
import { INDEX_LABELS } from './indices'
import { fmt } from '@/lib/format'

export const fullReportSystemPrompt = `Tu es un expert en droit de la famille français, spécialisé dans les pensions alimentaires et leur indexation sur les indices INSEE.

Tu reçois les données d'un calcul de revalorisation de pension alimentaire. Tu dois rédiger un rapport clair et pédagogique.

STRUCTURE DU RAPPORT (5 sections) :
1. "Synthèse" — Résumé en 3-4 lignes
2. "Le mécanisme d'indexation" — Explication simple : clause du jugement, formule INSEE
3. "Calcul détaillé" — Texte qui accompagne le tableau année par année
4. "Vos droits" — Prescription 5 ans, pas besoin de nouveau jugement, procédures possibles
5. "Prochaines étapes" — Guide pratique

TON : Bienveillant, factuel, jamais accusateur. Neutre juridiquement.
- Vouvoiement
- Ne reproduis PAS le tableau de calcul dans le texte
- Cite les articles de loi (art. 2224 Code civil)
- Mentionne l'ARIPA comme recours

Réponds UNIQUEMENT en JSON :
{
  "sections": [
    { "id": "synthese", "title": "Synthèse", "content": "..." },
    { "id": "mecanisme", "title": "Le mécanisme d'indexation", "content": "..." },
    { "id": "calcul", "title": "Calcul détaillé", "content": "..." },
    { "id": "droits", "title": "Vos droits", "content": "..." },
    { "id": "etapes", "title": "Prochaines étapes", "content": "..." }
  ]
}`

export const lettersSystemPrompt = `Tu es un expert en droit de la famille français. Tu rédiges des courriers pour un parent qui réclame la revalorisation de sa pension alimentaire et le paiement des arriérés.

COURRIER 1 — RÉCLAMATION AMIABLE
- Ton cordial mais ferme
- Rappel de la clause d'indexation du jugement
- Présentation claire du calcul (formule + résultat)
- Demande de règlement des arriérés + application du nouveau montant
- Délai : 15 jours

COURRIER 2 — MISE EN DEMEURE (LRAR)
- Ton plus formel
- Rappel du premier courrier resté sans réponse
- Mention des voies de recours (commissaire de justice, paiement direct, ARIPA)
- Mention de la prescription quinquennale (art. 2224 Code civil)
- Délai : 8 jours

GUIDE ARIPA — Comment saisir l'ARIPA (caf.fr)
GUIDE PROCÉDURE — Étapes complètes (amiable → mise en demeure → huissier → ARIPA → JAF)

IMPORTANT :
- Vouvoiement
- Laisse des [____] pour les champs à remplir
- Ne mentionne JAMAIS de noms réels

Réponds UNIQUEMENT en JSON :
{
  "reclamation_amiable": "texte complet",
  "mise_en_demeure": "texte complet",
  "guide_aripa": "guide ARIPA",
  "guide_procedure": "guide étape par étape"
}`

export function buildFullReportMessage(data: MapensionFormData, calc: MapensionCalculations): string {
  const indexLabel = INDEX_LABELS[data.indexType]
  const roleLabel = data.userRole === 'creditor' ? 'le parent qui reçoit la pension' : 'le parent qui verse la pension'

  const arrearsTable = calc.arrearsByYear.map(a =>
    `${a.year} | Indice ${a.indexDate}: ${a.indexValue} | Dû: ${fmt(a.amountDue)}€/mois | Payé: ${fmt(a.amountPaid)}€/mois | Écart: ${fmt(a.monthlyGap)}€ × ${a.monthsInYear} mois = ${fmt(a.yearlyArrear)}€`
  ).join('\n')

  return `Données du calcul de revalorisation :

- Rôle : ${roleLabel}
- Pension initiale : ${fmt(data.initialAmount)}€/mois (jugement du ${data.judgmentDate})
- ${data.childrenCount} enfant(s)
- Indice : ${indexLabel}
- Indice de référence : ${calc.referenceIndexValue} (${calc.referenceIndexDate})
- Dernier indice : ${calc.currentIndexValue} (${calc.currentIndexDate})
- Pension revalorisée : ${fmt(calc.currentRevaluedAmount)}€/mois (+${calc.revaluationPct}%)
- Montant versé : ${fmt(data.currentAmountPaid)}€/mois
- Écart mensuel : ${fmt(calc.monthlyGap)}€
- ARIPA : ${data.usesARIPA}
- Déjà revalorisée : ${data.alreadyRevalued}

Arriérés année par année :
${arrearsTable || 'Aucun arriéré'}

Total arriérés : ${fmt(calc.totalArrears)}€
Prescription : arriérés avant le ${calc.prescriptionDate} prescrits.

Rédige le rapport en JSON.`
}

export function buildLettersMessage(data: MapensionFormData, calc: MapensionCalculations): string {
  const indexLabel = INDEX_LABELS[data.indexType]

  return `Données pour les courriers :

- Pension initiale : ${fmt(data.initialAmount)}€/mois (${data.judgmentDate})
- ${data.childrenCount} enfant(s)
- Indice : ${indexLabel}
- Référence : ${calc.referenceIndexValue} (${calc.referenceIndexDate})
- Actuel : ${calc.currentIndexValue} (${calc.currentIndexDate})
- Revalorisée : ${fmt(calc.currentRevaluedAmount)}€/mois
- Versé : ${fmt(data.currentAmountPaid)}€/mois
- Écart : ${fmt(calc.monthlyGap)}€/mois
- Arriérés : ${fmt(calc.totalArrears)}€ sur ${calc.arrearsYears} année(s)

Rédige les 4 documents en JSON.`
}
