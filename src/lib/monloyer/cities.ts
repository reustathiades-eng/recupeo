// ============================================================
// MONLOYER — 69 communes éligibles (9 territoires)
// Données encadrement des loyers France 2026
// ============================================================
import type { Territory, TerritoryInfo, EligibleCity } from './types'

// ─── URLs des simulateurs officiels ───

const SIMULATORS: Record<Territory, string> = {
  paris: 'https://www.paris.fr/pages/l-encadrement-des-loyers-parisiens-en-vigueur-le-1er-juillet-5730',
  lille: 'https://www.ecologie.gouv.fr/encadrement-des-loyers',
  plaine_commune: 'https://plainecommune-leloyer.fr/',
  lyon_villeurbanne: 'https://www.grandlyon.com/services/encadrement-des-loyers',
  est_ensemble: 'https://loyer.estensemble.fr/',
  montpellier: 'https://www.montpellier3m.fr/encadrement-loyers',
  bordeaux: 'https://www.bordeaux-metropole.fr/encadrement-des-loyers',
  pays_basque: 'https://www.communaute-paysbasque.fr/vivre-ici/habitat-urbanisme/encadrement-des-loyers',
  grenoble: 'https://www.grenoblealpesmetropole.fr/907-encadrement-des-loyers.htm',
}

// ─── 9 territoires ───

export const TERRITORIES: TerritoryInfo[] = [
  {
    id: 'paris',
    label: 'Paris',
    since: '2019-07',
    cities: ['Paris'],
    simulatorUrl: SIMULATORS.paris,
  },
  {
    id: 'lille',
    label: 'Lille Métropole',
    since: '2020-03',
    cities: ['Lille', 'Hellemmes', 'Lomme'],
    simulatorUrl: SIMULATORS.lille,
  },
  {
    id: 'plaine_commune',
    label: 'Plaine Commune',
    since: '2021-06',
    cities: [
      'Aubervilliers', 'Épinay-sur-Seine', "L'Île-Saint-Denis",
      'La Courneuve', 'Pierrefitte-sur-Seine', 'Saint-Denis',
      'Saint-Ouen-sur-Seine', 'Stains', 'Villetaneuse',
    ],
    simulatorUrl: SIMULATORS.plaine_commune,
  },
  {
    id: 'lyon_villeurbanne',
    label: 'Lyon et Villeurbanne',
    since: '2021-11',
    cities: ['Lyon', 'Villeurbanne'],
    simulatorUrl: SIMULATORS.lyon_villeurbanne,
  },
  {
    id: 'est_ensemble',
    label: 'Est Ensemble',
    since: '2021-12',
    cities: [
      'Bagnolet', 'Bobigny', 'Bondy', 'Le Pré-Saint-Gervais',
      'Les Lilas', 'Montreuil', 'Noisy-le-Sec', 'Pantin', 'Romainville',
    ],
    simulatorUrl: SIMULATORS.est_ensemble,
  },
  {
    id: 'montpellier',
    label: 'Montpellier',
    since: '2022-07',
    cities: ['Montpellier'],
    simulatorUrl: SIMULATORS.montpellier,
  },
  {
    id: 'bordeaux',
    label: 'Bordeaux',
    since: '2022-07',
    cities: ['Bordeaux'],
    simulatorUrl: SIMULATORS.bordeaux,
  },
  {
    id: 'pays_basque',
    label: 'Pays Basque',
    since: '2024-11',
    cities: [
      'Anglet', 'Arbonne', 'Arcangues', 'Bassussarry', 'Bayonne',
      'Biarritz', 'Bidart', 'Biriatou', 'Boucau', 'Ciboure',
      'Guéthary', 'Hendaye', 'Jatxou', 'Lahonce', 'Larressore',
      'Mouguerre', 'Saint-Jean-de-Luz', 'Saint-Pierre-d\'Irube',
      'Urrugne', 'Ustaritz', 'Villefranque', 'Ahetze', 'Ascain', 'Hasparren',
    ],
    simulatorUrl: SIMULATORS.pays_basque,
  },
  {
    id: 'grenoble',
    label: 'Grenoble Métropole',
    since: '2025-01',
    cities: [
      'Grenoble', 'Échirolles', 'Fontaine', 'Gières', 'La Tronche',
      'Le Pont-de-Claix', 'Meylan', 'Saint-Égrève', 'Saint-Martin-d\'Hères',
      'Saint-Martin-le-Vinoux', 'Sassenage', 'Seyssinet-Pariset', 'Seyssins',
      'Claix', 'Corenc', 'Domène', 'Eybens', 'Fontanil-Cornillon',
      'Noyarey', 'Poisat', 'Vif',
    ],
    simulatorUrl: SIMULATORS.grenoble,
  },
]

// ─── Construire la liste plate des 69 communes ───

function buildCitiesList(): EligibleCity[] {
  const cities: EligibleCity[] = []
  for (const t of TERRITORIES) {
    for (const cityName of t.cities) {
      cities.push({
        name: cityName,
        slug: cityName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
        territory: t.id,
        since: t.since,
        simulatorUrl: t.simulatorUrl,
      })
    }
  }
  return cities.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export const ELIGIBLE_CITIES: EligibleCity[] = buildCitiesList()

// ─── Recherche ───

/** Recherche une commune par nom (insensible à la casse et aux accents) */
export function findCity(input: string): EligibleCity | undefined {
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const needle = normalize(input)
  return ELIGIBLE_CITIES.find(c => normalize(c.name) === needle)
}

/** Retourne les communes dont le nom commence par la saisie (pour autocomplete) */
export function searchCities(input: string, limit = 10): EligibleCity[] {
  if (!input || input.length < 2) return []
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const needle = normalize(input)
  return ELIGIBLE_CITIES
    .filter(c => normalize(c.name).includes(needle))
    .slice(0, limit)
}

/** Retourne les infos du territoire d'une commune */
export function getTerritoryForCity(cityName: string): TerritoryInfo | undefined {
  const city = findCity(cityName)
  if (!city) return undefined
  return TERRITORIES.find(t => t.id === city.territory)
}
