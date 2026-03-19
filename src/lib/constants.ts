export const SITE = {
  name: 'RÉCUPÉO',
  domain: 'recupeo.fr',
  tagline: 'Uploadez. Vérifiez. Récupérez.',
  description: "L'IA qui récupère ce qu'on vous doit.",
  email: 'contact@recupeo.fr',
} as const

export type Brique = {
  id: string; icon: string; name: string; label: string; desc: string; tag: string; enjeu: string; ticket: string; available: boolean; url: string
}

const CDN = 'https://cdn2.tendance-parfums.com/media/tmp/catalog/product'

export const BRIQUES: Brique[] = [
  { id: 'macaution', icon: `${CDN}/m/a/macaution.png`, name: 'Ma Caution', label: 'Dépôt de garantie', desc: 'Récupérez votre caution retenue abusivement', tag: 'Disponible', enjeu: '500–1 500€', ticket: '29–49€', available: true, url: '/macaution' },
  { id: 'monloyer', icon: `${CDN}/m/o/monloyer.png`, name: 'Mon Loyer', label: 'Encadrement loyers', desc: 'Vérifiez si votre loyer dépasse le plafond légal', tag: 'Gratuit', enjeu: '2 500–3 300€', ticket: 'Gratuit', available: true, url: '/monloyer' },
  { id: 'retraitia', icon: `${CDN}/m/a/maretraite.png`, name: 'Ma Retraite', label: 'Pension retraite', desc: '10-14% des pensions comportent une erreur', tag: 'Disponible', enjeu: '2 460–20 000€+', ticket: '79–199€', available: true, url: '/retraitia' },
  { id: 'mataxe', icon: `${CDN}/m/a/mataxe.png`, name: 'Ma Taxe', label: 'Taxe foncière', desc: '15-20% des avis contiennent une anomalie', tag: 'M2', enjeu: '200–2 000€', ticket: '49€', available: true, url: '/mataxe' },
  { id: 'mapension', icon: `${CDN}/m/a/mapension.png`, name: 'Ma Pension', label: 'Pension alimentaire', desc: 'Revalorisation oubliée = arriérés récupérables', tag: 'Disponible', enjeu: '900–1 200€', ticket: '29–49€', available: true, url: '/mapension' },
  { id: 'monchomage', icon: `${CDN}/m/o/monchomage.png`, name: 'Mon Chômage', label: 'Allocation chômage', desc: 'Vérifiez le calcul de votre ARE', tag: 'Disponible', enjeu: '500–3 000€', ticket: '69–129€', available: true, url: '/monchomage' },
  { id: 'mabanque', icon: `${CDN}/m/a/mabanque.png`, name: 'Ma Banque', label: 'Frais bancaires', desc: '17% des banques en infraction sur les plafonds', tag: 'Disponible', enjeu: '200–960€', ticket: '19–29€', available: true, url: '/mabanque' },
  { id: 'mesdroits', icon: `${CDN}/m/e/mesdroits.png`, name: 'Mes Droits', label: 'Aides sociales', desc: "10 milliards €/an d'aides non réclamées", tag: 'M3', enjeu: 'Variable', ticket: '19–49€', available: false, url: '/mesdroits' },
  { id: 'monimpot', icon: `${CDN}/m/o/monimpot.png`, name: 'Mon Impôt', label: 'Déclaration revenus', desc: '69% des foyers ratent des réductions fiscales', tag: 'Disponible', enjeu: '500–6 000€', ticket: '39–79€', available: true, url: '/monimpot' },
  { id: 'mapaie', icon: `${CDN}/m/a/mapaie.png`, name: 'Ma Paie', label: 'Bulletins de paie', desc: '33% des salariés ont subi une erreur de paie', tag: 'M5', enjeu: '1 800–7 200€', ticket: '49–129€', available: false, url: '/mapaie' },
  { id: 'mondepart', icon: `${CDN}/m/o/mondepart.png`, name: 'Mon Départ', label: 'Solde de tout compte', desc: '30% des soldes contiennent des erreurs', tag: 'M5', enjeu: '1 000–5 000€', ticket: '69–199€', available: false, url: '/mondepart' },
  { id: 'mondpe', icon: `${CDN}/m/o/mondpe.png`, name: 'Mon DPE', label: 'Audit DPE', desc: '71% des DPE ne sont pas corrects', tag: 'M5', enjeu: 'Décote 15-20%', ticket: '39–49€', available: false, url: '/mondpe' },
  { id: 'monassurance', icon: `${CDN}/m/o/monassurance.png`, name: 'Mon Assurance', label: 'Assurance emprunteur', desc: 'Changez et économisez grâce à la loi Lemoine', tag: 'M6', enjeu: '5 000–15 000€', ticket: 'Gratuit', available: false, url: '/monassurance' },
  { id: 'monpret', icon: `${CDN}/m/o/monpret.png`, name: 'Mon Prêt', label: 'TAEG crédit immobilier', desc: 'Vérifiez la conformité de votre taux', tag: 'M6', enjeu: '5 000–100 000€+', ticket: '79€', available: false, url: '/monpret' },
]

export const STATS = [
  { value: '10-14%', label: 'des pensions de retraite erronées', source: 'Cour des Comptes' },
  { value: '33%', label: 'des salariés avec erreur de paie', source: 'IFOP/Securex' },
  { value: '10 Mds€', label: "d'aides non réclamées chaque année", source: 'DREES' },
  { value: '71%', label: 'des DPE incorrects', source: 'Hello Watt' },
] as const

export const PRICING = {
  free: { name: 'Gratuit', price: '0€', period: '', description: 'Pré-diagnostic instantané', features: ['1 pré-diagnostic par rubrique', "Nombre d'anomalies détectées", 'Estimation du montant récupérable', 'Résultat en 30 secondes'], cta: 'Essayer gratuitement', featured: false },
  premium: { name: 'Premium', price: '6,90€', period: '/mois', yearlyPrice: '59€/an', yearlySaving: '29%', description: 'Accès complet', features: ['Diagnostics illimités', 'Rapports complets détaillés', 'Courriers pré-remplis', 'Alertes personnalisées', 'Cross-sell aides sociales inclus'], cta: 'Commencer maintenant →', featured: true },
  premiumPlus: { name: 'Premium+', price: '14,90€', period: '/mois', yearlyPrice: '129€/an', yearlySaving: '28%', description: 'Tout automatisé', features: ['Tout Premium inclus', 'Audits mensuels automatiques', 'Pack démarches complet', 'Suivi dossier en cours', 'Support prioritaire'], cta: 'Choisir Premium+ →', featured: false },
} as const

export const STEPS = [
  { num: '1', title: 'Uploadez', desc: "Déposez votre document : état des lieux, bulletin de paie, avis d'imposition, relevé de pension...", color: 'emerald' },
  { num: '2', title: "L'IA analyse", desc: 'Notre IA croise vos données avec le droit français, les barèmes officiels et les grilles légales en vigueur.', color: 'blue' },
  { num: '3', title: 'Récupérez', desc: 'Recevez votre rapport détaillé avec le montant récupérable et les courriers pré-remplis prêts à envoyer.', color: 'emerald' },
] as const
