# 🔧 Stack Technique

## Core

| Couche | Techno | Version | Rôle |
|--------|--------|---------|------|
| Framework | Next.js | 15.5.12 | App Router, SSR, API routes |
| CMS | Payload CMS | 3.79.0 | Admin, collections, auth |
| UI | React | 19.0.0 | Components |
| Style | Tailwind CSS | 3.4.x | Utility-first CSS |
| Typo | Bricolage Grotesque + DM Sans | Google Fonts | Headings + Body |
| DB | MongoDB | 7.0.30 | Via Payload mongoose adapter |
| Runtime | Node.js | 20.20.1 | LTS |

## Services externes (à configurer)

| Service | Usage | Statut | Coût |
|---------|-------|--------|------|
| Anthropic Claude API | Analyse IA des documents | ❌ Clé API à ajouter | ~200€/mois M6 |
| PayPlug Pro | Paiements | ❌ Compte à créer | 30€/mois + 0.5%+0.15€/tx |
| Brevo (ex Sendinblue) | Email transactionnel | ❌ À configurer | Gratuit 300/jour |
| Plausible/Matomo | Analytics RGPD | ❌ À installer | ~9€/mois |

## Structure du projet

```
/var/www/recupeo/
├── .env                          ← Variables d'environnement
├── .next/                        ← Build Next.js (généré)
├── ecosystem.config.cjs          ← Config PM2
├── next.config.mjs               ← Config Next.js + Payload
├── package.json                  ← Dépendances
├── tailwind.config.ts            ← Design tokens
├── tsconfig.json                 ← TypeScript
├── node_modules/                 ← Dépendances (424 packages)
├── project/                      ← 📁 SUIVI PROJET (ce dossier)
├── public/images/                ← Assets statiques
└── src/
    ├── app/
    │   ├── globals.css           ← Styles globaux
    │   ├── layout.tsx            ← Layout racine
    │   ├── page.tsx              ← Landing page
    │   └── (payload)/            ← Admin CMS
    ├── collections/              ← Users, Diagnostics, Reports
    ├── components/
    │   ├── landing/              ← 8 sections landing
    │   └── layout/               ← Navbar, Footer
    ├── lib/
    │   ├── constants.ts          ← 14 briques, stats, pricing
    │   └── utils.ts              ← cn() helper
    └── payload.config.ts         ← Config Payload CMS
```
