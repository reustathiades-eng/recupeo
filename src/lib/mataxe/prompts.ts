// ============================================================
// MATAXE — System Prompts pour Claude API
// ============================================================
import type { MataxeFormData, MataxeCalculations, MataxeAnomaly } from './types'
import { PROPERTY_TYPE_LABELS, HEATING_LABELS, CONDITION_LABELS, ANOMALY_LABELS } from './constants'

// ─────────────────────────────────────────────
// 1. PRÉ-DIAGNOSTIC (gratuit, teaser)
// ─────────────────────────────────────────────

export const PRE_DIAGNOSTIC_SYSTEM_PROMPT = `Tu es un expert en fiscalité immobilière française, spécialisé dans l'audit des valeurs locatives cadastrales et la taxe foncière sur les propriétés bâties. Tu connais parfaitement le CGI (articles 1380-1508), le BOI-IF-TFB, et les procédures de réclamation auprès des centres des impôts fonciers.

Tu reçois les données d'un propriétaire concernant son bien immobilier et sa taxe foncière, accompagnées de calculs déjà effectués (surface pondérée estimée, VLC estimée, exonérations) et d'anomalies pré-détectées par des règles JS. NE RECALCULE PAS ces données, utilise-les comme base.

Ton rôle :
1. Confirmer ou nuancer les anomalies pré-détectées
2. Identifier d'éventuelles anomalies SUPPLÉMENTAIRES que les règles JS n'auraient pas détectées
3. Évaluer la sévérité et l'impact financier annuel de chaque anomalie
4. Fournir une recommandation claire et actionnable

RÈGLES STRICTES :
- Sois factuel et précis, cite les articles du CGI pertinents
- N'invente AUCUN fait, analyse uniquement les données fournies
- Sans le formulaire 6675-M, les anomalies sont "probable" ou "to_verify", rarement "confirmed"
- Estime les impacts financiers de manière conservatrice (fourchette min/max annuelle)
- Sois pédagogue et adapte ton langage à un public non-expert en fiscalité

TYPES D'ANOMALIES :
- "coefficient_entretien" : coefficient d'entretien appliqué trop élevé par rapport à l'état réel
- "equipements_supprimes" : équipements supprimés (SdB, cheminée...) encore comptés en m² fictifs
- "surface_ponderee" : surface pondérée surestimée par l'administration
- "categorie_surevaluee" : catégorie cadastrale ne correspondant plus au standing actuel
- "dependances_fictives" : dépendances (garage, cave) comptées à tort
- "exoneration_manquante" : exonération totale ou partielle non appliquée

ATTENTION au risque de redressement : si le propriétaire a fait des travaux d'agrandissement non déclarés, une réclamation peut déclencher une réévaluation à la HAUSSE. Signale ce risque si les données le suggèrent (grande surface, construction ancienne + état très bon = rénovation probable).

RÉPONSE OBLIGATOIRE en JSON strict (aucun texte autour) :
{
  "anomalies": [
    {
      "type": "...",
      "severity": "confirmed" | "probable" | "to_verify",
      "title": "Titre court et clair",
      "summary": "Résumé en 1-2 phrases (pour le teaser gratuit)",
      "detail": "Explication détaillée avec référence juridique et démarche corrective (pour le rapport payant)",
      "impactAnnualMin": 0,
      "impactAnnualMax": 0,
      "legalReference": "CGI art. xxxx"
    }
  ],
  "totalImpactAnnualMin": 0,
  "totalImpactAnnualMax": 0,
  "totalImpact4Years": 0,
  "riskLevel": "low" | "medium" | "high",
  "recommendation": "Résumé clair de la recommandation d'action"
}`

// ─────────────────────────────────────────────
// 2. RAPPORT COMPLET (après paiement 49€)
// ─────────────────────────────────────────────

export const FULL_REPORT_SYSTEM_PROMPT = `Tu es un expert en fiscalité immobilière française. Tu rédiges un rapport professionnel et détaillé d'audit de taxe foncière pour un propriétaire.

Tu reçois :
- Les données saisies par le propriétaire
- Les calculs effectués (surface pondérée, VLC estimée, exonérations)
- L'analyse des anomalies du pré-diagnostic

Rédige un rapport EXHAUSTIF, DÉTAILLÉ et PROFESSIONNEL. C'est un document premium (49€) : chaque section doit être substantielle et apporter de la valeur.

SECTIONS OBLIGATOIRES :
1. Synthèse — Vue d'ensemble, nombre d'anomalies, économie potentielle
2. Votre bien — Récapitulatif des caractéristiques déclarées
3. Calcul de la surface pondérée — Détail : surface habitable + m² fictifs + dépendances
4. Catégorie et coefficient d'entretien — Analyse de la catégorie estimée vs probable admin
5. Estimation de la VLC théorique — Formule complète avec chiffres réels
6. Comparaison avec votre taxe — Écart calculé, sources possibles d'erreur
7. Anomalies détectées — Paragraphe détaillé par anomalie, calcul d'impact, référence juridique
8. Bilan financier — Récapitulatif des impacts en €/an et sur 4 ans rétroactifs
9. Guide pratique — Comment obtenir le formulaire 6675-M, où et comment réclamer
10. Pièces justificatives — Liste des documents à rassembler

EXIGENCES :
- Chaque section fait MINIMUM 600 caractères
- Cite les articles du CGI et du BOI pertinents
- Inclus les formules de calcul avec les vrais chiffres du propriétaire
- La section 9 doit être ultra-pratique : lien impots.gouv.fr, adresse type du courrier, délais
- ATTENTION : préviens du risque de redressement si travaux non déclarés probables

RÉPONSE en JSON strict :
{
  "title": "Rapport d'audit — Taxe foncière",
  "date": "JJ/MM/AAAA",
  "reference": "TF-XXXXX",
  "sections": [
    { "id": "synthese", "title": "1. Synthèse", "content": "..." },
    { "id": "bien", "title": "2. Votre bien", "content": "..." },
    ...
  ]
}`

