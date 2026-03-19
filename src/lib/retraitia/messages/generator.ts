// ============================================================
// RETRAITIA V2 — Generateur de messages pre-rediges
// ============================================================
// Source : BRIEF_MESSAGES_ACTIONS.md
// Templates par categorie + injection de variables
// ============================================================

import type { DetectedAnomaly, AnomalyId, DossierFormulaire, GeneratedMessage, MessageCategory, MessageChannel } from '../types'

// ─── Mapping anomalie → categorie de template ───

const ANOMALY_TO_CATEGORY: Partial<Record<AnomalyId, MessageCategory>> = {
  N1_TRIM_COTISES_MANQUANTS: 'correction_carriere',
  N1_TRIM_MILITAIRE: 'correction_carriere',
  N1_TRIM_ENFANTS: 'majoration_enfants',
  N1_TRIM_CHOMAGE: 'correction_carriere',
  N1_TRIM_MALADIE: 'correction_carriere',
  N1_TRIM_AVPF: 'correction_carriere',
  N1_TRIM_CHOMAGE_NON_INDEMNISE: 'correction_carriere',
  N1_TRIM_APPRENTISSAGE: 'correction_carriere',
  N1_TRIM_ETRANGER: 'correction_carriere',
  N1_SAM_INCORRECT: 'reclamation_pension',
  N1_TAUX_INCORRECT: 'reclamation_pension',
  N1_SURCOTE_ABSENTE: 'reclamation_pension',
  N1_DECOTE_EXCESSIVE: 'reclamation_pension',
  N1_MAJORATION_ENFANTS_ABSENTE: 'majoration_enfants',
  N1_MINIMUM_CONTRIBUTIF: 'reclamation_pension',
  N1_PRORATISATION_INCORRECTE: 'reclamation_pension',
  N1_SSI_MIGRATION: 'correction_carriere',
  N1_JOBS_ETE: 'correction_carriere',
  N2_POINTS_MANQUANTS: 'points_complementaire',
  N2_POINTS_GRATUITS: 'points_complementaire',
  N2_MAJORATION_AA: 'majoration_enfants',
  N2_MALUS_NON_LEVE: 'points_complementaire',
  N2_GMP: 'points_complementaire',
  N6_CSG_TROP_ELEVEE: 'csg_incorrecte',
  N6_CSG_POST_VARIATION: 'csg_incorrecte',
}

// ─── Guide d'envoi par organisme ───

const GUIDES_ENVOI: Record<string, string> = {
  'CARSAT': 'Connectez-vous sur lassuranceretraite.fr → Mon compte → Messagerie → Nouveau message',
  'CARSAT + info-retraite.fr': 'info-retraite.fr → Mon compte → Corriger ma carriere (si 55+) OU lassuranceretraite.fr → Messagerie',
  'Agirc-Arrco': 'Connectez-vous sur agirc-arrco.fr → Mon espace → Contactez-nous → Nouveau message',
  'SRE / CNRACL': 'Connectez-vous sur ensap.gouv.fr (SRE) ou cnracl.retraites.fr (CNRACL) → Messagerie',
  'MSA': 'Connectez-vous sur msa.fr → Mon espace → Messagerie',
  'Impots': 'impots.gouv.fr → Mon espace → Messagerie securisee → Ecrire',
}

// ─── Templates de messages ───

interface Template {
  objet: string
  corps: string
}

