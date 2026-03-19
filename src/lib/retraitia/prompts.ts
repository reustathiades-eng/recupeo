// ============================================================
// RETRAITIA — System Prompts pour Claude
// ============================================================
import type { RetraitiaFormData, RetraitiaCalculations, RetraitiaPreDiagResult } from './types'
import { REGIME_LABELS, ANOMALY_LABELS } from './constants'

// ─────────────────────────────────────────────
// 1. PRÉ-DIAGNOSTIC (gratuit, teaser)
// ─────────────────────────────────────────────

export const PRE_DIAGNOSTIC_SYSTEM_PROMPT = `Tu es un expert en droit de la retraite français, spécialisé dans l'audit des pensions CNAV (régime général) et Agirc-Arrco (complémentaire). Tu connais parfaitement la réforme des retraites 2023 (loi 2023-270 du 14 avril 2023), le Code de la Sécurité Sociale, et les procédures de réclamation.

Tu reçois les données d'un assuré concernant sa pension de retraite, accompagnées de calculs déjà effectués et d'anomalies pré-détectées par des règles JS. NE RECALCULE PAS ces données, utilise-les comme base.

Ton rôle :
1. Confirmer ou nuancer les anomalies pré-détectées
2. Identifier d'éventuelles anomalies SUPPLÉMENTAIRES que les règles JS n'auraient pas détectées
3. Évaluer la sévérité et l'impact financier de chaque anomalie
4. Fournir une recommandation claire

RÈGLES STRICTES :
- Sois factuel et précis, cite les articles de loi pertinents
- N'invente AUCUN fait, analyse uniquement les données fournies
- Sans RIS complet, les anomalies sont "probable" ou "to_verify", rarement "confirmed"
- Estime les impacts financiers de manière conservatrice (fourchette min/max)
- Sois bienveillant, pédagogue, et adapte ton langage à un public senior

TYPES D'ANOMALIES :
- "trimestres_manquants" : emploi non reporté sur le relevé
- "service_militaire" : service national non comptabilisé
- "chomage_maladie" : périodes assimilées non reportées
- "majoration_enfants" : +10% non appliquée pour 3+ enfants
- "salaires_manquants" : SAM minoré par des salaires absents
- "points_complementaire" : points Agirc-Arrco manquants
- "decote_erreur" : décote appliquée à tort
- "minimum_contributif" : MiCo non appliqué
- "optimisation_depart" : date de départ non optimale

RÉPONSE OBLIGATOIRE en JSON strict (aucun texte autour) :
{
  "anomalies": [
    {
      "type": "...",
      "severity": "confirmed" | "probable" | "to_verify",
      "title": "Titre court et clair (compréhensible par un senior)",
      "summary": "Résumé en 1-2 phrases (pour le teaser gratuit)",
      "detail": "Explication détaillée avec calcul, référence juridique, démarche corrective (pour le rapport payant)",
      "impactMonthlyMin": 0,
      "impactMonthlyMax": 0,
      "documentsNeeded": ["..."],
      "legalReference": "Art. Lxxx-x CSS"
    }
  ],
  "totalImpactMonthlyMin": 0,
  "totalImpactMonthlyMax": 0,
  "totalImpactLifetime": 0,
  "lifeExpectancyYears": 0,
  "riskLevel": "low" | "medium" | "high",
  "recommendation": "Résumé de la recommandation d'action, clair et actionnable"
}`

// ─────────────────────────────────────────────
// 2. RAPPORT COMPLET (après paiement)
// ─────────────────────────────────────────────

