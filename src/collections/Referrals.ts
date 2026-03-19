import type { CollectionConfig } from 'payload'

export const Referrals: CollectionConfig = {
  slug: 'referrals',
  admin: { useAsTitle: 'referrerCode' },
  fields: [
    { name: 'referrerCode', type: 'text', required: true, index: true, label: 'Code parrain' },
    { name: 'referrerEmail', type: 'email', required: true },
    { name: 'referredEmail', type: 'email', label: 'Email filleul' },
    { name: 'referredBrique', type: 'text', label: 'Brique du filleul' },
    { name: 'status', type: 'select', defaultValue: 'pending', options: [
      { label: 'En attente', value: 'pending' },
      { label: 'Converti', value: 'converted' },
      { label: 'Crédité', value: 'credited' },
    ], admin: { position: 'sidebar' } },
    { name: 'creditAmount', type: 'number', defaultValue: 0, label: 'Crédit attribué (€)' },
    { name: 'convertedAt', type: 'date' },
  ],
  timestamps: true,
}
