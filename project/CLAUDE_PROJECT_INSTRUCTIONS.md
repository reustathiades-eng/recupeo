# RÉCUPÉO — Brief Projet Claude Desktop

Tu es l'assistant développeur principal du projet RÉCUPÉO. Tu as accès au serveur de production via le connecteur MCP SSH "recupeo".

## Identité du projet

- **Nom** : RÉCUPÉO
- **Domaines** : recupeo.fr (principal) + recupeo.com (redirection)
- **Slogan** : "Uploadez. Vérifiez. Récupérez."
- **Positionnement** : "L'IA qui récupère ce qu'on vous doit."
- **Cible** : Particuliers français (salariés, retraités, locataires, propriétaires, contribuables)

## Serveur de production

- **Connecteur MCP** : `recupeo` (SSH)
- **IP** : 51.254.138.240
- **OS** : Ubuntu 25.04
- **User SSH** : ubuntu
- **App path** : `/var/www/recupeo`
- **Suivi projet** : `/var/www/recupeo/project/` (fichiers markdown de tracking)

## Stack technique

- **Framework** : Next.js 15.5.12 (App Router)
- **CMS / Admin** : Payload CMS 3.79.0 (intégré dans Next.js, admin sur /admin)
- **DB** : MongoDB 7.0.30 (local, port 27017)
- **Style** : Tailwind CSS 3.4 + design tokens custom (navy, emerald, slate)
- **Typos** : Bricolage Grotesque (headings) + DM Sans (body)
- **Process manager** : PM2 6.0.14
- **Reverse proxy** : Nginx 1.26.3 (port 80/443 -> localhost:3000)
- **SSL** : Certbot 2.11.0 (actif, renouvellement auto, recupeo.fr + recupeo.com)
- **IA** : Anthropic Claude API (actif, claude-sonnet-4)
- **Paiement** : Stripe (mode test, SDK v20.4.1)
- **Email** : Brevo (actif, domaine authentifié DKIM+DMARC+SPF)
- **Analytics** : Google Analytics 4 (G-89K2QXKP0R, 29+ événements)

## État au 16 mars 2026

### 5 briques en production
| # | Brique | URL | Ticket | Statut |
|---|--------|-----|--------|--------|
| 1 | MACAUTION | /macaution | 29€/49€ | Live, Stripe + Email + GA4 |
| 2 | RETRAITIA | /retraitia | 79€/149€/199€ | Live, Stripe + Email + GA4 |
| 3 | MONLOYER | /monloyer | Gratuit + 29€ | Live, Stripe + Email + GA4 |
| 4 | MATAXE | /mataxe | Gratuit + 49€ | Live, Stripe + Email + GA4 + Upload 6675-M V2 |
| 5 | MAPENSION | /mapension | Gratuit + 29€/49€ | Live, Stripe + GA4 |

### Infra opérationnelle
| Service | Statut | Détail |
|---------|--------|--------|
| **Brevo** (email) | Actif | 4 templates, envoi dans 3 routes API |
| **Stripe** (paiement) | Mode test | 5 paywalls, webhook OK, attend SIRET |
| **GA4** (analytics) | Actif | G-89K2QXKP0R, 29+ events, 5 briques |
| **Search Console** | Actif | Domaine vérifié, sitemap, 10 pages |
| **SSL/HTTPS** | Actif | Certbot, recupeo.fr + recupeo.com, redirect .com->.fr + www->nu |
| **Pages légales** | Live | /mentions-legales, /cgu, /confidentialite (Riom 63) |
| **SEO** | Live | robots.txt, sitemap.xml, JSON-LD FAQ 6 pages (5 briques + home) |
| **MongoDB** | Actif | Local port 27017 |
| **PM2** | Online | recupeo online |

### Infra business
| Élément | Statut |
|---------|--------|
| Micro-entreprise | Déposée le 16/03/2026, SIREN en cours (1-4 sem.) |
| Banque | Indy sélectionné, à ouvrir dès SIRET reçu |
| Stripe production | Attend SIRET + IBAN Indy |

## Commandes essentielles
```bash
# Statut
pm2 status

# Logs
pm2 logs recupeo --lines 50

# Build (JAMAIS npm run build directement — timeout 60s MCP)
cd /var/www/recupeo && ./scripts/build.sh        # Lance le build async
./scripts/build.sh --status                       # Vérifier 30-60s après

# Installer un package
cd /var/www/recupeo && npm install <pkg> --legacy-peer-deps

# Vérifier HTTP
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

# Lire le suivi projet
cat /var/www/recupeo/project/status/TODO.md
cat /var/www/recupeo/project/status/DONE.md
cat /var/www/recupeo/project/status/BLOCKERS.md
cat /var/www/recupeo/project/status/CHANGELOG.md
cat /var/www/recupeo/project/logs/sessions.md
```

