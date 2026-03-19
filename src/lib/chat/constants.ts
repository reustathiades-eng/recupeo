// ============================================================
// RÉCUPÉO — Chat IA Constants
// ============================================================

// Rate limits
export const RATE_LIMIT = {
  anonymous: { maxPerMin: 5, maxPerSession: 30 },
  authenticated: { maxPerMin: 10, maxPerSession: 100 },
} as const

// Suggestions par page
export const SUGGESTIONS: Record<string, string[]> = {
  home: [
    'Quelle brique pour moi ?',
    'Comment ça marche ?',
    'Combien ça coûte ?',
  ],
  macaution: [
    'Comment récupérer ma caution ?',
    'Quels délais pour le bailleur ?',
    'Que vérifie exactement MACAUTION ?',
  ],
  monloyer: [
    'Ma ville est-elle concernée ?',
    'Comment fonctionne l\'encadrement ?',
    'Que faire si mon loyer dépasse ?',
  ],
  retraitia: [
    'Comment lire mon relevé de carrière ?',
    'Quelles erreurs sont fréquentes ?',
    'Que vérifie exactement RETRAITIA ?',
  ],
  mataxe: [
    'C\'est quoi la base nette ?',
    'Où trouver le taux communal ?',
    'Que vérifie exactement MATAXE ?',
  ],
  mapension: [
    'Comment est revalorisée la pension ?',
    'Qu\'est-ce que l\'indice INSEE ?',
    'Et si l\'ex-conjoint refuse ?',
  ],
  mabanque: [
    'Quels frais sont plafonnés ?',
    'C\'est quoi le statut fragile ?',
    'Comment contester mes frais ?',
  ],
  monimpot: [
    'Quand les frais reels sont-ils avantageux ?',
    "C'est quoi la case T ?",
    'Comment corriger ma declaration ?',
  ],
  monchomage: [
    'Comment est calculée l\'ARE ?',
    'Qu\'est-ce que le SJR ?',
    'Comment contester auprès de France Travail ?',
  ],
  'mon-espace': [
    'Où en est ma démarche ?',
    'Comment envoyer la lettre ?',
    'Quelle autre brique me recommandez-vous ?',
  ],
}

// Welcome messages
export const WELCOME: Record<string, string> = {
  home: 'Bonjour ! 👋 Je suis votre conseiller RÉCUPÉO. Décrivez-moi votre situation et je vous orienterai vers le bon service.',
  macaution: 'Bonjour ! Je peux vous aider à comprendre comment récupérer votre dépôt de garantie. Posez-moi vos questions.',
  monloyer: 'Bonjour ! Je suis là pour vous aider avec l\'encadrement des loyers. Quelle est votre question ?',
  retraitia: 'Bonjour ! Je peux vous aider à comprendre votre relevé de carrière et les erreurs possibles sur votre pension.',
  mataxe: 'Bonjour ! Je suis là pour vous aider avec votre taxe foncière. Posez-moi vos questions sur le formulaire ou les anomalies.',
  mapension: 'Bonjour ! Je peux vous aider à comprendre la revalorisation de votre pension alimentaire.',
  mabanque: 'Bonjour ! Je suis là pour vous aider avec vos frais bancaires. Quels frais souhaitez-vous vérifier ?',
  monimpot: 'Bonjour ! Je suis la pour vous aider avec votre declaration de revenus. Posez-moi vos questions sur les deductions et reductions d\'impot.',
  monchomage: 'Bonjour ! Je peux vous aider à comprendre le calcul de vos allocations chômage.',
  'mon-espace': 'Bonjour ! Comment puis-je vous aider avec vos démarches en cours ?',
}
