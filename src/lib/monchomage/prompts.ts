// ============================================================
// MONCHOMAGE — Prompts Claude (rapport + courriers)
// ============================================================
import type { MonchomageFormData, MonchomageCalculations, Anomaly } from './types'
import { RUPTURE_LABELS, CONTRAT_LABELS } from './constants'
import { fmt } from '@/lib/format'

export const fullReportSystemPrompt = `Tu es un expert en droit du travail français, spécialisé dans l'assurance chômage et le calcul de l'ARE (Allocation de Retour à l'Emploi).

Tu reçois les données d'un demandeur d'emploi, les calculs théoriques et les anomalies détectées. Tu dois rédiger un rapport clair et pédagogique.

STRUCTURE DU RAPPORT (5 sections) :
1. "Synthèse" — Résumé en 3-4 lignes : nombre d'anomalies, écart estimé, impact financier
2. "Recalcul du SJR" — Explication détaillée du calcul : salaire de référence, jours calendaires, formule, résultat
3. "Analyse des écarts" — Comparaison poste par poste entre notification et calcul théorique
4. "Vos droits" — Convention d'assurance chômage, prescription 2 ans, procédure de contestation
5. "Prochaines étapes" — Guide pratique (vérifier attestation, contacter France Travail, médiateur)

TON : Bienveillant, encourageant, factuel. Le chômage est une période difficile — sois délicat.
- Vouvoiement
- Précise que le calcul est THÉORIQUE et dépend de la complétude des données fournies
- Mentionne que l'attestation employeur est la première source à vérifier
- Si un trop-perçu est possible, avertis avec tact

Réponds UNIQUEMENT en JSON :
{
  "sections": [
    { "id": "synthese", "title": "Synthèse", "content": "..." },
    { "id": "recalcul", "title": "Recalcul du SJR et de l'allocation", "content": "..." },
    { "id": "ecarts", "title": "Analyse des écarts", "content": "..." },
    { "id": "droits", "title": "Vos droits", "content": "..." },
    { "id": "etapes", "title": "Prochaines étapes", "content": "..." }
  ]
}`

export const lettersSystemPrompt = `Tu es un expert en droit du travail français. Tu rédiges des courriers de réclamation auprès de France Travail pour un demandeur d'emploi dont l'allocation chômage semble mal calculée.

COURRIER 1 — RÉCLAMATION À L'AGENCE FRANCE TRAVAIL
- Objet : "Demande de réexamen du calcul de mon allocation ARE"
- Identité : [____] pour nom, identifiant France Travail
- Référence de la notification contestée
- Exposé des anomalies (SJR, primes, neutralisation) avec calculs
- Demande de réexamen du SJR et de l'allocation
- Pièces justificatives jointes
- Délai souhaité : 1 mois

COURRIER 2 — SAISINE DU MÉDIATEUR
- Si non-réponse ou refus de l'agence
- Adresse : mediateur@francetravail.fr
- Résumé du dossier + historique
- Demande de médiation

GUIDE PROCÉDURE :
1. Vérifier attestation employeur (pole-emploi.fr / France Travail)
2. Réclamation à l'agence (courrier ou espace personnel)
3. Médiateur de France Travail (mediateur@francetravail.fr)
4. Tribunal judiciaire (pôle social) en dernier recours

IMPORTANT :
- Vouvoiement, ton respectueux mais ferme
- Laisse des [____] pour les champs personnels
- Mentionne la convention d'assurance chômage 2024
- Prescription : 2 ans

Réponds UNIQUEMENT en JSON :
{
  "reclamation_agence": "texte complet",
  "saisine_mediateur": "texte complet",
  "guide_procedure": "guide étape par étape"
}`

