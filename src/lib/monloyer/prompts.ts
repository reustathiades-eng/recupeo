// ============================================================
// MONLOYER — System Prompts pour Claude (courriers)
// ============================================================
import type { MonloyerCheckResult, MonloyerFormData } from './types'

// ─────────────────────────────────────────────
// SYSTEM PROMPT — Génération des 3 courriers
// ─────────────────────────────────────────────

export const LETTERS_SYSTEM_PROMPT = `Tu es un expert en droit du logement français, spécialisé dans l'encadrement des loyers (loi ALUR du 24 mars 2014 art. 17, loi ELAN du 23 novembre 2018 art. 140, loi 89-462 du 6 juillet 1989 art. 17 et 17-2).

Tu génères 3 courriers juridiques pour un locataire dont le loyer dépasse le plafond légal (loyer de référence majoré) ou dont le complément de loyer est abusif.

RÈGLES DE RÉDACTION :
- Les courriers doivent être prêts à SIGNER ET POSTER (maximum de champs pré-remplis)
- Si une information est fournie (pas "non renseigne"), utilise-la DIRECTEMENT
- Ne mets entre crochets [xxx] QUE les informations non fournies
- Ton formel, professionnel mais accessible
- Références juridiques précises (loi ALUR, loi ELAN, loi 89-462, Code civil)
- Inclus les montants calculés (trop-perçu mensuel et total)
- Chaque courrier doit faire au minimum 400 mots

STRUCTURE DES 3 COURRIERS :

1. MISE EN DEMEURE AU BAILLEUR
- Objet : Demande de mise en conformité du loyer et remboursement du trop-perçu
- Rappel du cadre légal (encadrement des loyers, territoire concerné)
- Détail du dépassement (loyer actuel vs plafond, montant mensuel, total)
- Demande : réduction du loyer + remboursement du trop-perçu
- Délai : 15 jours pour répondre
- Mention de la saisine de la CDC à défaut

2. SAISINE DE LA COMMISSION DÉPARTEMENTALE DE CONCILIATION (CDC)
- Objet : Demande de conciliation pour loyer excessif
- Rappel de la situation et de la mise en demeure restée sans effet
- Demande de conciliation gratuite
- Pièces jointes à mentionner (bail, mise en demeure, justificatif du loyer de référence)

3. SIGNALEMENT À LA PRÉFECTURE
- Objet : Signalement de non-respect de l'encadrement des loyers
- Art. 140 loi ELAN : amende de 5 000 EUR (personne physique) ou 15 000 EUR (personne morale)
- Demande de contrôle et sanction administrative

RÉPONSE en JSON strict (aucun texte autour) :
{
  "mise_en_demeure": {
    "title": "Mise en demeure — Loyer excessif",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Contenu complet de la lettre avec \\n pour les retours à la ligne..."
  },
  "saisine_cdc": {
    "title": "Saisine de la Commission Départementale de Conciliation",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Contenu complet du courrier..."
  },
  "signalement_prefecture": {
    "title": "Signalement à la préfecture — Non-respect de l'encadrement des loyers",
    "type": "Lettre recommandée avec accusé de réception",
    "content": "Contenu complet du signalement..."
  }
}`

// ─────────────────────────────────────────────
// Builder du message utilisateur
// ─────────────────────────────────────────────

export function buildLettersUserMessage(
  formData: MonloyerFormData,
  result: MonloyerCheckResult,
  clientInfo?: {
    tenantName?: string
    tenantAddress?: string
    landlordName?: string
    landlordAddress?: string
  }
): string {
  const tenantName = clientInfo?.tenantName || 'non renseigne'
  const tenantAddress = clientInfo?.tenantAddress || formData.address || 'non renseigne'
  const landlordName = clientInfo?.landlordName || 'non renseigne'
  const landlordAddress = clientInfo?.landlordAddress || 'non renseigne'

  const bailDateFr = new Date(formData.bailDate).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const todayFr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const statusLabel = result.status === 'depassement'
    ? 'Dépassement du loyer de référence majoré'
    : 'Complément de loyer abusif'

  const dpeInfo = formData.dpe === 'F' || formData.dpe === 'G'
    ? `\n- DPE : ${formData.dpe} (passoire thermique — complément de loyer interdit depuis loi Climat août 2022)`
    : formData.dpe !== 'unknown'
      ? `\n- DPE : ${formData.dpe}`
      : ''

  return `DONNÉES DU DOSSIER ENCADREMENT DES LOYERS :

TYPE DE LITIGE : ${statusLabel}

LOGEMENT :
- Adresse : ${formData.address}
- Ville : ${formData.city} (territoire : ${result.territoryLabel})
- Type de location : ${formData.locationType === 'vide' ? 'Non meublé' : 'Meublé'}
- Nombre de pièces : ${formData.rooms}${formData.rooms === 4 ? ' et plus' : ''}
- Époque de construction : ${formData.constructionEra.replace('before_1946', 'Avant 1946').replace('1946_1970', '1946-1970').replace('1971_1990', '1971-1990').replace('after_1990', 'Après 1990')}
- Surface : ${formData.surface} m²${dpeInfo}

BAIL :
- Date de signature : ${bailDateFr}
- Durée depuis signature : ${result.monthsSinceBail} mois

LOYERS :
- Loyer HC actuel : ${formData.currentRent} EUR/mois
- Loyer de référence majoré (plafond légal) : ${result.referenceRentMajore} EUR/mois
- Trop-perçu mensuel : ${result.excessMonthly} EUR/mois
- Complément de loyer appliqué : ${result.complementAmount > 0 ? result.complementAmount + ' EUR/mois' : 'Aucun'}
- Prix au m² actuel : ${result.pricePerSqm} EUR/m²
- Prix au m² plafond : ${result.referencePricePerSqm} EUR/m²

MONTANT RÉCUPÉRABLE :
- Mois concernés : ${result.maxRecoverableMonths} mois${result.maxRecoverableMonths < result.monthsSinceBail ? ' (plafonné à 36 mois — prescription 3 ans)' : ''}
- Trop-perçu total : ${result.totalRecoverable} EUR

INFORMATIONS DES PARTIES (utilise ces valeurs dans les courriers, ne mets des [crochets] QUE si la valeur est "non renseigne") :
- Nom du locataire : ${tenantName}
- Adresse du locataire : ${tenantAddress}
- Nom du bailleur : ${landlordName}
- Adresse du bailleur : ${landlordAddress}
- Ville du logement : ${formData.city}
- Date du jour : ${todayFr}

RÈGLE ABSOLUE : Si une valeur est fournie (pas "non renseigne"), utilise-la directement dans le courrier. Ne la mets PAS entre crochets.
Si une valeur est "non renseigne", mets [CHAMP À COMPLÉTER] à la place.

Génère les 3 courriers prêts à signer et poster. Réponds UNIQUEMENT en JSON.`
}
