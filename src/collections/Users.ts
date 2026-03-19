import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [
    // ─── Identité ───
    { name: 'firstName', type: 'text', label: 'Prénom' },
    { name: 'lastName', type: 'text', label: 'Nom' },
    { name: 'plan', type: 'select', label: 'Abonnement', defaultValue: 'free', options: [
      { label: 'Gratuit', value: 'free' },
      { label: 'Premium', value: 'premium' },
      { label: 'Premium+', value: 'premium_plus' },
    ]},
    { name: 'diagnosticsUsed', type: 'number', label: 'Diagnostics utilisés', defaultValue: 0, admin: { position: 'sidebar' } },

    // ─── Magic Link Auth ───
    { name: 'magicLinkToken', type: 'text', label: 'Token magic link (hash)', admin: { position: 'sidebar', readOnly: true } },
    { name: 'magicLinkExpiry', type: 'date', label: 'Expiration magic link', admin: { position: 'sidebar', readOnly: true } },
    { name: 'lastLoginAt', type: 'date', label: 'Dernière connexion', admin: { position: 'sidebar', readOnly: true } },

    // ─── Profil (pour recommandations cross-sell) ───
    {
      name: 'profile',
      type: 'group',
      label: 'Profil utilisateur',
      fields: [
        { name: 'isOwner', type: 'checkbox', label: 'Propriétaire', defaultValue: false },
        { name: 'isTenant', type: 'checkbox', label: 'Locataire', defaultValue: false },
        { name: 'isRetired', type: 'checkbox', label: 'Retraité(e)', defaultValue: false },
        { name: 'isEmployee', type: 'checkbox', label: 'Salarié(e)', defaultValue: false },
        { name: 'isJobSeeker', type: 'checkbox', label: 'Demandeur d\'emploi', defaultValue: false },
        { name: 'isDivorced', type: 'checkbox', label: 'Divorcé(e)', defaultValue: false },
      ],
    },

    // ─── Parrainage ───
    { name: 'referralCode', type: 'text', label: 'Code parrain', unique: true, admin: { position: 'sidebar' } },
    { name: 'referralCredits', type: 'number', label: 'Crédits parrainage (€)', defaultValue: 0, admin: { position: 'sidebar' } },

    // ─── Notifications ───
    {
      name: 'notifications',
      type: 'group',
      label: 'Préférences notifications',
      fields: [
        { name: 'reminders', type: 'checkbox', label: 'Rappels démarches', defaultValue: true },
        { name: 'newBriques', type: 'checkbox', label: 'Nouvelles briques', defaultValue: true },
        { name: 'annualAlerts', type: 'checkbox', label: 'Alertes annuelles', defaultValue: true },
        { name: 'newsletter', type: 'checkbox', label: 'Newsletter', defaultValue: false },
      ],
    },

    // ─── RGPD ───
    { name: 'consentAt', type: 'date', label: 'Date consentement' },
    { name: 'deletionRequestedAt', type: 'date', label: 'Suppression demandée', admin: { position: 'sidebar' } },
  ],
}