export function buildFullReportMessage(
  data: MonchomageFormData,
  calc: MonchomageCalculations,
  anomalies: Anomaly[],
): string {
  const anomaliesList = anomalies.map((a, i) =>
    `${i + 1}. [${a.severity.toUpperCase()}] ${a.label} — ${a.detail} (impact : ${a.impact > 0 ? '+' : ''}${fmt(a.impact)}€/jour)`
  ).join('\n')

  return `Données du demandeur d'emploi :

- Âge à la fin du contrat : ${data.ageFinContrat} ans
- Date de fin de contrat : ${data.dateFinContrat}
- Type de rupture : ${RUPTURE_LABELS[data.typeRupture] || data.typeRupture}
- Type de contrat : ${CONTRAT_LABELS[data.typeContrat] || data.typeContrat}
- Salaire brut mensuel moyen : ${fmt(data.salaireBrutMoyen)}€
- Primes / 13ème mois : ${data.hasPrimes ? `Oui, ${fmt(data.primesTotal)}€ total` : 'Non'}
- Arrêts maladie/maternité : ${data.hasMaladie ? `Oui, ${data.maladieDuree} jours` : 'Non'}
- Activité partielle : ${data.hasActivitePartielle ? `Oui, ${data.apDuree} jours` : 'Non'}
- Multi-employeurs : ${data.multiEmployeurs ? 'Oui' : 'Non'}

NOTIFICATION FRANCE TRAVAIL :
- AJ brute notifiée : ${fmt(data.ajBrute)}€/jour
- SJR notifié : ${data.sjrNotification ? fmt(data.sjrNotification) + '€' : 'Non communiqué'}
- Durée d'indemnisation : ${data.dureeIndemnisation} jours
- Dégressivité appliquée : ${data.degressiviteAppliquee}

CALCUL THÉORIQUE :
- Salaire de référence : ${fmt(calc.salaireReference)}€
- Jours calendaires PRC : ${calc.joursCalendaires}
- SJR théorique : ${fmt(calc.sjrTheorique)}€
- AJ formule 1 (40,4% + fixe) : ${fmt(calc.ajFormule1)}€
- AJ formule 2 (57%) : ${fmt(calc.ajFormule2)}€
- AJ théorique retenue : ${fmt(calc.ajTheorique)}€
- AJ nette : ${fmt(calc.ajNette)}€
- ARE mensuelle brute : ${fmt(calc.areMensuelleBrute)}€
- Durée max (tranche ${calc.trancheAge}) : ${calc.dureeTheoriqueMax} jours
- Dégressivité applicable : ${calc.degressiviteApplicable ? 'Oui' : 'Non'}

ÉCARTS :
- Écart AJ : ${calc.ecartAJ > 0 ? '+' : ''}${fmt(calc.ecartAJ)}€/jour
- Écart mensuel : ${calc.ecartMensuel > 0 ? '+' : ''}${fmt(calc.ecartMensuel)}€/mois
- Écart total : ${calc.ecartTotal > 0 ? '+' : ''}${fmt(calc.ecartTotal)}€

ANOMALIES DÉTECTÉES :
${anomaliesList || 'Aucune anomalie détectée'}

Rédige le rapport en JSON.`
}

export function buildLettersMessage(
  data: MonchomageFormData,
  calc: MonchomageCalculations,
  anomalies: Anomaly[],
): string {
  const anomaliesList = anomalies
    .filter(a => a.type !== 'trop_percu_possible')
    .map((a, i) => `${i + 1}. ${a.label} — ${a.detail}`)
    .join('\n')

  return `Données pour les courriers de contestation ARE :

- Type de rupture : ${RUPTURE_LABELS[data.typeRupture]}
- Date de fin : ${data.dateFinContrat}
- AJ notifiée : ${fmt(data.ajBrute)}€/jour
- AJ théorique : ${fmt(calc.ajTheorique)}€/jour
- SJR notifié : ${data.sjrNotification ? fmt(data.sjrNotification) + '€' : 'Non communiqué'}
- SJR théorique : ${fmt(calc.sjrTheorique)}€
- Écart estimé : ${calc.ecartTotal > 0 ? '+' : ''}${fmt(calc.ecartTotal)}€ sur ${data.dureeIndemnisation} jours

ANOMALIES :
${anomaliesList}

Rédige les 3 documents en JSON.`
}