function getTemplate(category: MessageCategory, anomaly: DetectedAnomaly): Template {
  switch (category) {
    case 'correction_carriere':
      return {
        objet: 'Demande de correction de carriere — anomalie detectee',
        corps: `Bonjour,

Suite a l'analyse detaillee de mon releve de carriere, je constate l'anomalie suivante :

${anomaly.detail}

Je vous remercie de bien vouloir proceder a la verification de ces elements dans vos fichiers et, le cas echeant, a la correction de mon releve de carriere.

Si des justificatifs sont necessaires, je vous prie de me le faire savoir et je vous les transmettrai dans les meilleurs delais.

Cordialement,
{prenom} {nom}
N° SS : {nir}
Ne(e) le : {dateNaissance}`,
      }

    case 'reclamation_pension':
      return {
        objet: 'Reclamation — erreur de calcul de ma pension',
        corps: `Bonjour,

Apres verification detaillee de ma notification de pension, je constate une erreur de calcul :

${anomaly.detail}

Je vous demande de bien vouloir proceder a un nouveau calcul de ma pension en tenant compte de cette correction, et de me verser les rappels d'arrerages depuis la date d'effet de ma retraite.

Cordialement,
{prenom} {nom}
N° SS : {nir}
Ne(e) le : {dateNaissance}`,
      }

    case 'majoration_enfants':
      return {
        objet: 'Demande de majoration pour enfants',
        corps: `Bonjour,

J'ai eleve {nbEnfants} enfants. Ma pension devrait beneficier d'une majoration de 10% qui ne semble pas appliquee.

${anomaly.detail}

Je vous prie de bien vouloir verifier et appliquer cette majoration sur ma pension, avec rappel depuis la date d'effet.

Ci-joint mon livret de famille si necessaire.

Cordialement,
{prenom} {nom}
N° SS : {nir}`,
      }

    case 'points_complementaire':
      return {
        objet: 'Verification de points de retraite complementaire',
        corps: `Bonjour,

Apres analyse de mon releve de points, je constate l'anomalie suivante :

${anomaly.detail}

Je vous remercie de bien vouloir verifier et corriger le cas echeant.

Cordialement,
{prenom} {nom}
N° SS : {nir}`,
      }

    case 'csg_incorrecte':
      return {
        objet: 'Rectification du taux de CSG',
        corps: `Bonjour,

Le taux de CSG applique a ma pension ne correspond pas a mon Revenu Fiscal de Reference.

${anomaly.detail}

Je vous remercie de bien vouloir appliquer le taux correct et me rembourser le trop-preleve.

Cordialement,
{prenom} {nom}
N° SS : {nir}`,
      }

    default:
      return {
        objet: `Demande concernant ma pension de retraite`,
        corps: `Bonjour,

${anomaly.detail}

Je vous remercie de bien vouloir verifier ce point.

Cordialement,
{prenom} {nom}
N° SS : {nir}`,
      }
  }
}

// ─── Injection de variables ───

function injectVariables(text: string, formulaire: DossierFormulaire): string {
  const { identite, enfants, carriere } = formulaire
  return text
    .replace(/\{nom\}/g, identite.nom || '')
    .replace(/\{prenom\}/g, identite.prenom || '')
    .replace(/\{nir\}/g, identite.nir || '[votre N° SS]')
    .replace(/\{dateNaissance\}/g, identite.dateNaissance || '')
    .replace(/\{nbEnfants\}/g, String(enfants.nombreEnfants))
    .replace(/\{dateDepart\}/g, carriere.retraiteDateDepart || '')
    .replace(/\{date_jour\}/g, new Date().toLocaleDateString('fr-FR'))
}

// ─── Generateur principal ───

export function generateMessages(
  anomalies: DetectedAnomaly[],
  formulaire: DossierFormulaire,
): GeneratedMessage[] {
  const messages: GeneratedMessage[] = []

  for (const anomaly of anomalies) {
    // Skip les opportunites cross-sell (pas de message a envoyer)
    if (anomaly.categorie === 'opportunite') continue

    const category = ANOMALY_TO_CATEGORY[anomaly.id]
    if (!category) continue

    const template = getTemplate(category, anomaly)
    const organisme = anomaly.organisme.split(' / ')[0].split(' + ')[0].trim()
    const guideEnvoi = GUIDES_ENVOI[organisme] || GUIDES_ENVOI[anomaly.organisme] || `Contactez ${anomaly.organisme}`

    messages.push({
      anomalyId: anomaly.id,
      category,
      channel: 'messagerie_en_ligne',
      organisme: anomaly.organisme,
      destinataire: guideEnvoi,
      objet: injectVariables(template.objet, formulaire),
      corps: injectVariables(template.corps, formulaire),
      guideEnvoi,
    })
  }

  return messages
}
