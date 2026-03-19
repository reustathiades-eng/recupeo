import type { CollectionConfig } from 'payload'

export const Diagnostics: CollectionConfig = {
  slug: 'diagnostics',
  admin: { useAsTitle: 'brique' },
  fields: [
    // ─── Relation user (enrichi) ───
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'userEmail', type: 'email', label: 'Email utilisateur', index: true },

    // ─── Brique ───
    { name: 'brique', type: 'select', required: true, options: [
      { label: 'MACAUTION', value: 'macaution' },
      { label: 'MONLOYER', value: 'monloyer' },
      { label: 'RETRAITIA', value: 'retraitia' },
      { label: 'MATAXE', value: 'mataxe' },
      { label: 'MAPENSION', value: 'mapension' },
      { label: 'MONCHÔMAGE', value: 'monchomage' },
      { label: 'MABANQUE', value: 'mabanque' },
      { label: 'MESDROITS', value: 'mesdroits' },
      { label: 'MONIMPÔT', value: 'monimpot' },
      { label: 'MAPAIE', value: 'mapaie' },
      { label: 'MONDÉPART', value: 'mondepart' },
      { label: 'MONDPE', value: 'mondpe' },
      { label: 'MONASSURANCE', value: 'monassurance' },
      { label: 'MONPRÊT', value: 'monpret' },
    ]},

    // ─── Statut étendu ───
    { name: 'status', type: 'select', defaultValue: 'pending', options: [
      { label: 'En attente', value: 'pending' },
      { label: 'Pré-diagnostic', value: 'pre_diagnostic' },
      { label: 'Payé', value: 'paid' },
      { label: 'Rapport généré', value: 'report_generated' },
      { label: 'Courriers générés', value: 'letters_generated' },
    ]},

    // ─── Résultats ───
    { name: 'anomaliesCount', type: 'number', defaultValue: 0 },
    { name: 'estimatedAmount', type: 'number', label: 'Montant estimé (€)' },
    { name: 'inputData', type: 'json' },
    { name: 'aiAnalysis', type: 'json' },
    { name: 'edlComparison', type: 'json' },

    // ─── Paiement ───
    { name: 'paid', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'paidAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'plan', type: 'text' },
    { name: 'stripeSessionId', type: 'text' },

    // ─── Suivi démarche (NOUVEAU) ───
    {
      name: 'demarche',
      type: 'group',
      label: 'Suivi de la démarche',
      fields: [
        { name: 'letterSentAt', type: 'date', label: 'Courrier envoyé le' },
        { name: 'responseReceivedAt', type: 'date', label: 'Réponse reçue le' },
        { name: 'responseType', type: 'select', label: 'Type de réponse', options: [
          { label: 'Acceptation totale', value: 'accepted_full' },
          { label: 'Acceptation partielle', value: 'accepted_partial' },
          { label: 'Refus', value: 'refused' },
          { label: 'Pas de réponse', value: 'no_response' },
        ]},
        { name: 'montantRecupere', type: 'number', label: 'Montant récupéré (€)' },
        { name: 'notes', type: 'textarea', label: 'Notes' },
      ],
    },

    // ─── Documents générés (NOUVEAU) ───
    { name: 'generatedPdfUrl', type: 'text', label: 'URL rapport PDF' },
    { name: 'generatedLettersUrl', type: 'text', label: 'URL courriers' },
  ],
  timestamps: true,
}
