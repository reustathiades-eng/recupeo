// ============================================================
// MABANQUE — Prompts Claude (rapport + courriers)
// ============================================================
import type { MabanqueFormData, Anomaly } from './types'
import type { TropPercuDetail } from './calculations'
import { fmt } from '@/lib/format'

// ─── System prompt — Rapport complet ───

export const fullReportSystemPrompt = `Tu es un expert en droit bancaire français, spécialisé dans la protection des consommateurs face aux frais bancaires abusifs.

Tu reçois les données d'un audit de frais bancaires avec les anomalies détectées. Tu dois rédiger un rapport clair, pédagogique et bienveillant.

STRUCTURE DU RAPPORT (5 sections) :
1. "Synthèse" — Résumé en 3-4 lignes : nombre d'anomalies, montant récupérable, banque concernée
2. "Analyse des frais" — Détail de chaque anomalie détectée avec référence aux plafonds légaux
3. "Vos droits" — Articles du CMF applicables, prescription 5 ans, procédure de contestation
4. "Statut de fragilité financière" — Éligibilité, plafonds applicables, offre spécifique à 3€/mois
5. "Prochaines étapes" — Guide pratique (conseiller, service client, médiateur, SignalConso)

TON : Bienveillant, factuel, jamais accusateur envers le client. Le client est potentiellement en difficulté financière — sois délicat.
- Vouvoiement
- Cite les articles précis (R.312-4-1 CMF, D.131-25 CMF, etc.)
- Mentionne que 70% des médiations aboutissent en faveur du client
- N'utilise JAMAIS toLocaleString pour formater les nombres

Réponds UNIQUEMENT en JSON :
{
  "sections": [
    { "id": "synthese", "title": "Synthèse", "content": "..." },
    { "id": "analyse", "title": "Analyse détaillée des frais", "content": "..." },
    { "id": "droits", "title": "Vos droits", "content": "..." },
    { "id": "fragilite", "title": "Statut de fragilité financière", "content": "..." },
    { "id": "etapes", "title": "Prochaines étapes", "content": "..." }
  ]
}`

// ─── System prompt — Courriers ───

export const lettersSystemPrompt = `Tu es un expert en droit bancaire français. Tu rédiges des courriers de contestation de frais bancaires pour un client particulier.

COURRIER 1 — RÉCLAMATION AU SERVICE CLIENTÈLE
- Ton cordial mais ferme
- Objet clair : "Contestation de frais bancaires — Demande de remboursement"
- Références client (laisser [____] pour nom, numéro de compte)
- Liste précise des frais contestés (dates, montants, types)
- Références aux articles du CMF (R.312-4-1, D.131-25, etc.)
- Demande de remboursement chiffrée
- Délai de réponse demandé : 15 jours
- Mention du recours au médiateur en cas de refus

COURRIER 2 — SAISINE DU MÉDIATEUR BANCAIRE
- Ton formel
- Exposé du litige
- Référence au premier courrier resté sans réponse ou refusé
- Détail des frais contestés et des plafonds légaux
- Demande de médiation au titre de l'art. L.316-1 du CMF
- Pièces jointes suggérées (relevés, courrier précédent)

GUIDE SIGNALCONSO — Signalement en ligne sur signalconso.gouv.fr

GUIDE PROCÉDURE — Étapes complètes : 1. Conseiller 2. Service client (LRAR) 3. Médiateur 4. SignalConso 5. Tribunal judiciaire

IMPORTANT :
- Vouvoiement
- Laisse des [____] pour tous les champs personnels
- Ne mentionne JAMAIS de noms réels
- Mentionne que 70% des médiations aboutissent favorablement

Réponds UNIQUEMENT en JSON :
{
  "reclamation_service_client": "texte complet du courrier",
  "saisine_mediateur": "texte complet du courrier",
  "guide_signalconso": "guide SignalConso",
  "guide_procedure": "guide étape par étape"
}`

// ─── Builders de messages ───

export function buildFullReportMessage(
  data: MabanqueFormData,
  anomalies: Anomaly[],
  tropPercu: TropPercuDetail,
): string {
  const anomaliesList = anomalies.map((a, i) =>
    `${i + 1}. [${a.severity.toUpperCase()}] ${a.label} — ${a.detail} (excès : ${fmt(a.montantExces)}€)`
  ).join('\n')

  return `Données de l'audit de frais bancaires :

- Banque : ${data.banque}
- Type de compte : ${data.typeCompte}

FRAIS DÉCLARÉS (dernier mois) :
- Commissions d'intervention : ${fmt(data.commissionsIntervention)}€ (${data.commissionsNombre} opérations)
- Rejets de prélèvement : ${fmt(data.rejetsPrelevement)}€ (${data.rejetsPrelevementNombre} rejets)
- Rejets de chèque : ${fmt(data.rejetsCheque)}€
- Agios : ${fmt(data.agios)}€
- Lettres d'information : ${fmt(data.lettresInformation)}€
- Frais de tenue de compte : ${fmt(data.fraisTenueCompte)}€/mois
- Autres frais : ${fmt(data.autresFrais)}€ ${data.autresFraisDescription ? `(${data.autresFraisDescription})` : ''}
- TOTAL MENSUEL : ${fmt(data.totalFraisMois)}€

SITUATION :
- Client fragile identifié : ${data.clientFragile}
- Offre spécifique souscrite : ${data.offreSpecifique}
- Surendettement : ${data.surendettement}
- 5+ incidents/mois : ${data.incidentsMultiples}
- Inscrit FCC : ${data.inscritFCC}

ANOMALIES DÉTECTÉES :
${anomaliesList || 'Aucune anomalie détectée'}

TROP-PERÇU ESTIMÉ :
- Mensuel : ${fmt(tropPercu.tropPercuMensuel)}€
- Annuel : ${fmt(tropPercu.tropPercuAnnuel)}€
- Sur 5 ans : ${fmt(tropPercu.tropPercu5ans)}€

Rédige le rapport en JSON.`
}

export function buildLettersMessage(
  data: MabanqueFormData,
  anomalies: Anomaly[],
  tropPercu: TropPercuDetail,
): string {
  const anomaliesList = anomalies.map((a, i) =>
    `${i + 1}. ${a.label} — ${a.detail} (${fmt(a.montantExces)}€)`
  ).join('\n')

  return `Données pour les courriers de contestation :

- Banque : ${data.banque}
- Type de compte : ${data.typeCompte}

ANOMALIES :
${anomaliesList}

TROP-PERÇU :
- Mensuel : ${fmt(tropPercu.tropPercuMensuel)}€
- Annuel : ${fmt(tropPercu.tropPercuAnnuel)}€
- Sur 5 ans : ${fmt(tropPercu.tropPercu5ans)}€

SITUATION FRAGILITÉ :
- Fragile identifié : ${data.clientFragile}
- Offre spécifique : ${data.offreSpecifique}
- Surendettement : ${data.surendettement}

Rédige les 4 documents en JSON.`
}