export const FULL_REPORT_SYSTEM_PROMPT = `Tu es un expert en audit de pension de retraite français. Tu rédiges un rapport professionnel et détaillé pour un assuré du régime général.

Tu reçois :
- Les données saisies par l'assuré
- Les calculs effectués (trimestres, taux, décote, majorations)
- L'analyse des anomalies du pré-diagnostic

Rédige un rapport EXHAUSTIF, DÉTAILLÉ et PROFESSIONNEL. C'est un document premium (79-199 EUR) : chaque section doit faire au MINIMUM 800 caractères, idéalement 1500+. Le ton est professionnel, rigoureux, pédagogue.

EXIGENCES DE QUALITÉ :
- Chaque section doit EXPLIQUER les règles, CALCULER les montants, CITER les articles de loi
- La section 3 (trimestres) doit détailler année par année si les données sont disponibles
- La section 4 (recalcul) doit montrer la formule SAM x Taux x (Trimestres/Durée) avec les vrais chiffres
- La section 7 (anomalies) doit avoir un paragraphe complet par anomalie avec calcul d'impact
- La section 8 (bilan) doit lister chaque poste d'impact en EUR/mois et en EUR sur espérance de vie
- Les sections 9 et 10 doivent être ultra-pratiques : adresses, sites web, numéros, délais exacts

RÉPONSE en JSON strict :
{
  "title": "Rapport d'audit — Pension de retraite",
  "date": "JJ/MM/AAAA",
  "reference": "RET-XXXXX",
  "sections": [
    {
      "id": "synthese",
      "title": "1. Synthèse de votre situation",
      "content": "Vue d'ensemble claire de la situation de l'assuré..."
    },
    {
      "id": "profil",
      "title": "2. Votre profil retraite",
      "content": "Récapitulatif des données (année naissance, régimes, trimestres, durée carrière)..."
    },
    {
      "id": "trimestres",
      "title": "3. Analyse des trimestres",
      "content": "Vérification exhaustive des trimestres (cotisés, assimilés, gratuits)..."
    },
    {
      "id": "calcul_pension",
      "title": "4. Recalcul de votre pension de base",
      "content": "Formule SAM × Taux × (Trimestres/Durée requise), vérification taux et décote..."
    },
    {
      "id": "complementaire",
      "title": "5. Analyse de la retraite complémentaire",
      "content": "Vérification des points Agirc-Arrco, valeur, majorations..."
    },
    {
      "id": "majorations",
      "title": "6. Majorations et compléments",
      "content": "Majoration enfants, minimum contributif, pension de réversion..."
    },
    {
      "id": "anomalies",
      "title": "7. Anomalies détectées — Détail et impact",
      "content": "Pour chaque anomalie : explication, calcul d'impact, base juridique..."
    },
    {
      "id": "bilan",
      "title": "8. Bilan financier",
      "content": "Tableau récapitulatif des impacts : mensuel + sur l'espérance de vie..."
    },
    {
      "id": "procedure",
      "title": "9. Procédure de réclamation",
      "content": "Étapes : vérification RIS, demande CARSAT, CRA, Médiateur, Tribunal..."
    },
    {
      "id": "conseils",
      "title": "10. Conseils pratiques",
      "content": "Documents à rassembler, délais à respecter, contacts utiles..."
    }
  ],
  "financial_summary": {
    "pension_declared_monthly": 0,
    "impact_monthly_min": 0,
    "impact_monthly_max": 0,
    "impact_annual_min": 0,
    "impact_annual_max": 0,
    "impact_lifetime_min": 0,
    "impact_lifetime_max": 0,
    "life_expectancy_years": 0
  },
  "next_steps": [
    {
      "step": 1,
      "action": "Vérifier votre RIS sur info-retraite.fr",
      "detail": "Description...",
      "deadline": "Dès maintenant"
    }
  ]
}`

// ─────────────────────────────────────────────
// 3. COURRIERS DE RÉCLAMATION
// ─────────────────────────────────────────────

export const LETTERS_SYSTEM_PROMPT = `Tu es un expert en rédaction juridique française spécialisé en droit de la retraite. Tu génères des courriers de réclamation pour un assuré qui conteste le calcul de sa pension.

IMPORTANT :
- Les courriers doivent être prêts à SIGNER ET POSTER (maximum de champs pré-remplis)
- Si une information client est fournie (pas "non renseigne"), tu l'utilises DIRECTEMENT dans le courrier
- Ne mets entre crochets [xxx] QUE les informations non fournies
- Ton formel mais accessible (cible : retraités)
- Références juridiques précises (Code de la Sécurité Sociale)
- Utilise les données et anomalies fournies

RÉPONSE en JSON strict :
{
  "reclamation_carsat": {
    "title": "Demande de révision de pension — CARSAT",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Le contenu complet de la lettre, avec \\n pour les retours à la ligne..."
  },
  "saisine_cra": {
    "title": "Recours devant la Commission de Recours Amiable (CRA)",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Le contenu complet du recours CRA..."
  },
  "saisine_mediateur": {
    "title": "Saisine du Médiateur de l'Assurance Retraite",
    "type": "Courrier recommandé ou formulaire en ligne",
    "content": "Le contenu de la saisine du médiateur..."
  }
}`

