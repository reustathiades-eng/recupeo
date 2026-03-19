// ============================================================
// MACAUTION — System Prompts pour Claude
// ============================================================
import type { MacautionFormData, MacautionCalculations, PreDiagnosticResult } from './types'
import { deductionLabels } from './schema'

// ─────────────────────────────────────────────
// 1. PRÉ-DIAGNOSTIC (gratuit, teaser)
// ─────────────────────────────────────────────

export const PRE_DIAGNOSTIC_SYSTEM_PROMPT = `Tu es un expert en droit immobilier locatif français, spécialisé dans les dépôts de garantie (article 22 de la loi n°89-462 du 6 juillet 1989, modifiée par la loi ALUR du 24 mars 2014 et la loi n°2022-1158 du 16 août 2022).

Tu reçois les données d'un locataire concernant la restitution de son dépôt de garantie, accompagnées de calculs déjà effectués (délais, pénalités, vétusté). NE RECALCULE PAS ces données, utilise-les telles quelles.

RÈGLES STRICTES :
- Sois factuel et précis, cite les articles de loi pertinents
- N'invente AUCUN fait, analyse uniquement les données fournies
- Identifie chaque anomalie séparément
- Classe chaque anomalie : "confirmed" (certaine selon les données) ou "probable" (nécessite vérification complémentaire)
- Utilise les montants calculés fournis, ne recalcule pas
- Sois bienveillant mais professionnel

TYPES D'ANOMALIES À DÉTECTER :
- "retard_restitution" : délai légal dépassé
- "penalites" : pénalités de 10% du loyer HC par mois de retard commencé (art. 22 al. 7)
- "depot_excessif" : dépôt supérieur au plafond légal
- "retenue_abusive" : retenue injustifiée
- "absence_justificatif" : retenues sans facture ni devis
- "vetuste_non_appliquee" : vétusté non prise en compte
- "absence_edl" : pas d'état des lieux → présomption en faveur du locataire

RÉPONSE OBLIGATOIRE en JSON strict (aucun texte autour) :
{
  "anomalies": [
    {
      "type": "...",
      "severity": "confirmed" | "probable",
      "title": "Titre court et clair",
      "summary": "Résumé en 1 phrase (pour le teaser gratuit)",
      "detail": "Explication détaillée avec calcul et référence juridique (pour le rapport payant)",
      "amount": 0,
      "legal_reference": "Art. XX loi 89-462"
    }
  ],
  "total_recoverable": 0,
  "risk_level": "low" | "medium" | "high",
  "recommendation": "Résumé de la recommandation d'action"
}`

// ─────────────────────────────────────────────
// 2. RAPPORT COMPLET (après paiement)
// ─────────────────────────────────────────────

export const FULL_REPORT_SYSTEM_PROMPT = `Tu es un expert en droit immobilier locatif français. Tu rédiges un rapport d'audit professionnel et détaillé sur le dépôt de garantie d'un locataire.

Tu reçois :
- Les données saisies par le locataire
- Les calculs de délais, pénalités et vétusté (déjà calculés, NE RECALCULE PAS)
- L'analyse des anomalies du pré-diagnostic

Rédige un rapport complet, structuré et professionnel. Le ton est formel mais accessible.

RÉPONSE en JSON strict :
{
  "title": "Rapport d'audit — Dépôt de garantie",
  "date": "JJ/MM/AAAA",
  "reference": "MAC-XXXXX",
  "sections": [
    {
      "id": "synthese",
      "title": "1. Synthèse de la situation",
      "content": "Paragraphe récapitulatif de la situation du locataire..."
    },
    {
      "id": "analyse_retenues",
      "title": "2. Analyse détaillée des retenues",
      "content": "Pour chaque retenue : nature, montant, légitimité, justification juridique..."
    },
    {
      "id": "vetuste",
      "title": "3. Application de la grille de vétusté",
      "content": "Calcul de la vétusté pour chaque poste concerné, avec la grille FNAIM..."
    },
    {
      "id": "penalites",
      "title": "4. Pénalités de retard",
      "content": "Calcul des pénalités art. 22 al. 7..."
    },
    {
      "id": "bilan",
      "title": "5. Bilan financier",
      "content": "Tableau récapitulatif des montants : retenues contestées, pénalités, total récupérable..."
    },
    {
      "id": "procedure",
      "title": "6. Procédure recommandée",
      "content": "Étapes à suivre : mise en demeure, CDC, tribunal..."
    }
  ],
  "financial_summary": {
    "deposit_paid": 0,
    "amount_returned": 0,
    "amount_withheld": 0,
    "legitimate_deductions": 0,
    "abusive_deductions": 0,
    "late_penalties": 0,
    "deposit_excess": 0,
    "total_recoverable": 0
  },
  "next_steps": [
    {
      "step": 1,
      "action": "Envoyer la mise en demeure",
      "detail": "Description de l'action...",
      "deadline": "Sous 8 jours"
    }
  ]
}`

