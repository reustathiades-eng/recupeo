import type { CollectionConfig } from 'payload'

/**
 * Collection des leads flash RETRAITIA.
 * Stocke les résultats du mini-diagnostic gratuit (4 questions + email).
 * Sert de point d'entrée du funnel : flash → 9€ → 49€
 */
export const RetraitiaFlash: CollectionConfig = {
  slug: 'retraitia-flash',
  admin: {
    useAsTitle: 'email',
    group: 'RETRAITIA',
    description: 'Leads du mini-diagnostic flash (gratuit)',
  },
  fields: [
    // ─── Contact ───
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users' },

    // ─── 4 questions du flash ───
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Retraité', value: 'retired' },
        { label: 'Pré-retraité', value: 'pre_retired' },
        { label: 'Conjoint survivant', value: 'surviving' },
      ],
    },
    { name: 'birthYear', type: 'number', required: true, min: 1930, max: 2000 },
    { name: 'childrenCount', type: 'number', required: true, min: 0, max: 20 },
    {
      name: 'careerType',
      type: 'select',
      required: true,
      options: [
        { label: 'Salarié du privé (carrière simple)', value: 'simple_prive' },
        { label: 'Fonctionnaire', value: 'simple_public' },
        { label: 'Indépendant', value: 'independant' },
        { label: 'Carrière mixte (plusieurs régimes)', value: 'mixte' },
        { label: 'Agriculteur', value: 'agricole' },
        { label: 'Profession libérale', value: 'liberal' },
      ],
    },

    // ─── Résultat du flash ───
    {
      name: 'riskLevel',
      type: 'select',
      options: [
        { label: 'Faible', value: 'FAIBLE' },
        { label: 'Modéré', value: 'MODERE' },
        { label: 'Élevé', value: 'ELEVE' },
        { label: 'Très élevé', value: 'TRES_ELEVE' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'riskScore', type: 'number', min: 0, max: 100, admin: { position: 'sidebar' } },
    { name: 'riskFactors', type: 'json', label: 'Facteurs de risque détectés' },

    // ─── Conversion ───
    { name: 'convertedToDossier', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'dossierId', type: 'text', label: 'ID dossier créé', admin: { position: 'sidebar' } },

    // ─── Partage social ───
    { name: 'sharedVia', type: 'select', options: [
      { label: 'Facebook', value: 'facebook' },
      { label: 'WhatsApp', value: 'whatsapp' },
      { label: 'Email', value: 'email' },
      { label: 'Lien copié', value: 'link' },
    ]},

    // ─── Tracking ───
    { name: 'source', type: 'text', label: 'Source (utm_source)' },
    { name: 'medium', type: 'text', label: 'Medium (utm_medium)' },
    { name: 'campaign', type: 'text', label: 'Campaign (utm_campaign)' },
    { name: 'referralCode', type: 'text', label: 'Code parrainage' },

    // ─── Emails Brevo ───
    { name: 'brevoContactId', type: 'text' },
    { name: 'emailSequenceStep', type: 'number', defaultValue: 0, label: 'Étape séquence S1' },
    { name: 'unsubscribed', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
}