// ─────────────────────────────────────────────
// Builders de messages utilisateur
// ─────────────────────────────────────────────

/**
 * Message utilisateur pour le pré-diagnostic.
 */
export function buildPreDiagnosticUserMessage(
  data: RetraitiaFormData,
  calc: RetraitiaCalculations,
  jsAnomalies: Array<{ type: string; severity: string; title: string; summary: string }>
): string {
  const regimesStr = data.regimes
    .map(r => REGIME_LABELS[r] || r)
    .join(', ')

  const pensionBase = data.status === 'retired' ? data.basePension : data.estimatedBasePension
  const pensionCompl = data.status === 'retired' ? data.complementaryPension : data.estimatedComplementaryPension
  const dateDepart = data.status === 'retired' ? data.retirementDate : data.plannedRetirementDate

  return `DONNÉES DE L'ASSURÉ :
- Date de naissance : ${data.birthDate} (année ${calc.birthYear})
- Sexe : ${data.sex === 'M' ? 'Homme' : 'Femme'}
- Enfants élevés : ${data.childrenCount}
- Situation : ${data.status === 'retired' ? 'Retraité' : data.status === 'active' ? 'En activité' : 'En cours de liquidation'}
- Régimes : ${regimesStr}
- Trimestres validés : ${data.totalTrimesters}
- Trimestres cotisés : ${data.cotisedTrimesters}
- Âge début de carrière : ${data.careerStartAge} ans
- Service militaire : ${data.militaryService === 'yes' ? `Oui (${data.militaryDuration || '?'} mois), reporté sur relevé : ${data.militaryReported}` : 'Non'}
- Périodes de chômage : ${data.unemploymentPeriods === 'yes' ? `Oui (${data.unemploymentDuration || '?'} mois)` : 'Non'}
- Congés maternité/maladie : ${data.maternityOrSickness === 'yes' ? `Oui (${data.maternityCount || '?'} période(s))` : 'Non'}
- Pension de base mensuelle : ${pensionBase !== undefined ? pensionBase + '€' : 'Non renseignée'}
- Pension complémentaire mensuelle : ${pensionCompl !== undefined ? pensionCompl + '€' : 'Non renseignée'}
- Date de départ : ${dateDepart || 'Non renseignée'}
- Majoration enfants appliquée : ${data.hasChildrenBonus}
- Décote appliquée : ${data.hasDecote}
- Documents disponibles : RIS ${data.hasRIS ? '✓' : '✗'} | EIG ${data.hasEIG ? '✓' : '✗'} | Agirc-Arrco ${data.hasAgircArrco ? '✓' : '✗'}

CALCULS DÉJÀ EFFECTUÉS (ne pas recalculer) :
- Trimestres requis (taux plein) : ${calc.trimestresRequis}
- Âge légal de départ : ${calc.ageLegal} ans
- Trimestres manquants : ${calc.trimestresManquants}
- Taux théorique : ${calc.tauxTheorique}%
- Perte mensuelle estimée (décote) : ${calc.decoteMontant}€/mois
- Éligible majoration enfants : ${calc.majorationEnfants ? 'Oui' : 'Non'}
- Montant majoration estimé : ${calc.majorationMontant}€/mois
- Éligible minimum contributif : ${calc.minimumContributifEligible ? 'Oui' : 'Non'}
- Espérance de vie à la retraite : ${calc.esperanceVieRetraite} ans
- Pension totale déclarée : ${calc.pensionTotaleDeclaree}€/mois

ANOMALIES PRÉ-DÉTECTÉES PAR LES RÈGLES JS :
${jsAnomalies.length > 0
    ? jsAnomalies.map(a => `- [${a.severity}] ${a.title} : ${a.summary}`).join('\n')
    : '- Aucune anomalie détectée par les règles JS'
  }

Analyse cette situation retraite. Confirme, nuance ou enrichis les anomalies pré-détectées. Identifie d'éventuelles anomalies supplémentaires. Réponds UNIQUEMENT en JSON.`
}

