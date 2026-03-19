// ============================================================
// MATAXE — Générateur de lettre de demande du formulaire 6675-M
// ============================================================

/**
 * Génère le message à envoyer via impots.gouv.fr (messagerie sécurisée)
 * pour demander la fiche d'évaluation cadastrale.
 */
export function generateDemandeMessage(commune: string): string {
  return `Madame, Monsieur,

Propriétaire d'un bien immobilier situé sur la commune de ${commune}, je souhaite obtenir la fiche d'évaluation détaillée de ma propriété bâtie (formulaire 6675-M / fiche de calcul de la valeur locative cadastrale).

Ce document m'est nécessaire afin de vérifier les éléments pris en compte dans le calcul de ma taxe foncière, notamment la surface pondérée, la catégorie cadastrale, le coefficient d'entretien et les équivalences superficielles.

Conformément à l'article L311-1 du Code des relations entre le public et l'administration, et à l'article L104 du Livre des procédures fiscales, je vous remercie de bien vouloir me communiquer ce document dans les meilleurs délais.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`
}

/**
 * Génère le texte de la lettre LRAR pour demande par courrier.
 */
export function generateDemandeCourrier(commune: string): string {
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `[VOS NOM ET PRÉNOM]
[VOTRE ADRESSE COMPLÈTE]

                                        Service des Impôts des Particuliers
                                        Centre des Impôts Fonciers
                                        de ${commune}

                                        ${commune}, le ${date}

Objet : Demande de communication de la fiche d'évaluation cadastrale (formulaire 6675-M)

Lettre recommandée avec accusé de réception

Madame, Monsieur,

Propriétaire d'un bien immobilier situé sur la commune de ${commune}, je souhaite obtenir la fiche d'évaluation détaillée de ma propriété bâtie (formulaire 6675-M), conformément aux dispositions de l'article L311-1 du Code des relations entre le public et l'administration et de l'article L104 du Livre des procédures fiscales.

Ce document m'est nécessaire afin de vérifier les paramètres retenus pour le calcul de la valeur locative cadastrale de mon bien : surface pondérée, catégorie, coefficient d'entretien, coefficient de situation et équivalences superficielles des équipements.

Je vous remercie de bien vouloir me communiquer ce document dans les meilleurs délais.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.


[SIGNATURE]
[VOS NOM ET PRÉNOM]

Pièce jointe : copie de la pièce d'identité`
}

/**
 * Les 3 méthodes pour obtenir le 6675-M.
 */
export interface Methode6675M {
  title: string
  icon: string
  duration: string
  steps: string[]
  tip: string
}

export function getMethods6675M(commune: string): Methode6675M[] {
  return [
    {
      title: 'En ligne (recommandé)',
      icon: '💻',
      duration: '2 minutes + 2-4 semaines de délai',
      steps: [
        'Connectez-vous sur impots.gouv.fr avec vos identifiants',
        'Cliquez sur "Messagerie sécurisée" (icône enveloppe)',
        'Sélectionnez "Écrire" → "Je pose une autre question"',
        'Sélectionnez "Impôts locaux" comme thème',
        'Collez le message pré-rédigé ci-dessous',
        'Envoyez',
      ],
      tip: 'C\'est la méthode la plus rapide. Réponse sous 2 à 4 semaines par messagerie sécurisée.',
    },
    {
      title: 'Au guichet',
      icon: '🏢',
      duration: 'Immédiat (si disponible) ou 1-2 semaines',
      steps: [
        `Rendez-vous au centre des impôts fonciers de ${commune}`,
        'Munissez-vous de votre pièce d\'identité et de votre dernier avis de taxe foncière',
        'Demandez "la fiche d\'évaluation cadastrale de mon bien" (formulaire 6675-M)',
        'L\'agent peut vous le fournir sur place ou vous l\'envoyer sous 1-2 semaines',
      ],
      tip: 'Utile si vous préférez un contact direct. Certains centres le fournissent immédiatement.',
    },
    {
      title: 'Par courrier LRAR',
      icon: '📮',
      duration: '3-6 semaines',
      steps: [
        'Imprimez la lettre pré-rédigée ci-dessous',
        'Complétez vos nom, adresse et signez',
        `Envoyez en recommandé AR au Service des Impôts des Particuliers de ${commune}`,
        'Joignez une copie de votre pièce d\'identité',
        'Conservez l\'accusé de réception',
      ],
      tip: 'En dernier recours. Le recommandé crée une obligation légale de réponse sous 1 mois (art. L114-3 CRPA).',
    },
  ]
}
