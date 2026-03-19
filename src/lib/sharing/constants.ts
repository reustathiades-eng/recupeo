// ============================================================
// RÉCUPÉO — Sharing Constants (canaux + messages par brique)
// ============================================================

import { fmt } from '@/lib/format'

export const BRIQUE_SHARE_LABELS: Record<string, string> = {
  macaution: 'mon dépôt de garantie',
  monloyer: 'mon loyer',
  retraitia: 'ma pension de retraite',
  mataxe: 'ma taxe foncière',
  mapension: 'ma pension alimentaire',
  mabanque: 'mes frais bancaires',
  monchomage: 'mes allocations chômage',
}

/**
 * Arrondit à la centaine inférieure (847€ → "plus de 800€")
 */
export function anonymizeMontant(montant: number): string {
  if (montant < 100) return `${Math.floor(montant / 10) * 10}€`
  const rounded = Math.floor(montant / 100) * 100
  return `plus de ${fmt(rounded)} €`
}

export function getShareMessage(
  channel: 'whatsapp' | 'facebook' | 'email' | 'twitter' | 'linkedin' | 'copy',
  brique: string,
  montant: number,
  shareUrl: string,
): string {
  const label = BRIQUE_SHARE_LABELS[brique] || 'mes finances'
  const anon = anonymizeMontant(montant)

  const messages: Record<string, string> = {
    whatsapp: `J'ai fait vérifier ${label} sur recupeo.fr et ils ont détecté ${anon} de trop-perçu ! Ça prend 2 min, essaie : ${shareUrl}`,
    facebook: `RÉCUPÉO vient de détecter ${anon} de trop-perçu sur ${label}. Si vous aussi vous payez trop, vérifiez gratuitement 👉 ${shareUrl}`,
    email: `Salut,\n\nJe viens de découvrir que je payais trop pour ${label}. RÉCUPÉO a détecté ${anon} de trop-perçu en 2 minutes.\n\nVérifie ta situation gratuitement : ${shareUrl}\n\nÀ bientôt !`,
    twitter: `${anon} de trop-perçu détectés sur ${label} par @recupeo_fr ! Vérifiez gratuitement 👉 ${shareUrl} #droitsduconsommateur`,
    linkedin: `J'ai utilisé RÉCUPÉO pour vérifier ${label}. Résultat : ${anon} de trop-perçu détectés. Un service utile pour les particuliers. ${shareUrl}`,
    copy: `RÉCUPÉO a détecté ${anon} de trop-perçu sur ${label}. Vérifie gratuitement : ${shareUrl}`,
  }

  return messages[channel] || messages.copy
}

export function getShareUrl(channel: string, shareUrl: string, message: string): string {
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(message)}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    case 'email':
      return `mailto:?subject=${encodeURIComponent('Découvre RÉCUPÉO — récupère ton argent')}&body=${encodeURIComponent(message)}`
    default:
      return shareUrl
  }
}

export const SHARE_CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600' },
  { id: 'facebook', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'email', label: 'Email', color: 'bg-slate-600 hover:bg-slate-700' },
  { id: 'twitter', label: 'X', color: 'bg-black hover:bg-gray-800' },
  { id: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800' },
  { id: 'copy', label: 'Copier', color: 'bg-navy/80 hover:bg-navy' },
] as const