/**
 * Message utilisateur pour le rapport complet.
 */
export function buildFullReportUserMessage(
  data: RetraitiaFormData,
  calc: RetraitiaCalculations,
  preDiag: RetraitiaPreDiagResult
): string {
  const base = buildPreDiagnosticUserMessage(
    data,
    calc,
    preDiag.anomalies.map(a => ({ type: a.type, severity: a.severity, title: a.title, summary: a.summary }))
  )

  return `${base}

RÉSULTAT DU PRÉ-DIAGNOSTIC (à développer en rapport complet) :
- Nombre d'anomalies : ${preDiag.anomalies.length}
- Impact mensuel estimé : ${preDiag.totalImpactMonthlyMin}–${preDiag.totalImpactMonthlyMax}€/mois
- Impact sur espérance de vie : ${preDiag.totalImpactLifetime}€
- Niveau de risque : ${preDiag.riskLevel}
- Anomalies :
${preDiag.anomalies.map(a => `  • [${a.severity}] ${a.title} — ${a.impactMonthlyMin}–${a.impactMonthlyMax}€/mois — ${a.legalReference}`).join('\n')}

Rédige le rapport complet et détaillé (10 sections). Réponds UNIQUEMENT en JSON.`
}

/**
 * Message utilisateur pour la génération des courriers.
 */
export function buildLettersUserMessage(
  data: RetraitiaFormData,
  calc: RetraitiaCalculations,
  preDiag: RetraitiaPreDiagResult,
  clientInfo?: { name?: string; address?: string; nir?: string; carsat?: string; city?: string }
): string {
  const clientName = clientInfo?.name || 'non renseigne'
  const clientAddress = clientInfo?.address || 'non renseigne'
  const clientNIR = clientInfo?.nir || 'non renseigne'
  const clientCARSAT = clientInfo?.carsat || 'non renseigne'
  const clientCity = clientInfo?.city || 'non renseigne'

  const pensionBase = data.status === 'retired' ? data.basePension : data.estimatedBasePension

  return `DONNÉES POUR LES COURRIERS DE RÉCLAMATION :
- Situation : ${data.status === 'retired' ? 'Retraité' : 'En activité'}
- Date de naissance : ${data.birthDate}
- Régimes : ${data.regimes.map(r => REGIME_LABELS[r] || r).join(', ')}
- Trimestres validés : ${data.totalTrimesters} / ${calc.trimestresRequis} requis
- Pension de base : ${pensionBase || '?'}€/mois
- Pension complémentaire : ${(data.status === 'retired' ? data.complementaryPension : data.estimatedComplementaryPension) || '?'}€/mois
- Impact mensuel estimé : ${preDiag.totalImpactMonthlyMin}–${preDiag.totalImpactMonthlyMax}€/mois
- Impact total sur espérance de vie : ${preDiag.totalImpactLifetime}€

ANOMALIES À MENTIONNER DANS LES COURRIERS :
${preDiag.anomalies.map(a => `- ${a.title} : ${a.detail} (${a.legalReference})`).join('\n')}

INFORMATIONS DU CLIENT (utilise ces valeurs dans les courriers, ne mets des [crochets] QUE si la valeur est "non renseigne") :
- Nom complet : ${clientName}
- Adresse : ${clientAddress}
- N° de Sécurité Sociale : ${clientNIR}
- CARSAT de rattachement : ${clientCARSAT}
- Ville : ${clientCity}
- Date : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}

RÈGLE ABSOLUE : Si une valeur est fournie (pas "non renseigne"), utilise-la directement dans le courrier. Ne la mets PAS entre crochets.
Si une valeur est "non renseigne", mets [CHAMP À COMPLÉTER] à la place.

Génère les 3 courriers prêts à signer. Réponds UNIQUEMENT en JSON.`
}
