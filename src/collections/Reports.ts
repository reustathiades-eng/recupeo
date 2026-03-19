import type { CollectionConfig } from 'payload'
export const Reports: CollectionConfig = {
  slug: 'reports', admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'diagnostic', type: 'relationship', relationTo: 'diagnostics', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'reportContent', type: 'json' },
    { name: 'generatedLetters', type: 'json' },
  ],
  timestamps: true,
}
