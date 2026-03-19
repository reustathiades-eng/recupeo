import type { CollectionConfig } from 'payload'

/**
 * Collection des dossiers clients RETRAITIA.
 * Cœur de l'application : contient le formulaire, les documents,
 * le diagnostic, le suivi des démarches, les paiements.
 * Créé au paiement du 9€ (via webhook Stripe).
 */
export const RetraitiaDossiers: CollectionConfig = {
  slug: 'retraitia-dossiers',
  admin: {
    useAsTitle: 'clientName',
    group: 'RETRAITIA',
    description: 'Dossiers clients RETRAITIA (post-paiement 9€)',
  },
  fields: [
    // ─── Identité & Relations ───
    { name: 'user', type: 'relationship', relationTo: 'users', index: true },
    { name: 'userEmail', type: 'email', required: true, index: true },
    { name: 'clientName', type: 'text', label: 'Nom du client (prénom + nom)' },
    { name: 'flashId', type: 'text', label: 'ID du lead flash d\'origine' },

    // ─── Parcours ───
    {
      name: 'parcours',
      type: 'select',
      required: true,
      defaultValue: 'retraite',
      options: [
        { label: 'Retraité actuel', value: 'retraite' },
        { label: 'Pré-retraité', value: 'preretraite' },
        { label: 'Réversion', value: 'reversion' },
      ],
    },

    // ─── Statut global ───
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'created',
      options: [
        { label: 'Créé', value: 'created' },
        { label: 'Collecte en cours', value: 'collecting' },
        { label: 'Documents complets', value: 'documents_complete' },
        { label: 'Extraction en cours', value: 'extracting' },
        { label: 'Extraction terminée', value: 'extracted' },
        { label: 'Analyse en cours', value: 'analyzing' },
        { label: 'Diagnostic prêt', value: 'diagnostic_ready' },
        { label: 'Rapport payé', value: 'report_paid' },
        { label: 'Rapport prêt', value: 'report_ready' },
        { label: 'Démarches en cours', value: 'actions_in_progress' },
        { label: 'Terminé', value: 'completed' },
      ],
      admin: { position: 'sidebar' },
    },

    // ─── Formulaire complémentaire (3 blocs / 16 questions) ───
    {
      name: 'formulaire',
      type: 'json',
      label: 'Formulaire complémentaire (RetraitiaFormData)',
    },
    { name: 'formulaireComplet', type: 'checkbox', defaultValue: false, label: 'Formulaire rempli' },

    // ─── Documents ───
    {
      name: 'documents',
      type: 'json',
      label: 'État des documents (DossierDocument[])',
    },

    // ─── Accès FranceConnect ───
    { name: 'franceConnectVerified', type: 'checkbox', defaultValue: false, label: 'Accès FranceConnect vérifié' },

    // ─── Données extraites ───
    {
      name: 'extractions',
      type: 'json',
      label: 'Données extraites (DossierExtractions)',
    },

    // ─── Résultat du moteur de calcul ───
    {
      name: 'calcul',
      type: 'json',
      label: 'Résultat moteur de calcul (CalculResult)',
    },

    // ─── Diagnostic ───
    {
      name: 'diagnostic',
      type: 'json',
      label: 'Résultat diagnostic (DiagnosticResult)',
    },
    {
      name: 'scoreGlobal',
      type: 'select',
      options: [
        { label: '🥉 Bronze', value: 'BRONZE' },
        { label: '🥈 Argent', value: 'ARGENT' },
        { label: '🥇 Or', value: 'OR' },
        { label: '💎 Platine', value: 'PLATINE' },
      ],
      admin: { position: 'sidebar' },
    },

    // ─── Impact financier (dénormalisé pour les requêtes) ───
    { name: 'nbAnomalies', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'impactMensuelMin', type: 'number', label: 'Impact min (€/mois)' },
    { name: 'impactMensuelMax', type: 'number', label: 'Impact max (€/mois)' },
    { name: 'precisionAudit', type: 'number', label: 'Précision audit (%)', min: 0, max: 100 },
    { name: 'seuilGratuit', type: 'checkbox', defaultValue: false, label: 'Impact < 30€/mois → rapport offert' },

    // ─── Suivi des démarches ───
    {
      name: 'demarches',
      type: 'json',
      label: 'Suivi des démarches (DemarcheTracking[])',
    },

    // ─── Messages générés ───
    {
      name: 'messages',
      type: 'json',
      label: 'Messages générés (GeneratedMessage[])',
    },

    // ─── Rapport PDF ───
    {
      name: 'rapport',
      type: 'group',
      label: 'Rapport PDF',
      fields: [
        { name: 'pdfUrl', type: 'text', label: 'URL du PDF' },
        { name: 'version', type: 'number', defaultValue: 0, label: 'Version du rapport' },
        { name: 'generatedAt', type: 'date', label: 'Généré le' },
        {
          name: 'variant',
          type: 'select',
          options: [
            { label: 'Retraité', value: 'retraite' },
            { label: 'Pré-retraité', value: 'preretraite' },
            { label: 'Réversion', value: 'reversion' },
          ],
        },
      ],
    },

    // ─── Paiements ───
    {
      name: 'paiements',
      type: 'json',
      label: 'Historique des paiements (PaymentRecord[])',
    },
    { name: 'pack9Paid', type: 'checkbox', defaultValue: false, label: 'Pack 9€ payé', admin: { position: 'sidebar' } },
    { name: 'pack9PaidAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'pack49Paid', type: 'checkbox', defaultValue: false, label: 'Pack 49€ payé', admin: { position: 'sidebar' } },
    { name: 'pack49PaidAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'stripeCustomerId', type: 'text' },

    // ─── Couple ───
    { name: 'coupleId', type: 'text', label: 'ID couple (lié à un autre dossier)', index: true },
    { name: 'couplePack', type: 'checkbox', defaultValue: false, label: 'Pack couple 79€' },

    // ─── Proche aidant ───
    {
      name: 'procheAidant',
      type: 'json',
      label: 'Proche aidant (ProcheAidant)',
    },

    // ─── Emails Brevo ───
    { name: 'brevoContactId', type: 'text' },
    { name: 'emailSequences', type: 'json', label: 'État des séquences email' },
    { name: 'unsubscribed', type: 'checkbox', defaultValue: false },

    // ─── Tracking ───
    { name: 'source', type: 'text' },
    { name: 'medium', type: 'text' },
    { name: 'campaign', type: 'text' },
  ],
  timestamps: true,
}