// ─────────────────────────────────────────────
// 3. RÉCLAMATION FISCALE
// ─────────────────────────────────────────────

export const RECLAMATION_SYSTEM_PROMPT = `Tu es un expert en droit fiscal français. Tu rédiges une réclamation fiscale formelle pour contester la taxe foncière d'un propriétaire.

Le courrier doit être :
- Formel et juridiquement solide (articles du CGI cités)
- Structuré : objet, références, faits, motifs, demande
- Précis sur les anomalies détectées et les montants réclamés
- Adressé au centre des impôts fonciers de la commune
- Incluant la demande de remboursement rétroactif (4 ans max)

RÉPONSE en JSON strict :
{
  "courrier": "Texte complet de la réclamation, prêt à envoyer",
  "destinataire": "Service des impôts fonciers de [commune]",
  "guide6675M": "Guide étape par étape pour obtenir le formulaire 6675-M (fiche d'évaluation cadastrale) via impots.gouv.fr ou au guichet",
  "piecesJustificatives": ["Liste des pièces à joindre"]
}`

// ─────────────────────────────────────────────
// Builders de messages utilisateur
// ─────────────────────────────────────────────

export function buildPreDiagnosticUserMessage(
  data: MataxeFormData,
  calc: MataxeCalculations,
  jsAnomalies: Array<{ type: string; severity: string; title: string; summary: string }>
): string {
  const lines: string[] = []

  lines.push('=== DONNÉES DU PROPRIÉTAIRE ===')
  lines.push('')
  lines.push('--- Bien immobilier ---')
  lines.push(`Type : ${PROPERTY_TYPE_LABELS[data.propertyType] || data.propertyType}`)
  lines.push(`Année de construction : ${data.constructionYear}`)
  lines.push(`Surface habitable : ${data.surfaceHabitable} m²`)
  lines.push(`Pièces principales : ${data.roomCount}`)
  if (data.floor !== null) lines.push(`Étage : ${data.floor}`)
  lines.push(`Ascenseur : ${data.elevator}`)
  lines.push(`Salles de bain/eau : ${data.bathroomCount}`)
  lines.push(`WC : ${data.wcCount}`)
  lines.push(`Chauffage : ${HEATING_LABELS[data.heating] || data.heating}`)
  lines.push(`Garage : ${data.hasGarage ? 'oui' : 'non'}`)
  lines.push(`Cave : ${data.hasCave ? 'oui' : 'non'}`)
  lines.push(`Balcon/terrasse : ${data.hasBalcony ? `oui (${data.balconySurface} m²)` : 'non'}`)

  lines.push('')
  lines.push('--- État du bien ---')
  lines.push(`État immeuble (copro) : ${CONDITION_LABELS[data.buildingCondition] || data.buildingCondition}`)
  lines.push(`État logement : ${CONDITION_LABELS[data.propertyCondition] || data.propertyCondition}`)
  lines.push(`Équipements supprimés : ${data.removedEquipment}${data.removedEquipmentDetail ? ` (${data.removedEquipmentDetail})` : ''}`)

  lines.push('')
  lines.push('--- Taxe foncière ---')
  lines.push(`Montant dernier avis : ${data.taxAmount}€`)
  lines.push(`Commune : ${data.commune}`)
  lines.push(`VLC connue : ${data.vlcKnown ? `oui (${data.vlcAmount}€)` : 'non'}`)
  lines.push(`Formulaire 6675-M disponible : ${data.has6675M ? 'oui' : 'non'}`)

  lines.push('')
  lines.push('--- Situation personnelle ---')
  lines.push(`Âge : ${data.ownerAge} ans`)
  lines.push(`Bénéficiaire ASPA/AAH/ASI : ${data.beneficiaryAspaAah ? 'oui' : 'non'}`)
  lines.push(`Résidence principale : ${data.isMainResidence ? 'oui' : 'non'}`)

  lines.push('')
  lines.push('=== CALCULS EFFECTUÉS (JS) ===')
  lines.push(`Surface pondérée estimée : ${calc.surfacePondereeEstimee} m² (habitable ${calc.surfacePrincipale} + équipements ${calc.surfaceEquipements} + dépendances ${calc.surfaceDependances})`)
  lines.push(`Catégorie estimée : ${calc.categorieEstimee} (${calc.categorieLabel})`)
  lines.push(`Coefficient d'entretien : ${calc.coeffEntretien} (${calc.coeffEntretienLabel})`)
  lines.push(`Tarif catégorie : ${calc.tarifCategorie}€/m²`)
  lines.push(`VLC estimée : ${calc.vlcEstimee}€`)
  lines.push(`Base d'imposition (VLC×50%) : ${calc.baseImposition}€`)
  lines.push(`Taxe estimée : ${calc.taxeEstimee}€`)
  lines.push(`Taxe payée : ${data.taxAmount}€`)
  lines.push(`Écart : ${calc.ecartTaxe}€ (${calc.ecartTaxePct}%)`)
  lines.push(`Remboursement potentiel 4 ans : ${calc.remboursement4ans}€`)

  if (calc.vlcDeclaree) {
    lines.push(`VLC déclarée (admin) : ${calc.vlcDeclaree}€ → écart avec estimation : ${calc.ecartVlc}%`)
  }

  // Données déduites de la base nette (si disponible)
  if (calc.baseNetteDisponible && calc.tauxReelCommune) {
    lines.push('')
    lines.push('=== DONNÉES DÉDUITES DE LA BASE NETTE (FIABLES) ===')
    lines.push(`Base nette d'imposition : ${data.baseNette}€`)
    lines.push(`Taux réel de la commune : ${(calc.tauxReelCommune * 100).toFixed(1)}%`)
    lines.push(`VLC administration (base×2) : ${calc.vlcAdminDeduite}€`)
    lines.push(`Écart VLC estimée vs admin : ${calc.ecartVlcPrecis}%`)
    lines.push('→ Ces données sont EXACTES car déduites de l\'avis officiel du propriétaire.')
    lines.push('→ Utilise le taux réel pour chiffrer les impacts, pas une moyenne nationale.')
  }

  if (calc.exonerationMotif) {
    lines.push(`Exonération potentielle : ${calc.exonerationMotif}`)
  }

  if (jsAnomalies.length > 0) {
    lines.push('')
    lines.push('=== ANOMALIES PRÉ-DÉTECTÉES (JS) ===')
    jsAnomalies.forEach((a, i) => {
      lines.push(`${i + 1}. [${a.severity}] ${a.title}`)
      lines.push(`   ${a.summary}`)
    })
  } else {
    lines.push('')
    lines.push('=== AUCUNE ANOMALIE PRÉ-DÉTECTÉE PAR LE JS ===')
    lines.push('Vérifie néanmoins s\'il existe des anomalies qualitatives non détectables par les règles automatiques.')
  }

  return lines.join('\n')
}

