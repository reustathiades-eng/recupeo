'use client'

/**
 * Badges de confiance — à utiliser sur toutes les pages brique.
 */
export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6">
      {BADGES.map((badge, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-slate-muted">
          <span className="text-base">{badge.icon}</span>
          <span className="font-medium">{badge.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Version compacte pour sous les CTA de formulaire.
 */
export function TrustBadgesCompact() {
  return (
    <p className="text-xs text-slate-muted text-center mt-4 flex flex-wrap items-center justify-center gap-3">
      <span>🔒 Données chiffrées</span>
      <span className="text-slate-border">·</span>
      <span>🤖 IA anonymisée</span>
      <span className="text-slate-border">·</span>
      <span>🇫🇷 Serveur en France</span>
      <span className="text-slate-border">·</span>
      <span>❌ Aucun spam</span>
    </p>
  )
}

/**
 * Bannière de réassurance complète — pour les pages brique.
 */
export function TrustBanner() {
  return (
    <section className="py-12 bg-white border-t border-slate-border">
      <div className="max-w-[900px] mx-auto px-6">
        <h3 className="font-heading text-lg font-bold text-slate-text text-center mb-8">
          Vos données sont protégées
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald/10 flex items-center justify-center text-xl mx-auto mb-3">
                {item.icon}
              </div>
              <div className="font-semibold text-slate-text text-sm mb-1">{item.title}</div>
              <p className="text-xs text-slate-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Disclaimer juridique — obligatoire en bas de chaque page brique.
 */
export function LegalDisclaimer({ brique }: { brique?: string }) {
  return (
    <section className="py-8 bg-slate-bg border-t border-slate-border">
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <p className="text-xs text-slate-muted leading-relaxed">
          ⚖️ <strong>Avertissement :</strong> Ce service est un outil d&apos;aide. Il ne constitue
          pas un avis juridique et ne remplace pas un avocat. Calculs basés sur le droit français en vigueur
          {brique === 'macaution' && ' (loi 89-462, loi ALUR, grille FNAIM)'}
          {brique === 'retraitia' && ' (Code de la sécurité sociale, art. L351-1 et suivants, relevé de carrière CNAV)'}
          {brique === 'monloyer' && ' (loi ALUR, loi ELAN, loi 89-462 art. 17)'}
          {brique === 'mataxe' && ' (CGI art. 1380-1508, BOI-IF-TFB). Cette analyse est basée sur des estimations et ne constitue pas un avis fiscal. Les résultats dépendent de la précision des informations fournies et des moyennes nationales utilisées.'}
          {brique === 'mapension' && ' (Code civil art. 208-211, art. 371-2, art. 2224 prescription quinquennale, indices INSEE)'}. RÉCUPÉO ne peut être tenu
          responsable de l&apos;utilisation des résultats.
        </p>
        <p className="text-[10px] text-slate-muted/60 mt-3">
          Données personnelles anonymisées avant envoi à l&apos;IA, jamais partagées avec des tiers.
          Traitement conforme au RGPD. Hébergement OVH, France.
          Suppression sur demande : <a href="mailto:contact@recupeo.fr" className="underline">contact@recupeo.fr</a>
        </p>
      </div>
    </section>
  )
}

const BADGES = [
  { icon: '🔒', label: 'Connexion chiffrée SSL' },
  { icon: '🤖', label: 'IA anonymisée (RGPD)' },
  { icon: '🇫🇷', label: 'Hébergé en France (OVH)' },
  { icon: '💳', label: 'Paiement sécurisé Stripe' },
  { icon: '🔄', label: 'Satisfait ou remboursé 14j' },
]

const TRUST_ITEMS = [
  {
    icon: '🔒',
    title: 'Données anonymisées',
    desc: "Vos infos personnelles sont remplacées par des tokens avant envoi à l'IA. Elle ne voit jamais vos données réelles.",
  },
  {
    icon: '🇫🇷',
    title: 'Serveur en France',
    desc: 'Données stockées sur serveur OVH en France, soumis au droit français et au RGPD.',
  },
  {
    icon: '⚖️',
    title: 'Droit français à jour',
    desc: 'Calculs basés sur les textes de loi en vigueur, barèmes officiels et jurisprudence récente.',
  },
  {
    icon: '🚫',
    title: 'Zéro spam',
    desc: "Votre email sert uniquement à recevoir votre diagnostic. Aucune revente, aucun spam.",
  },
]