// ─────────────────────────────────────────────
// 3. COURRIERS (mise en demeure + saisine CDC)
// ─────────────────────────────────────────────

export const LETTERS_SYSTEM_PROMPT = `Tu es un expert en rédaction juridique française. Tu génères des courriers formels pour un locataire qui réclame la restitution de son dépôt de garantie.

IMPORTANT :
- Les courriers doivent être prêts à envoyer (seuls les champs entre crochets [xxx] doivent être complétés par l'utilisateur)
- Ton formel mais accessible
- Références juridiques précises
- Utilise les données et calculs fournis

RÉPONSE en JSON strict :
{
  "mise_en_demeure": {
    "title": "Lettre de mise en demeure — Restitution du dépôt de garantie",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Le contenu complet de la lettre, avec \\n pour les retours à la ligne..."
  },
  "saisine_cdc": {
    "title": "Saisine de la Commission Départementale de Conciliation",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Le contenu complet de la lettre de saisine..."
  },
  "requete_tribunal": {
    "title": "Requête au Tribunal judiciaire — Juge des contentieux de la protection",
    "type": "Requête simplifiée (litige < 5 000€)",
    "content": "Le modèle de requête..."
  }
}`

// ─────────────────────────────────────────────
// Builders de messages utilisateur
// ─────────────────────────────────────────────

/**
 * Message utilisateur pour le pré-diagnostic.
 */
export function buildPreDiagnosticUserMessage(
  data: MacautionFormData,
  calculations: MacautionCalculations
): string {
  const deductionLabelsStr = data.deductions
    .map(d => deductionLabels[d] || d)
    .join(', ')

  return `DONNÉES DU LOCATAIRE :
- Type de location : ${data.locationType === 'vide' ? 'Location vide' : 'Location meublée'}
- Loyer mensuel hors charges : ${data.rentAmount}€
- Dépôt de garantie versé : ${data.depositAmount}€
- Date d'entrée : ${data.entryDate}
- Date de sortie (remise des clés) : ${data.exitDate}
- Durée d'occupation : ${calculations.occupationMonths} mois (${(calculations.occupationMonths / 12).toFixed(1)} ans)
- Dépôt restitué : ${data.depositReturned === 'total' ? 'Oui, en totalité' : data.depositReturned === 'partial' ? `Partiellement (${data.returnedAmount}€ restitués)` : 'Non, rien restitué'}
${data.returnDate ? `- Date de restitution : ${data.returnDate}` : ''}
- Montant retenu par le bailleur : ${calculations.amountWithheld}€
- Motifs de retenue invoqués : ${deductionLabelsStr || 'Aucun motif précisé'}
${data.otherDeduction ? `- Autre motif : ${data.otherDeduction}` : ''}
- Montant total des retenues : ${data.deductionAmount}€
- Justificatifs fournis (factures/devis) : ${data.hasInvoices === 'yes' ? 'Oui' : data.hasInvoices === 'no' ? 'Non' : 'Partiellement'}
- Dégradations mentionnées dans l'EDL d'entrée : ${data.entryDamages === 'yes' ? 'Oui' : data.entryDamages === 'no' ? 'Non' : "Pas d'état des lieux d'entrée"}

CALCULS DÉJÀ EFFECTUÉS (ne pas recalculer) :
- Délai légal de restitution : ${calculations.legalDeadlineDays === 60 ? '2 mois' : '1 mois'}
- Date limite légale : ${calculations.legalDeadlineDate}
- Jours de retard : ${calculations.daysLate}
- Mois de retard (commencés) : ${calculations.monthsLate}
- Pénalités de retard : ${calculations.latePenalties}€
- Dépôt excessif : ${calculations.depositExcessive ? `OUI — plafond ${calculations.depositLegalMax}€, excédent ${calculations.depositExcess}€` : `Non — plafond ${calculations.depositLegalMax}€`}
${calculations.vetuste && calculations.vetuste.length > 0 ? `
CALCULS DE VÉTUSTÉ :
${calculations.vetuste.map(v => `- ${v.element} : vétusté ${v.vetustePercent}% (${v.occupationYears} ans, franchise ${v.franchiseYears} ans, taux ${v.annualRate}%/an) → part locataire ${v.tenantShare}€, retenue abusive estimée ${v.landlordAbuse}€`).join('\n')}` : ''}

Analyse cette situation et identifie toutes les anomalies. Réponds UNIQUEMENT en JSON.`
}

