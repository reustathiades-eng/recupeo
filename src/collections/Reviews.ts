import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: { useAsTitle: 'prenom' },
  fields: [
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'userId', type: 'text' },
    { name: 'diagnosticId', type: 'text' },
    { name: 'brique', type: 'select', required: true, options: [
      { label: 'MACAUTION', value: 'macaution' },
      { label: 'MONLOYER', value: 'monloyer' },
      { label: 'RETRAITIA', value: 'retraitia' },
      { label: 'MATAXE', value: 'mataxe' },
      { label: 'MAPENSION', value: 'mapension' },
      { label: 'MABANQUE', value: 'mabanque' },
      { label: 'MONCHOMAGE', value: 'monchomage' },
    ]},
    { name: 'note', type: 'number', required: true, min: 1, max: 5 },
    { name: 'commentaire', type: 'textarea', maxLength: 500 },
    { name: 'prenom', type: 'text', required: true },
    { name: 'ville', type: 'text' },
    { name: 'montantRecupere', type: 'number', label: 'Montant récupéré (€)' },
    { name: 'hasRecovered', type: 'select', defaultValue: 'pending', options: [
      { label: 'Oui', value: 'yes' },
      { label: 'En attente', value: 'pending' },
      { label: 'Pas encore', value: 'not_yet' },
      { label: 'Pas d\'anomalie', value: 'no_anomaly' },
    ]},
    { name: 'status', type: 'select', defaultValue: 'published', options: [
      { label: 'Publié', value: 'published' },
      { label: 'En attente', value: 'pending' },
      { label: 'Rejeté', value: 'rejected' },
      { label: 'Masqué', value: 'hidden' },
    ], admin: { position: 'sidebar' } },
    { name: 'isVerified', type: 'checkbox', defaultValue: false, label: 'Avis vérifié (achat)', admin: { position: 'sidebar' } },
    { name: 'source', type: 'select', defaultValue: 'manual', options: [
      { label: 'Email J+2', value: 'email_j2' },
      { label: 'Email J+30', value: 'email_j30' },
      { label: 'In-app', value: 'in_app' },
      { label: 'Manuel', value: 'manual' },
    ], admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}
