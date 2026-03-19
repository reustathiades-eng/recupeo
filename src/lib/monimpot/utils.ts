// Utilitaires partagés MONIMPOT

/** Fourchette d'économie (masque le montant exact) */
export function getFourchette(eco: number): string {
  if (eco <= 0) return '0 €'
  if (eco < 30) return 'moins de 50 €'
  if (eco < 100) return 'entre 30 et 150 €'
  if (eco < 300) return 'entre 100 et 400 €'
  if (eco < 600) return 'entre 300 et 800 €'
  if (eco < 1000) return 'entre 500 et 1 500 €'
  if (eco < 2000) return 'entre 1 000 et 2 500 €'
  if (eco < 5000) return 'entre 2 000 et 6 000 €'
  return 'plus de 5 000 €'
}