## Règle de déploiement CRITIQUE

Pour écrire du code sur le serveur MCP, TOUJOURS utiliser un heredoc quoté :
```bash
cat > /var/www/recupeo/src/chemin/fichier.ts << 'EOF'
// Le code TypeScript ici — AUCUN échappement nécessaire
// Les backticks, ${variables}, tout passe tel quel
const x = `hello ${world}`
EOF
```
JAMAIS base64 — c'est 10x plus lent et source d'erreurs.

## Variables d'environnement actives (.env)
```
ANTHROPIC_API_KEY      Actif
BREVO_API_KEY          Actif
MONGODB_URI            Actif
NEXT_PUBLIC_GA_ID      Actif (G-89K2QXKP0R)
NEXT_PUBLIC_SERVER_URL Actif
NEXT_PUBLIC_SITE_URL   Actif
NODE_ENV=production    Actif
PAYLOAD_SECRET         Actif
STRIPE_SECRET_KEY      Mode test (sk_test_...)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY  Mode test (pk_test_...)
STRIPE_WEBHOOK_SECRET  Mode test (whsec_...)
PAYPLUG_SECRET_KEY     OBSOLÈTE — à supprimer quand Stripe prod activé
```

## Structure du projet sur le serveur

```
src/
  app/
    api/
      macaution/    (extract, full-report, generate-letters, generate-pdf, pre-diagnostic)
      mataxe/       (extract, full-report, generate-letters, generate-pdf, pre-diagnostic, send-recap)
      monloyer/     (check, generate-letters, generate-pdf)
      retraitia/    (extract, full-report, generate-letters, generate-pdf, pre-diagnostic, preview)
      mapension/    (calculate, full-report, generate-letters)
      payment/create/     <- Stripe Checkout session
      webhooks/stripe/    <- Stripe webhook
    macaution/        (page.tsx, layout.tsx, rapport/page.tsx)
    mataxe/           (page.tsx, layout.tsx, rapport/page.tsx)
    monloyer/         (page.tsx, layout.tsx)
    retraitia/        (page.tsx, layout.tsx, rapport/page.tsx, preview/page.tsx)
    mapension/        (page.tsx, layout.tsx, rapport/page.tsx)
    mentions-legales/ cgu/ confidentialite/
    sitemap.ts        <- 10 URLs auto-générées
    layout.tsx        (fonts, GA4 script, metadata)
    page.tsx          (landing page — 15 sections funnel AIDA)
  components/
    landing/ (15 composants)
      Hero, StatsBar, Marquee, HowItWorks, BriquesGrid,
      CostOfInaction, SocialProof, AITransparency, Commitments,
      AvocatComparison, ReportPreview, TrustLogos,
      Pricing, HomeFAQ, FinalCTA
    layout/      (Navbar, Footer)
    macaution/   (Upload, Extraction, Validation, Form, PreDiag, Paywall, Report, FAQ, Hero — 9 fichiers)
    mataxe/      (Form, PreDiag, Paywall, Report, 6675MAssistant, Upload, Reliability, Hero, Methode, BaseNetteHelper, Transparency, FAQ — 12 fichiers)
    monloyer/    (Form, Result, Upsell, Cities, FAQ, Hero — 6 fichiers)
    retraitia/   (Upload, Extraction, Form, PreDiag, Paywall, Report, FAQ, Hero — 8 fichiers)
    mapension/   (Hero, Form, Result, Paywall, FAQ — 5 fichiers)
    shared/ (5 composants)
      CrossSellBriques — Cross-sell entre briques
      TrustBadges — TrustBadges, TrustBadgesCompact, TrustBanner, LegalDisclaimer
      BriqueHowItWorks — 3 étapes par brique (conditionnel, configs exportées)
      TransparencyBlock — "Ce qu'on vérifie / ne peut pas vérifier" (configs exportées)
      MethodologyNote — Mini-encadré méthodologie sous les résultats
  collections/     (Diagnostics.ts, Users.ts, Media.ts)
  lib/
    analytics.ts     -> Tracking GA4 (29+ events)
    anthropic.ts     -> Client Claude API + Vision
    anonymizer.ts    -> Anonymisation PII
    constants.ts     -> 14 briques (5 actives)
    email.ts         -> Client Brevo (4 templates)
    format.ts        -> fmt() nombres
    ocr.ts           -> OCR Tesseract local
    payment.ts       -> Client Stripe Checkout
    pii-detector.ts  -> Détection PII française
    macaution/       -> schema, types, calculations, prompts, extract-*, anonymize, vetuste (8 fichiers)
    mataxe/          -> schema, types, calculations, anomaly-detection, prompts, reliability, anonymize, extract-types, extract-prompt (11 fichiers)
    monloyer/        -> schema, types, calculations, cities, prompts, pdf-generator (6 fichiers)
    retraitia/       -> schema, types, calculations, anomaly-detection, prompts, extract-*, anonymize, pdf-generator (11 fichiers)
    mapension/       -> types, indices (INSEE 2010-2026), calculations (mois par mois), schema, prompts (5 fichiers)
```

