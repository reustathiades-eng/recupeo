// ============================================================
// MACAUTION — Anonymisation spécifique à la brique
// ============================================================
// Identifie et enregistre les données personnelles du formulaire
// MACAUTION avant envoi à l'API Claude.
// ============================================================
import { AnonymizationSession } from '@/lib/anonymizer'
import type { MacautionFormData } from './types'

/**
 * Crée une session d'anonymisation pré-remplie avec les données
 * personnelles du formulaire MACAUTION.
 *
 * Données anonymisées :
 * - email
 * - otherDeduction (peut contenir des noms, adresses)
 *
 * Données NON anonymisées (nécessaires pour les calculs) :
 * - montants (loyer, dépôt, retenues) → chiffres, pas de PII
 * - dates (entrée, sortie) → nécessaires pour les calculs
 * - type de location → enum, pas de PII
 * - motifs de retenue → enum, pas de PII
 *
 * NOTE : Pour les futures briques (RETRAITIA, MAPAIE...) qui auront
 * des noms, adresses, numéros de sécu, etc., il suffira de créer
 * un fichier anonymize.ts similaire avec les bons champs.
 */
export function createMacautionAnonymizer(data: MacautionFormData): AnonymizationSession {
  const session = new AnonymizationSession()

  // Email — toujours anonymiser
  if (data.email) {
    session.register('email', data.email)
  }

  // Champ libre "autre motif" — peut contenir des noms/infos perso
  if (data.otherDeduction && data.otherDeduction.trim()) {
    // Détection basique de noms propres (mots commençant par une majuscule)
    const words = data.otherDeduction.split(/\s+/)
    for (const word of words) {
      const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '')
      if (clean.length > 2 && /^[A-ZÀ-Ÿ]/.test(clean) && !isCommonWord(clean)) {
        session.register('custom', clean, 'NOM_PROPRE')
      }
    }

    // Détection d'emails dans le texte libre
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = data.otherDeduction.match(emailRegex)
    if (emails) {
      for (const email of emails) {
        session.register('email', email)
      }
    }

    // Détection de numéros de téléphone
    const phoneRegex = /(?:0|\+33|0033)\s*[1-9](?:[\s.-]*\d{2}){4}/g
    const phones = data.otherDeduction.match(phoneRegex)
    if (phones) {
      for (const phone of phones) {
        session.register('telephone', phone)
      }
    }
  }

  return session
}

/**
 * Mots français courants qui commencent par une majuscule mais ne sont pas des noms propres.
 * (En début de phrase, après un point, etc.)
 */
const COMMON_WORDS = new Set([
  // Mots fréquents en contexte immobilier
  'Le', 'La', 'Les', 'Un', 'Une', 'Des', 'Mon', 'Ma', 'Mes', 'Son', 'Sa', 'Ses',
  'Ce', 'Cette', 'Ces', 'Du', 'De', 'Au', 'Aux', 'En', 'Par', 'Pour', 'Sur',
  'Dans', 'Avec', 'Sans', 'Sous', 'Vers', 'Chez', 'Entre',
  'Il', 'Elle', 'Ils', 'Elles', 'Nous', 'Vous', 'On', 'Qui', 'Que', 'Quoi',
  'Tout', 'Tous', 'Toute', 'Toutes', 'Autre', 'Autres', 'Même', 'Mêmes',
  'Oui', 'Non', 'Pas', 'Plus', 'Très', 'Bien', 'Mal', 'Trop', 'Peu',
  'Mais', 'Donc', 'Car', 'Puis', 'Aussi', 'Comme', 'Quand', 'Avant', 'Après',
  // Termes immobiliers courants
  'Dépôt', 'Garantie', 'Loyer', 'Caution', 'Bail', 'Logement', 'Appartement',
  'Maison', 'Peinture', 'Mur', 'Sol', 'Plafond', 'Cuisine', 'Salle',
  'Chambre', 'Salon', 'Couloir', 'Entrée', 'Sortie', 'Porte', 'Fenêtre',
  'Nettoyage', 'Réparation', 'Dégradation', 'Travaux', 'Bailleur', 'Locataire',
  'Propriétaire', 'Agence', 'État', 'Lieux',
  // Civilités et mots fréquents dans le contexte libre
  'Monsieur', 'Madame', 'Mademoiselle', 'Docteur',
  'Résidence', 'Immeuble', 'Parking', 'Cave', 'Balcon', 'Terrasse',
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
])

function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word)
}