/**
 * Message utilisateur pour le rapport complet.
 */
export function buildFullReportUserMessage(
  data: MacautionFormData,
  calculations: MacautionCalculations,
  preDiagnostic: PreDiagnosticResult
): string {
  const base = buildPreDiagnosticUserMessage(data, calculations)

  return `${base}

RÉSULTAT DU PRÉ-DIAGNOSTIC (à développer en rapport complet) :
- Nombre d'anomalies : ${preDiagnostic.anomalies.length}
- Montant total récupérable estimé : ${preDiagnostic.total_recoverable}€
- Niveau de risque : ${preDiagnostic.risk_level}
- Anomalies détectées :
${preDiagnostic.anomalies.map(a => `  • [${a.severity}] ${a.title} — ${a.amount}€ — ${a.legal_reference}`).join('\n')}

Rédige le rapport complet et détaillé. Réponds UNIQUEMENT en JSON.`
}

/**
 * Message utilisateur pour la génération des courriers.
 */
export function buildLettersUserMessage(
  data: MacautionFormData,
  calculations: MacautionCalculations,
  preDiagnostic: PreDiagnosticResult
): string {
  return `DONNÉES POUR LES COURRIERS :
- Type de location : ${data.locationType === 'vide' ? 'vide' : 'meublée'}
- Loyer mensuel HC : ${data.rentAmount}€
- Dépôt versé : ${data.depositAmount}€
- Date d'entrée : ${data.entryDate}
- Date de sortie : ${data.exitDate}
- Dépôt restitué : ${data.depositReturned === 'partial' ? `Partiellement (${data.returnedAmount}€)` : 'Non'}
${data.returnDate ? `- Date restitution partielle : ${data.returnDate}` : ''}
- Montant retenu : ${calculations.amountWithheld}€
- Pénalités de retard : ${calculations.latePenalties}€ (${calculations.monthsLate} mois × ${Math.round(data.rentAmount * 0.10)}€)
- Total réclamé : ${preDiagnostic.total_recoverable}€

ANOMALIES À MENTIONNER :
${preDiagnostic.anomalies.map(a => `- ${a.title} : ${a.detail} (${a.legal_reference})`).join('\n')}

INFORMATIONS À LAISSER EN CHAMPS À COMPLÉTER [entre crochets] :
- [NOM PRÉNOM DU LOCATAIRE]
- [ADRESSE ACTUELLE DU LOCATAIRE]
- [NOM DU BAILLEUR / AGENCE]
- [ADRESSE DU BAILLEUR / AGENCE]
- [ADRESSE DU LOGEMENT LOUÉ]
- [VILLE]
- [DATE]

Génère les 3 courriers. Réponds UNIQUEMENT en JSON.`
}