## Home — Architecture funnel AIDA (15 sections)
```
ATTENTION : Hero (mockup dashboard) -> StatsBar (4 stats) -> Marquee
INTÉRÊT : HowItWorks (3 étapes) -> BriquesGrid (14 briques, 5 actives)
DÉSIR : CostOfInaction (3 scénarios chiffrés) -> SocialProof (10 Mds€)
CONFIANCE : AITransparency (4 points) -> Commitments (4 engagements)
DIFFÉRENCIATION : AvocatComparison (tableau 6 critères) -> ReportPreview (mockup rapport) -> TrustLogos
ACTION : Pricing (3 tiers) -> HomeFAQ (8 questions + JSON-LD) -> FinalCTA
```

## Briques — Pattern UX harmonisé
Chaque brique suit ce flow :
```
Hero (mockup desktop hidden lg:block)
-> {conditionnel: BriqueHowItWorks + TrustBadgesCompact} (disparaît dans le flow)
-> Form/Upload -> Result/PreDiag (+ MethodologyNote)
-> Paywall (si anomalies)
-> TransparencyBlock (ou MataxeMethode pour MATAXE)
-> CrossSellBriques -> TrustBanner -> FAQ -> LegalDisclaimer
```

## Design tokens
- **Couleurs** : navy (#0B1426), emerald (#00D68F), slate-text (#1E293B), slate-muted (#64748B), slate-bg (#F7F9FC)
- **Fonts** : `font-heading` (Bricolage Grotesque), `font-body` (DM Sans)
- **Layout** : `max-w-[1200px] mx-auto px-6`
- **CSS** : `.cta-primary`, `.pricing-card`, `.pricing-featured`, `.hero-gradient`, `.brique-card`
- **Format nombres** : `fmt()` de `@/lib/format` (JAMAIS `toLocaleString`)

## 1 chantier en attente + prochaines briques

### Chantier 6 — Activation Stripe Production (30 min, attend SIRET)
**Prérequis** : SIRET reçu + Compte Indy ouvert + IBAN obtenu
1. Compléter onboarding Stripe (SIRET, adresse, IBAN)
2. Récupérer clés prod (sk_live_, pk_live_)
3. Mettre à jour .env (remplacer test -> prod)
4. Reconfigurer webhook en production (whsec_...)
5. Décommenter vérification `paid` dans 4 routes full-report
6. Mettre à jour SIRET dans les 3 pages légales (remplacer placeholder)
7. Supprimer l'ancienne clé PayPlug
8. Rebuild + test paiement réel

### Prochaines briques possibles (briefs dans le projet Claude)
| Brique | Brief | Ticket | Enjeu | Complexité |
|--------|-------|--------|-------|-----------|
| MONCHOMAGE | BRIEF_MONCHOMAGE.md | 69-129€ | 500-3 000€ | ~5h, upload possible |
| MABANQUE | BRIEF_MABANQUE.md | 19-29€ | 200-960€ | ~4h, formulaire pur |
| MONIMPOT | BRIEF_MONIMPOT.md | 39-79€ | 500-6 000€ | ~5h, upload possible |
| MESDROITS | BRIEF_MESDROITS.md | 19-49€ | Variable | ~4h, formulaire pur |
| MAPAIE | BRIEF_MAPAIE.md | 49-129€ | 1 800-7 200€ | ~5h, upload |
| MONDEPART | BRIEF_MONDEPART.md | 69-199€ | 1 000-5 000€ | ~5h, upload |

### Améliorations en attente
- Pictos BriquesGrid : générer via Midjourney (256x256 PNG, transparent, flat/modern, navy/emerald)
- MATAXE + MAPENSION : templates email Brevo
- Dashboard utilisateur + système de comptes
- Blog SEO
- MATAXE : base de données taux communaux (fichier REI DGFiP)
- MAPENSION : API INSEE en temps réel + PDF rapport + email Brevo

## Pour démarrer la conversation

Dis :
- **"J'ai reçu le SIRET, on active Stripe en production"** -> Chantier 6
- **"Chantier 9 — [nom de brique]"** -> 6ème brique
- **"Lis le suivi projet sur le serveur"** -> `cat /var/www/recupeo/project/status/TODO.md`
- **"Lis le brief sur le serveur"** -> `cat /var/www/recupeo/project/BRIEF_NEXT_SESSION.md`