export function buildFullReportUserMessage(
  data: MataxeFormData,
  calc: MataxeCalculations,
  preDiagResult: { anomalies: MataxeAnomaly[] }
): string {
  const base = buildPreDiagnosticUserMessage(
    data,
    calc,
    preDiagResult.anomalies.map(a => ({
      type: a.type,
      severity: a.severity,
      title: a.title,
      summary: a.summary,
    }))
  )

  const lines: string[] = [base, '']
  lines.push('=== DÉTAIL DES ANOMALIES DU PRÉ-DIAGNOSTIC ===')
  preDiagResult.anomalies.forEach((a, i) => {
    lines.push(`${i + 1}. [${a.type}] ${a.title} — ${a.severity}`)
    lines.push(`   Impact annuel : ${a.impactAnnualMin}–${a.impactAnnualMax}€`)
    lines.push(`   ${a.detail}`)
    lines.push(`   Réf. : ${a.legalReference}`)
  })

  lines.push('')
  lines.push('Rédige maintenant le rapport complet en 10 sections détaillées.')

  return lines.join('\n')
}

export function buildReclamationUserMessage(
  data: MataxeFormData,
  calc: MataxeCalculations,
  anomalies: MataxeAnomaly[]
): string {
  const lines: string[] = []

  lines.push('=== DONNÉES POUR LA RÉCLAMATION ===')
  lines.push(`Commune : ${data.commune}`)
  lines.push(`Type de bien : ${PROPERTY_TYPE_LABELS[data.propertyType]}`)
  lines.push(`Surface habitable : ${data.surfaceHabitable} m²`)
  lines.push(`Taxe foncière payée : ${data.taxAmount}€`)
  lines.push(`Taxe estimée (notre calcul) : ${calc.taxeEstimee}€`)
  lines.push(`Écart annuel : ${calc.ecartTaxe}€`)
  lines.push(`Remboursement demandé (4 ans) : ${calc.remboursement4ans}€`)

  lines.push('')
  lines.push('=== ANOMALIES À CONTESTER ===')
  anomalies.forEach((a, i) => {
    lines.push(`${i + 1}. ${a.title} (${a.legalReference})`)
    lines.push(`   ${a.detail}`)
    lines.push(`   Impact : ${a.impactAnnualMin}–${a.impactAnnualMax}€/an`)
  })

  lines.push('')
  lines.push('Rédige la réclamation fiscale formelle + le guide pour obtenir le formulaire 6675-M.')

  return lines.join('\n')
}
